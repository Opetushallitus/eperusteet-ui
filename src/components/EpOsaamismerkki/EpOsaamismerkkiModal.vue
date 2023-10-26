<template>
  <b-modal class="backdrop"
           id="osaamismerkkiModal"
           ref="osaamismerkkiModal"
           :no-close-on-backdrop="true"
           :no-enforce-focus="true"
           :lazy="true"
           size="xl"
           :hide-footer="true">
    <template slot="modal-header">
      <div class="row w-100">
        <div class="col">
          <span v-if="osaamismerkki.id" class="mr-2">{{ $t('muokkaa-osaamismerkkiä')}}</span>
          <span v-else class="mr-2">{{ $t('lisaa-osaamismerkki')}}</span>
        </div>
        <div>
          <EpKielivalinta/>
        </div>
        <div class="close-btn clickable ml-3 pt-1" @click="sulje">
          <EpMaterialIcon aria-hidden="false" :aria-label="$t('sulje')">close</EpMaterialIcon>
        </div>
      </div>
    </template>

    <div class="mb-2">
      <b-form-group :label="$t('tila')">
        <div class="d-flex">
          <b-form-checkbox v-model="isJulkinen">
            {{ $t('naytetaan-julkisena') }}
          </b-form-checkbox>
          <span v-if="osaamismerkki.muokattu" class="muokattu-text ml-1">{{ muokkausText + $sdt(osaamismerkki.muokattu)}}</span>
        </div>
      </b-form-group>

      <b-form-group :label="$t('nimi') + ' *'">
        <EpField v-model="osaamismerkki.nimi" :is-editing="true" :validation="$v.osaamismerkki.nimi" :showValidValidation="false"/>
      </b-form-group>

      <b-form-group :label="$t('kategoria') + ' *'">
        <EpMultiSelect :is-editing="true"
                       :options="osaamismerkkiKategoriat"
                       v-model="osaamismerkki.kategoria"
                       :placeholder="$t('kaikki')">
          <template v-slot:singleLabel="{ option }">{{ $kaanna(option.nimi) }}</template>
          <template v-slot:option="{ option }">{{ $kaanna(option.nimi) }}</template>
          <template v-slot:tag="{ option }">{{ $kaanna(option.nimi) }}</template>
        </EpMultiSelect>
      </b-form-group>

      <b-form-group :label="$t('voimassaolo') + ' *'">
        <div class="d-flex align-items-center">
          <EpDatepicker v-model="osaamismerkki.voimassaoloAlkaa" :is-editing="true"/>
          <div class="ml-2 mr-2">-</div>
          <EpDatepicker v-model="osaamismerkki.voimassaoloLoppuu" :is-editing="true"/>
        </div>
      </b-form-group>
    </div>

    <b-form-group :label="$t('osaamistavoitteet') + ' *'">
      <draggable v-bind="defaultDragOptions"
                 tag="div"
                 v-model="osaamismerkki.osaamistavoitteet">
        <div class="row mb-2" v-for="(tavoite, i) in osaamismerkki.osaamistavoitteet" :key="'tavoite'+i">
          <div class="col">
            <EpInput v-model="tavoite.osaamistavoite"
                     :is-editing="true"
                     class="input-wrapper">
              <div class="order-handle m-2" slot="left">
                <EpMaterialIcon>drag_indicator</EpMaterialIcon>
              </div>
            </EpInput>
          </div>
          <div class="col-1">
            <EpButton @click="poistaTavoite(tavoite)"
                       variant="link"
                       icon="delete">
            </EpButton>
          </div>
        </div>
      </draggable>
      <EpButton @click="lisaaTavoite"
                 variant="outline-primary"
                 icon="add">
        {{ $t('lisaa-osaamistavoite') }}
      </EpButton>
    </b-form-group>

    <b-form-group :label="$t('arviointikriteerit') + ' *'">
      <draggable v-bind="defaultDragOptions"
                 tag="div"
                 v-model="osaamismerkki.arviointikriteerit">
        <div class="row mb-2" v-for="(kriteeri, i) in osaamismerkki.arviointikriteerit" :key="'kriteeri'+i">
          <div class="col">
            <EpInput v-model="kriteeri.arviointikriteeri"
                     :is-editing="true"
                     class="input-wrapper">
              <div class="order-handle m-2" slot="left">
                <EpMaterialIcon>drag_indicator</EpMaterialIcon>
              </div>
            </EpInput>
          </div>
          <div class="col-1">
            <EpButton @click="poistaKriteeri(kriteeri)"
                      variant="link"
                      icon="delete">
            </EpButton>
          </div>
        </div>
      </draggable>
      <EpButton @click="lisaaKriteeri"
                 variant="outline-primary"
                 icon="add">
        {{ $t('lisaa-arviointikriteeri') }}
      </EpButton>
    </b-form-group>

    <div class="float-right">
      <EpButton @click="sulje"
                variant="link">
        {{ $t('peruuta') }}
      </EpButton>
      <EpButton v-if="osaamismerkki.id"
                @click="poistaOsaamismerkki"
                :show-spinner="tallennetaan"
                :disabled="isJulkinen">
        {{ $t('poista') }}
      </EpButton>
      <EpButton @click="tallenna"
                class="ml-2"
                :show-spinner="tallennetaan"
                :disabled="invalid">
        {{ $t('tallenna') }}
      </EpButton>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import draggable from 'vuedraggable';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { OsaamismerkitStore } from '@/stores/OsaamismerkitStore';
import { Validations } from 'vuelidate-property-decorators';
import { notNull, requiredLokalisoituTeksti } from '@shared/validators/required';
import * as _ from 'lodash';
import { OsaamismerkkiDto, OsaamismerkkiDtoTilaEnum } from '@shared/generated/eperusteet';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { required } from 'vuelidate/lib/validators';
import { Kieli } from '@shared/tyypit';

@Component({
  components: {
    draggable,
    EpDatepicker,
    EpButton,
    EpField,
    EpMaterialIcon,
    EpMultiSelect,
    EpInput,
    EpKielivalinta,
  },
})
export default class EpOsaamismerkkiModal extends Vue {
  @Prop({ required: true })
  private store!: OsaamismerkitStore;

  private osaamismerkki: OsaamismerkkiDto = {};
  private tallennetaan: boolean = false;
  private requiredKielet: Kieli[] = [Kieli.fi, Kieli.sv]

  @Validations()
  validations = {
    osaamismerkki: {
      nimi: requiredLokalisoituTeksti(this.requiredKielet),
      kategoria: notNull(),
      voimassaoloAlkaa: notNull(),
      osaamistavoitteet: {
        $each: {
          osaamistavoite: requiredLokalisoituTeksti(this.requiredKielet),
        },
        required,
      },
      arviointikriteerit: {
        $each: {
          arviointikriteeri: requiredLokalisoituTeksti(this.requiredKielet),
        },
        required,
      },
    },
  }

  init() {
    this.osaamismerkki = {
      osaamistavoitteet: [],
      arviointikriteerit: [],
    };
    this.osaamismerkki.tila = OsaamismerkkiDtoTilaEnum.LAADINTA;
  }

  get defaultDragOptions() {
    return {
      animation: 300,
      emptyInsertThreshold: 10,
      handle: '.order-handle',
      ghostClass: 'dragged',
      disabled: false,
    };
  }

  avaaModal(osaamismerkki) {
    if (osaamismerkki) {
      this.osaamismerkki = _.cloneDeep(osaamismerkki);
    }
    else {
      this.init();
    }
    (this.$refs['osaamismerkkiModal'] as any).show();
  }

  async tallenna() {
    this.tallennetaan = true;
    try {
      await this.store.updateOsaamismerkki(this.osaamismerkki);
      this.tallennetaan = false;
      this.$success(this.$t('osaamismerkin-paivitys-onnistui') as string);
      await this.store.updateOsaamismerkkiQuery(this.store.options.value);
      this.sulje();
    }
    catch (err) {
      this.tallennetaan = false;
      this.$fail(this.$t('osaamismerkin-paivitys-epaonnistui') as string);
    }
  }

  async poistaOsaamismerkki() {
    try {
      await this.store.deleteOsaamismerkki(this.osaamismerkki.id);
      this.tallennetaan = false;
      this.$success(this.$t('osaamismerkin-poistaminen-onnistui') as string);
      await this.store.updateOsaamismerkkiQuery(this.store.options.value);
      this.sulje();
    }
    catch (err) {
      this.tallennetaan = false;
      this.$fail(this.$t('osaamismerkin-poistaminen-epaonnistui') as string);
    }
  }

  sulje() {
    this.osaamismerkki = {};
    (this.$refs['osaamismerkkiModal'] as any).hide();
  }

  poistaTavoite(poistettavaTavoite) {
    this.osaamismerkki.osaamistavoitteet = _.filter(this.osaamismerkki.osaamistavoitteet, (tavoite) => tavoite !== poistettavaTavoite);
  }

  lisaaTavoite() {
    this.osaamismerkki.osaamistavoitteet?.push({
      osaamistavoite: undefined,
    });
  }

  poistaKriteeri(poistettavaKriteeri) {
    this.osaamismerkki.arviointikriteerit = _.filter(this.osaamismerkki.arviointikriteerit, (kriteeri) => kriteeri !== poistettavaKriteeri);
  }

  lisaaKriteeri() {
    this.osaamismerkki.arviointikriteerit?.push({
      arviointikriteeri: undefined,
    });
  }

  get isJulkinen() {
    return this.osaamismerkki.tila === OsaamismerkkiDtoTilaEnum.JULKAISTU;
  }

  set isJulkinen(tila) {
    this.osaamismerkki.tila = tila ? OsaamismerkkiDtoTilaEnum.JULKAISTU : OsaamismerkkiDtoTilaEnum.LAADINTA;
  }

  get osaamismerkkiKategoriat() {
    return this.store.kategoriat.value;
  }

  get invalid() {
    return this.$v.$invalid;
  }

  get muokkausText() {
    return ' - ' + this.$t('muokannut-viimeksi') + ': ' + this.osaamismerkki.muokkaaja + ' ';
  }
};
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.muokattu-text {
  color: $gray-lighten-12;
}

</style>
