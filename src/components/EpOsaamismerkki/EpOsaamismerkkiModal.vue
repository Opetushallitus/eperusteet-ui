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
      </div>
    </template>

    <div class="mb-5">
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

    <div class="float-right">
      <EpButton @click="sulje"
                variant="link">
        {{ $t('peruuta') }}
      </EpButton>
      <EpButton @click="tallenna"
                :show-spinner="tallennetaan"
                :disabled="invalid">
        {{ $t('tallenna') }}
      </EpButton>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpKuvaLataus from '@shared/components/EpKuvaLataus/EpKuvaLataus.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpTiedostoLataus from '@shared/components/EpTiedostoLataus/EpTiedostoLataus.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { OsaamismerkitStore } from '@/stores/OsaamismerkitStore';
import { Validations } from 'vuelidate-property-decorators';
import { requiredLokalisoituTeksti } from '@shared/validators/required';
import * as _ from 'lodash';
import { OsaamismerkkiDto } from '@shared/generated/eperusteet';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import { required } from 'vuelidate/lib/validators';

@Component({
  components: {
    EpDatepicker,
    EpKuvaLataus,
    EpButton,
    EpField,
    EpTiedostoLataus,
    EpMaterialIcon,
    EpMultiSelect,
  },
})
export default class EpOsaamismerkkiModal extends Vue {
  @Prop({ required: true })
  private store!: OsaamismerkitStore;

  private osaamismerkki: OsaamismerkkiDto = {};
  private tallennetaan: boolean = false;

  @Validations()
  validations = {
    osaamismerkki: {
      nimi: {
        ...requiredLokalisoituTeksti(),
      },
    },
  }

  muokkaa(osaamismerkki) {
    if (osaamismerkki) {
      this.osaamismerkki = _.cloneDeep(osaamismerkki);
    }
    (this.$refs['osaamismerkkiModal'] as any).show();
  }

  async tallenna() {
    this.tallennetaan = true;
    try {
      await this.store.updateOsaamismerkki(this.osaamismerkki);
      this.tallennetaan = false;
      this.$success(this.$t('osaamismerkin-paivitys-onnistui') as string);
      await this.store.fetchOsaamismerkit();
      this.sulje();
    }
    catch (err) {
      this.tallennetaan = false;
      this.$fail(this.$t('osaamismerkin-paivitys-epaonnistui') as string);
    }
  }

  sulje() {
    this.clear();
    (this.$refs['osaamismerkkiModal'] as any).hide();
  }

  clear() {
    this.osaamismerkki = {};
  }

  get osaamismerkkiKategoriat() {
    return this.store.kategoriat.value;
    // return _.chain(this.store.kategoriat.value)
    //   .map(kategoria => {
    //     return {
    //       text: this.$kaanna(kategoria.nimi),
    //       value: kategoria,
    //     };
    //   })
    //   .uniqWith(_.isEqual)
    //   .filter('text')
    //   .value();
  }

  get invalid() {
    return this.$v.$invalid;
  }
};
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

</style>
