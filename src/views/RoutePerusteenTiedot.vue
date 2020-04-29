<template>
  <div v-if="!isInitializing && store">
    <EpEditointi :store="store">

      <template v-slot:header="{ }">
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
              <b-table v-if="korvattavatDiaarinumerot"
                       :items="korvattavatDiaarinumerot"
                       :fields="korvattavatFields"
                       responsive
                       borderless
                       striped
                       fixed
                       hover>
                <template v-slot:cell(diaarinumero)="data">
                  {{ data.item }}
                </template>
                <template v-slot:cell(peruste)="data">
                  <span v-if="korvattavatPerusteet[data.item]">
                    {{ $kaanna(korvattavatPerusteet[data.item].nimi) }}
                  </span>
                  <span v-else-if="korvattavatPerusteet[data.item] === null" class="font-italic">
                    {{ $t('ei-eperusteissa') }}
                  </span>
                  <ep-spinner v-else />
                </template>
                <template v-slot:cell(toiminnot)="data">
                  <div class="text-center" v-if="isEditing">
                    <ep-button variant="link" icon="roskalaatikko" @click="poistaKorvattava(data.item)">
                      {{ $t('poista') }}
                    </ep-button>
                  </div>
                </template>
              </b-table>
              <b-input-group v-if="isEditing">
                <b-form-input v-model="korvattavaDiaarinumero"></b-form-input>
                <b-input-group-append>
                  <b-button @click="lisaaDiaarinumero" icon="plus" variant="primary" :disabled="!korvattavaDiaarinumero">
                    {{ $t('lisaa-peruste') }}
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('liitteet-ja-maaraykset')">
              <ep-spinner v-if="!liitteet" />
              <div v-else>
                <div class="lataaliite">{{ $t('lataa-uusi-liitetiedosto') }}</div>
                <div class="liiteohje" v-html="$t('liitetiedosto-ohje')"></div>
                <ep-tiedosto-lataus :fileTypes="['application/pdf']" v-model="file" :as-binary="true" v-if="!isEditing && !file" />
                <div v-if="file">
                  <b-input-group>
                    <b-form-input v-model="liitteenNimi"></b-form-input>
                    <b-input-group-append>
                      <b-button @click="tallennaLiite()" icon="plus" variant="primary" :disabled="!liitteenNimi">
                        {{ $t('lisaa-liite') }}
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                </div>
                <b-table :items="liitteet"
                         :fields="liitetableFields"
                         responsive
                         borderless
                         striped
                         fixed
                         hover>
                  <template v-slot:cell(toiminnot)="data">
                    <div class="text-center" v-if="isEditing">
                      <ep-button variant="link" icon="roskalaatikko" @click="poistaLiite(data.item)">
                        {{ $t('poista') }}
                      </ep-button>
                    </div>
                  </template>
                </b-table>
              </div>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('maarayskirje')">
              <div class="d-flex align-items-center w-100" v-if="isEditing">
                <div class="flex-fill-1 w-100">
                  <ep-multi-select class="w-100" v-model="maarayskirje" :options="liitteet" track-by="id">
                    <template v-slot:singleLabel="{ option }">{{ option.nimi }}</template>
                    <template v-slot:option="{ option }">{{ option.nimi }}</template>
                    <template v-slot:tag="{ option }">{{ option.nimi }}</template>
                  </ep-multi-select>
                </div>
                <b-button @click="data.maarayskirje = null" variant="link" v-if="data.maarayskirje">
                  {{ $t('tyhjenna') }}
                </b-button>
              </div>
              <div v-else-if="maarayskirje">
                <a :href="maarayskirjeUrl" target="_blank" rel="noopener noreferrer">{{ maarayskirje.nimi }}</a>
              </div>
              <div v-else>
                -
              </div>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('muutosmaaraykset')">
              <EpMuutosmaaraykset v-model="data.muutosmaaraykset" 
                                  :is-editing="isEditing"
                                  :liitteet="liitteet" />
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

      </template>
    </EpEditointi>
  </div>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpTiedostoLataus from '@shared/components/EpTiedostoLataus/EpTiedostoLataus.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpMuutosmaaraykset from '@/components/EpMuutosmaaraykset.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Api, Liitetiedostot, Koodisto } from '@shared/api/eperusteet';
import { SallitutKoulutustyyppisiirtymat, LokalisoituTekstiDto } from '@shared/tyypit';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { PerusteEditStore } from '@/stores/PerusteEditStore';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import PerustetyoryhmaSelect from './PerustetyoryhmaSelect.vue';
import EpKoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';

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
    EpKoodistoSelect,
    EpKoulutustyyppiSelect,
    EpMultiSelect,
    EpMuutosmaaraykset,
    EpSpinner,
    EpTiedostoLataus,
    EpToggle,
    PerustetyoryhmaSelect,
  },
})
export default class RouteProjektiTiedot extends PerusteprojektiRoute {
  @Prop({ required: true })
  private perusteetStore!: PerusteetStore;

  private store: EditointiStore | null = null;
  private file: any | null = null;
  private liitteet: any[] | null = null;
  private liitteenNimi = '';
  private korvattavatPerusteet: { [diaari: string]: any } = {};
  private korvattavaDiaarinumero = '';

  get maarayskirje() {
    return this.store?.data.value?.maarayskirje?.liitteet[this.$slang.value] || null;
  }
  
  get maarayskirjeUrl() {
    if (this.maarayskirje) {
      return `/eperusteet-service/api/perusteet/${this.perusteId!}/liitteet/${this.maarayskirje.id}`;
    }
    else {
      return null;
    }
  }

  set maarayskirje(liite: any) {
    this.store!.setData({
      ...this.store!.data.value,
      maarayskirje: {
        liitteet: {
          [this.$slang.value]: liite,
        },
      },
    });
  }

  async onProjektiChange(projektiId: number, perusteId: number) {
    this.store = new EditointiStore(new PerusteEditStore(projektiId, perusteId));
    this.fetchLiitteet();
  }

  async fetchLiitteet() {
    const res = await Liitetiedostot.getAllLiitteet(Number(this.perusteId!));
    this.liitteet = res.data;
  }

  get siirtymat() {
    return SallitutKoulutustyyppisiirtymat;
  }

  get kielet() {
    return UiKielet;
  }

  get data() {
    return this.store?.data?.value || null;
  }

  get tutkintonimikkeet() {
    return this.data?.tutkintonimikkeet || [];
  }

  get korvattavatDiaarinumerot() {
    return this.store?.data?.value?.korvattavatDiaarinumerot || null;
  }

  @Watch('korvattavatDiaarinumerot')
  async fetchKorvattavat(diaarit) {
    const uudet: any = {};
    for (const diaarinumero of diaarit) {
      if (this.korvattavatPerusteet[diaarinumero] === undefined) {
        const res = await this.perusteetStore.findPerusteet({ diaarinumero });
        uudet[diaarinumero] = _.first(res.data) || null;
      }
    }

    this.korvattavatPerusteet = {
      ...this.korvattavatPerusteet,
      ...uudet,
    };
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

  get korvattavatFields() {
    return [{
      key: 'diaarinumero',
      label: this.$t('diaarinumero'),
      thStyle: { width: '20%' },
      sortable: true,
    }, {
      key: 'peruste',
      label: this.$t('perusteen-nimi'),
      sortable: true,
    }, {
      key: 'toiminnot',
      label: '',
      thStyle: { width: '10%' },
      sortable: false,
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
      label: '',
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
    if (!this.file) {
      return;
    }
    const data = new FormData();
    data.append('file', this.file.binary);
    data.set('nimi', this.liitteenNimi);
    data.set('tyyppi', 'tuntematon');
    const res = await Api.request({
      method: 'POST',
      url: `perusteet/${this.perusteId!}/liitteet`,
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    this.fetchLiitteet();
  }

  async poistaLiite(item: any) {
    try {
      await Liitetiedostot._delete(Number(this.perusteId!), item.id);
      this.$success(this.$t('liitetiedoston-poisto-onnistui') as string);
    }
    catch (err) {
      this.$fail(this.$t('liitetiedoston-poisto-epaonnistui') as string);
      console.log(err);
    }
  }

  lisaaDiaarinumero() {
    const data = this.store?.data?.value;
    this.store!.setData({
      ...data,
      korvattavatDiaarinumerot: [
        ...data.korvattavatDiaarinumerot || [],
        this.korvattavaDiaarinumero,
      ],
    });
    this.korvattavaDiaarinumero = '';
  }

  poistaKorvattava(diaarinumero: string) {
    const data = this.store?.data?.value;
    this.store!.setData({
      ...data,
      korvattavatDiaarinumerot: _.reject(data.korvattavatDiaarinumerot, x => x === diaarinumero),
    });
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

.liiteohje {
  color: #666;
  font-size: 0.7rem;
  padding: 8px 0 8px 0;
}

.lataaliite {
  font-size: 0.9rem;
  font-weight: 600;
}

</style>

