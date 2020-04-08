<template>
  <div v-if="!isInitializing && store">
    <EpEditointi :store="store">

      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $t('perusteen-tiedot') }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">
        <h3>{{ $t('perustiedot') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col>
              <b-form-group :label="$t('perusteen-nimi') + '*'">
                <ep-input v-model="data.nimi"
                          :is-editing="isEditing"
                          :validation="validation.nimi"></ep-input>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('diaarinumero')">
                <ep-input v-model="data.diaarinumero"
                          type="string"
                          :is-editing="isEditing"
                          :validation="validation.diaarinumero"></ep-input>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('maarayksen-paatospaivamaara')">
                <ep-datepicker v-model="data.paatospvm" :is-editing="isEditing" />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('voimassaolo')">
                <div class="d-flex align-items-center">
                  <ep-datepicker v-model="data.voimassaoloAlkaa" :is-editing="isEditing" />
                  <div class="ml-2 mr-2">-</div>
                  <ep-datepicker v-model="data.voimassaoloLoppuu" :is-editing="isEditing" />
                </div>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('koulutustyyppi')">
                <ep-koulutustyyppi-select v-model="data.koulutustyyppi"
                                          :koulutustyypit="siirtymat[data.koulutustyyppi]"
                                          :is-editing="isEditing && !!siirtymat[data.koulutustyyppi]" />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('perusteen-kielet')">
                <b-form-checkbox-group v-if="isEditing" v-model="data.kielet" stacked>
                  <b-form-checkbox v-for="kieli in kielet" :key="kieli" :value="kieli">
                    {{ $t(kieli) }}
                  </b-form-checkbox>
                </b-form-checkbox-group>
                <div v-else class="text-nowrap">
                  <span v-for="(kieli, idx) in data.kielet" :key="kieli" :value="kieli">
                    {{ $t(kieli) }}<span class="mr-0" v-if="idx < data.kielet.length - 1">,</span>
                  </span>
                </div>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('koulutusvienti')">
                <b-form-checkbox v-model="data.koulutusvienti" v-if="isEditing">
                </b-form-checkbox>
                <div v-else>{{ $t('' + data.koulutusvienti) }}</div>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>

        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('tutkinnon-suorittaneen-osaaminen')">
              <ep-content
                v-model="data.kvliite.suorittaneenOsaaminen"
                layout="normal"
                :is-editable="isEditing"></ep-content>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('tyotehtavat-joissa-voi-toimia')">
              <ep-content
                v-model="data.kvliite.tyotehtavatJoissaVoiToimia"
                layout="normal"
                :is-editable="isEditing"></ep-content>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('peruste-koulutukset')">
              <b-table striped
                show-empty
                       :items="data.koulutukset"
                       :fields="koulutuksetFields"
                       :empty-text="$t('ei-koulutuskoodeja') ">
                <template v-slot:empty="">
                  <h4>{{ $t('ei-koulutuskoodeja') }}</h4>
                </template>
                <template v-slot:cell(koodi)="data">
                  <span class="font-weight-bold">{{ data.item.koulutuskoodiArvo }}</span>
                </template>
                <template v-slot:cell(nimi)="data">
                  {{ $kaanna(data.item.nimi) }}
                </template>
              </b-table>
              <ep-koodisto-select @add="addKoulutuskoodi(data, $event)"
                :store="koulutuskoodisto"
                v-if="isEditing">
                <template v-slot:default="{ open }">
                  <ep-button @click="open" icon="plus" variant="outline">
                    {{ $t('lisaa-koulutus') }}
                  </ep-button>
                </template>
              </ep-koodisto-select>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('korvattavat-perusteet')">
              TBD
            </b-form-group>
          </b-col>
        </b-row>

        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('liitteet')">
              <ep-spinner v-if="!liitteet" />
              <div v-else>
                <b-table :items="liitteet"
                         :fields="liitetableFields" 
                         responsive
                         borderless
                         striped
                         fixed
                         hover>
                  <template v-slot:cell(toiminnot)="data">
                    <div class="text-center">
                      <ep-button variant="link" icon="roskalaatikko" @click="poistaLiite(data)">
                      </ep-button>
                    </div>
                  </template>
                </b-table>
                <b-form-file
                  v-if="!file"
                  v-model="file"
                  :state="Boolean(file)"
                  :placeholder="$t('lisaa-liitetiedosto')"
                  :drop-placeholder="$t('lisaa-liitetiedosto')" />
                <div v-else>
                  <b-form-group :label="$t('uusi-liite')">
                    <b-input-group>
                      <b-input v-model="liitteenNimi"></b-input>
                      <b-button variant="primary" @click="tallennaLiite()" :disabled="!liitteenNimi">
                        {{ $t('tallenna') }}
                      </b-button>
                    </b-input-group>
                  </b-form-group>
                </div>
                
              </div>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('maarayskirje')">
              TBD
            </b-form-group>
          </b-col>
        </b-row>

        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('muutosmaaraykset')">
              TBD
            </b-form-group>
          </b-col>
        </b-row>

        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('osaamisalat')">
              <div class="text-muted font-size-small">
                {{ $t('lisaa-tai-poista-osaamisala') }} <router-link :to="{ name: 'muodostuminen' }">{{ $t('tutkinnon-muodostumisessa') }}</router-link>
              </div>
              <b-table striped
                show-empty
                       :items="osaamisalat"
                       :fields="fields"
                       :empty-text="$t('ei-kiinnitettyja-osaamisaloja')">
                <template v-slot:cell(koodi)="data">
                  <span class="font-weight-bold">{{ data.item.arvo }}</span>
                </template>
                <template v-slot:cell(nimi)="data">
                  {{ $kaanna(data.item.nimi) }}
                </template>
              </b-table>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('tutkintonimikkeet')">
              <div class="text-muted font-size-small">
                {{ $t('lisaa-tai-poista-tutkintonimike') }} <router-link :to="{ name: 'muodostuminen' }">{{ $t('tutkinnon-muodostumisessa') }}</router-link>
              </div>
              <b-table striped
                show-empty
                       :items="tutkintonimikkeet"
                       :fields="fields"
                       :empty-text="$t('ei-kiinnitettyja-tutkintonimikkeita')">
                <template v-slot:cell(koodi)="data">
                  <span class="font-weight-bold">{{ data.item.arvo }}</span>
                </template>
                <template v-slot:cell(nimi)="data">
                  {{ $kaanna(data.item.nimi) }}
                </template>
              </b-table>
            </b-form-group>
          </b-col>
        </b-row>

        <pre>{{ data }}</pre>
      </template>
    </EpEditointi>
  </div>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Liitetiedostot } from '@shared/api/eperusteet';
import { SallitutKoulutustyyppisiirtymat, LokalisoituTekstiDto } from '@shared/tyypit';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { PerusteEditStore } from '@/stores/PerusteEditStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import PerustetyoryhmaSelect from './PerustetyoryhmaSelect.vue';
import EpKoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { Koodisto } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { UiKielet } from '@shared/stores/kieli';
import _ from 'lodash';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpDatepicker,
    EpEditointi,
    EpInput,
    EpSpinner,
    EpToggle,
    EpKoodistoSelect,
    EpKoulutustyyppiSelect,
    PerustetyoryhmaSelect,
  },
})
export default class RouteProjektiTiedot extends PerusteprojektiRoute {
  private store: EditointiStore | null = null;
  private file: any | null = null;
  private liitteet: any[] | null = null;
  private liitteenNimi = '';

  async onProjektiChange(projektiId: number, perusteId: number) {
    this.store = new EditointiStore(new PerusteEditStore(projektiId, perusteId));
    const res = await Liitetiedostot.getAllLiitteet(perusteId);
    this.liitteet = res.data;
  }

  get siirtymat() {
    return SallitutKoulutustyyppisiirtymat;
  }

  get kielet() {
    return UiKielet;
  }

  get data() {
    return this.store?.data?.value;
  }

  get tutkintonimikkeet() {
    return this.data?.tutkintonimikkeet || [];
  }

  get osaamisalat() {
    return this.data?.osaamisalat || [];
  }

  get fields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
    }, {
      key: 'koodi',
      label: this.$t('koodi'),
    }];
  }

  get koulutuksetFields() {
    return [{
      key: 'koodi',
      label: this.$t('koodi'),
    }, {
      key: 'nimi',
      label: this.$t('koulutuksen-nimi'),
    }];
  }

  get liitetableFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
      thStyle: { width: '60%' },
      sortable: true,
    }, {
      key: 'luotu',
      label: this.$t('julkaistu'),
      sortable: true,
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$sdt(value);
      },
    }, {
      key: 'toiminnot',
      label: this.$t('toiminnot'),
      thStyle: { width: '10%' },
      sortable: false,
    }];
  }

  private koulutuskoodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('koulutus', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  addKoulutuskoodi(data, koodi) {
    data.koulutukset = [...data.koulutukset, {
      nimi: koodi.nimi,
      koulutuskoodiUri: koodi.uri,
      koulutuskoodiArvo: koodi.arvo,
    }];
  }

  async tallennaLiite() {
    const data = new FormData();
    data.append('file', this.file);
    await Liitetiedostot.uploadLiite(this.perusteId!, this.liitteenNimi, data, 'tuntematon');
  }

  async poistaLiite(item: any) {
  }

}

</script>

<style lang="scss" scoped>
.valiviiva {
  display: block;
  height: 1px;
  width: 10px;
  border-top: 1px solid black;
}
</style>
