<template>
  <div v-if="!isInitializing && store">
    <EpEditointi :store="store">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $t('oppaan-tiedot') }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">
        <h3>{{ $t('perustiedot') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('oppaan-nimi')+'*'">
                <ep-input v-model="data.peruste.nimi"
                          type="localized"
                          :is-editing="isEditing"
                          :validation="validation.peruste.nimi"></ep-input>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('opastyoryhma')+'*'">
                <perustetyoryhma-select v-model="data.ryhmaOid"
                                        :ulkopuoliset-store="ulkopuolisetStore"
                                        :is-editing="isEditing" />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row no-gutters>
             <b-col lg="6">
              <b-form-group :label="$t('koulutustyyppi')" class="pr-5">
                <EpMultiListSelect v-model="data.peruste.oppaanKoulutustyypit"
                           :is-editing="isEditing"
                           :items="koulutustyypit"
                           :required="false">
                  <template slot="singleLabel" slot-scope="{ option }">
                    <span class="text-nowrap">
                      <EpColorIndicator :size="10" :kind="ktToRyhma(option.value)" />
                      <span class="ml-2">{{ option.text }}</span>
                    </span>
                  </template>
                  <template slot="option" slot-scope="{ option }">
                    <span class="text-nowrap">
                      <EpColorIndicator :size="10" :kind="ktToRyhma(option.value)" />
                      <span class="ml-2">{{ option.text }}</span>
                    </span>
                  </template>
                  <template slot="lisaaTeksti">
                    {{$t('lisaa-koulutus-tutkintotyyppi')}}
                  </template>
                </EpMultiListSelect>
                <span class="asettamatta" v-if="!isEditing && (!data.peruste.oppaanKoulutustyypit || data.peruste.oppaanKoulutustyypit.length === 0)">{{$t('ei-asetettu')}}</span>
              </b-form-group>
             </b-col>

             <b-col lg="6">
              <b-form-group :label="$t('peruste')" class="pr-5">
                <EpMultiListSelect v-model="data.peruste.oppaanPerusteet"
                           :is-editing="isEditing"
                           :items="perusteet"
                           :required="false">
                  <template slot="lisaaTeksti">
                    {{$t('lisaa-peruste')}}
                  </template>
                </EpMultiListSelect>
                <span class="asettamatta" v-if="!isEditing && (!data.peruste.oppaanPerusteet || data.peruste.oppaanPerusteet.length === 0)">{{$t('ei-asetettu')}}</span>
              </b-form-group>
             </b-col>
          </b-row>

          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('oppaan-kielet')">
                <b-form-checkbox-group v-if="isEditing" v-model="data.peruste.kielet" stacked>
                  <b-form-checkbox v-for="kieli in kielet" :key="kieli" :value="kieli">
                    {{ $t(kieli) }}
                  </b-form-checkbox>
                </b-form-checkbox-group>
                <div v-else class="text-nowrap">
                  <span v-for="(kieli, idx) in data.peruste.kielet" :key="kieli" :value="kieli">
                    {{ $t(kieli) }}<span class="mr-0" v-if="idx < data.peruste.kielet.length - 1">,</span>
                  </span>
                  <span class="asettamatta" v-if="!isEditing && (!data.peruste.kielet || data.peruste.kielet.length === 0)">{{$t('ei-asetettu')}}</span>
                </div>
              </b-form-group>
            </b-col>

            <b-col lg="6">
              <b-form-group :label="$t('voimassaolo')">
              <div class="asettamatta" v-if="!data.peruste.voimassaoloAlkaa && !data.peruste.voimassaoloLoppuu && !isEditing">
                {{$t('ei-asetettu')}}
              </div>
              <div v-else class="d-flex align-items-center">
                <ep-datepicker v-model="data.peruste.voimassaoloAlkaa" :is-editing="isEditing"/>
                <div class="ml-2 mr-2">-</div>
                <ep-datepicker v-model="data.peruste.voimassaoloLoppuu" :is-editing="isEditing"/>
              </div>
            </b-form-group>
            </b-col>
          </b-row>

        </b-container>

        <h3 class="mt-4">{{ $t('esikatselu-ja-lataus') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col lg="6">
              <ep-toggle v-model="data.esikatseltavissa" :is-editing="isEditing" v-if="isEditing || !data.esikatseltavissa">
                {{$t('salli-oppaan-esikatselu')}}
              </ep-toggle>
              <ep-external-link :url="data.esikatseluUrl" v-if="!isEditing && data.esikatseltavissa">
                {{$t('esikatsele-opasta')}}
              </ep-external-link>
            </b-col>
            <b-col lg="6" v-if="!isEditing">
              <b-form-group :label="$t('oppaan-lataus')">
                <ep-button variant="primary" @click="lataa">{{ $t('lataa-opas-json') }}</ep-button>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>

        <b-container fluid>
          <b-row no-gutters>
            <b-col lg="8">
              <h3 class="mt-5">{{ $t('oppaan-liittaminen-perusteen-sisaltoihin') }}</h3>
              <div class="mb-4">{{ $t('oppaan-liittaminen-perusteen-sisaltoihin-kuvaus') }}</div>
            </b-col>
          </b-row>
        </b-container>

        <b-container fluid>
          <template v-if="isEditing || (tutkinnonosaKoodit.length > 0 || osaamisalaKoodit.length > 0)">
            <h4>{{$t('ammatillinen-koulutus')}}</h4>
              <b-row no-gutters>
                <b-col lg="8">
                  <div class="koodiryhma">
                    <EpKoodistoSelectTable
                      v-if="isEditing || tutkinnonosaKoodit.length > 0"
                      class="mb-4"
                      :store="tutkinnonOsatKoodisto"
                      :isEditing="isEditing"
                      v-model="tutkinnonosaKoodit"
                      @remove="removeOppaanKoodi">
                      <h4 slot="header">{{$t('tutkinnonosat')}}</h4>
                      <span slot="button-text">{{$t('lisaa-tutkinnon-osa')}}</span>
                    </EpKoodistoSelectTable>
                    <EpKoodistoSelectTable
                      v-if="isEditing || osaamisalaKoodit.length > 0"
                      :store="osaamisalaKoodisto"
                      :isEditing="isEditing"
                      v-model="osaamisalaKoodit"
                      @remove="removeOppaanKoodi">
                      <h4 slot="header">{{$t('osaamisalat')}}</h4>
                      <span slot="button-text">{{$t('lisaa-osaamisala')}}</span>
                    </EpKoodistoSelectTable>
                  </div>
                </b-col>
              </b-row>
          </template>

          <template v-if="isEditing || oppiaineKoodit.length > 0">
            <h4>{{$t('lukiokoulutus')}}</h4>

            <b-row no-gutters>
              <b-col lg="8">
                <div class="koodiryhma">
                <EpKoodistoSelectTable
                  :store="oppiaineKoodisto"
                  :isEditing="isEditing"
                  v-model="oppiaineKoodit"
                  @remove="removeOppaanKoodi"
                  :showKoodiArvo="false">
                  <h4 slot="header">{{$t('oppiaineet')}}</h4>
                  <span slot="button-text">{{$t('lisaa-oppiaine')}}</span>
                </EpKoodistoSelectTable>
                </div>
              </b-col>
            </b-row>
          </template>

          <template v-if="isEditing || opintokokonaisuusKoodit.length > 0">
            <h4>{{$t('vapaa-sivistystyo')}}</h4>

            <b-row no-gutters>
              <b-col lg="8">
                <div class="koodiryhma">
                <EpKoodistoSelectTable
                  :store="opintokokonaisuusKoodisto"
                  :isEditing="isEditing"
                  v-model="opintokokonaisuusKoodit"
                  @remove="removeOppaanKoodi"
                  :showKoodiArvo="false">
                  <h4 slot="header">{{$t('opintokokonaisuudet')}}</h4>
                  <span slot="button-text">{{$t('lisaa-opintokokonaisuus')}}</span>
                </EpKoodistoSelectTable>
                </div>
              </b-col>
            </b-row>
          </template>

          <template v-if="isEditing || koulutuksenosaKoodit.length > 0">
            <h4>{{$t('tutkintokoulutukseen-valmentava-koulutus')}}</h4>

            <b-row no-gutters>
              <b-col lg="8">
                <div class="koodiryhma">
                  <EpKoodistoSelectTable
                    :store="koulutuksenosaKoodisto"
                    :isEditing="isEditing"
                    v-model="koulutuksenosaKoodit"
                    @remove="removeOppaanKoodi"
                    :showKoodiArvo="false">
                    <h4 slot="header">{{$t('koulutuksenosat')}}</h4>
                    <span slot="button-text">{{$t('lisaa-koulutuksenosa')}}</span>
                  </EpKoodistoSelectTable>
                </div>
              </b-col>
            </b-row>
          </template>
        </b-container>

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
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { OpasEditStore } from '@/stores/OpasEditStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import PerustetyoryhmaSelect from './PerustetyoryhmaSelect.vue';
import EpKoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import _ from 'lodash';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import { themes, koulutustyyppiRyhmaSort } from '@shared/utils/perusteet';
import { EperusteetKoulutustyypit } from '@/utils/perusteet';
import EpMultiListSelect, { MultiListSelectItem } from '@shared/components/forms/EpMultiListSelect.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { UiKielet } from '@shared/stores/kieli';
import { MaintenanceStore } from '@/stores/MaintenanceStore';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import EpKoodistoSelectTable from '@shared/components/EpKoodistoSelect/EpKoodistoSelectTable.vue';
import { Koodisto } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpInput,
    EpSpinner,
    EpToggle,
    PerustetyoryhmaSelect,
    EpKoulutustyyppiSelect,
    EpDatepicker,
    EpMultiListSelect,
    EpColorIndicator,
    EpExternalLink,
    EpKoodistoSelectTable,
  },
})
export default class RouteOppaanTiedot extends PerusteprojektiRoute {
  @Prop({ required: true })
  ulkopuolisetStore!: UlkopuolisetStore;

  @Prop({ required: true })
  perusteprojektiStore!: PerusteprojektiStore;

  private store: EditointiStore | null = null;
  private maintenanceStore: MaintenanceStore | null = null;

  async mounted() {
    await this.perusteprojektiStore.fetchPohjaProjektit();
  }

  async onProjektiChange(projektiId: number, perusteId: number) {
    this.store = new EditointiStore(new OpasEditStore(projektiId, perusteId, this.perusteStore));
    this.maintenanceStore = new MaintenanceStore(projektiId, perusteId);
  }

  get kielet() {
    return UiKielet;
  }

  ktToRyhma(koulutustyyppi) {
    return themes[koulutustyyppi];
  }

  get koulutustyypit() {
    return _.chain(EperusteetKoulutustyypit)
      .map(koulutustyyppi => {
        return {
          value: koulutustyyppi,
          text: this.$t(koulutustyyppi),
        } as MultiListSelectItem;
      })
      .sortBy(item => koulutustyyppiRyhmaSort[this.ktToRyhma(item.value)])
      .value();
  }

  get perusteet() {
    return _.chain(this.perusteprojektiStore.perusteet.value)
      .map(peruste => {
        return {
          value: {
            id: peruste.id,
          },
          text: this.$kaanna((peruste as any).nimi),
        } as MultiListSelectItem;
      })
      .sortBy(peruste => _.toLower(peruste.text))
      .value();
  }

  async lataa() {
    await this.maintenanceStore?.exportPeruste();
  }

  private tutkinnonOsatKoodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('tutkinnonosat', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  private osaamisalaKoodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('osaamisala', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  private oppiaineKoodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('oppiaineetjaoppimaaratlops2021', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  private opintokokonaisuusKoodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('opintokokonaisuusnimet', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  private koulutuksenosaKoodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('koulutuksenosattuva', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  get tutkinnonosaKoodit() {
    return _.chain(this.oppaanKiinnitetytKoodit)
      .filter(kiinnitettyKoodi => kiinnitettyKoodi.kiinnitettyKoodiTyyppi === 'TUTKINNONOSA')
      .map('koodi')
      .value();
  }

  set tutkinnonosaKoodit(koodit) {
    this.asetaOppaanKoodit(_.map(koodit, koodi => {
      return {
        kiinnitettyKoodiTyyppi: 'TUTKINNONOSA',
        koodi,
      };
    }));
  }

  get osaamisalaKoodit() {
    return _.chain(this.oppaanKiinnitetytKoodit)
      .filter(kiinnitettyKoodi => kiinnitettyKoodi.kiinnitettyKoodiTyyppi === 'OSAAMISALA')
      .map('koodi')
      .value();
  }

  set osaamisalaKoodit(koodit) {
    this.asetaOppaanKoodit(_.map(koodit, koodi => {
      return {
        kiinnitettyKoodiTyyppi: 'OSAAMISALA',
        koodi,
      };
    }));
  }

  get oppiaineKoodit() {
    return _.chain(this.oppaanKiinnitetytKoodit)
      .filter(kiinnitettyKoodi => kiinnitettyKoodi.kiinnitettyKoodiTyyppi === 'OPPIAINE')
      .map('koodi')
      .value();
  }

  set oppiaineKoodit(koodit) {
    this.asetaOppaanKoodit(_.map(koodit, koodi => {
      return {
        kiinnitettyKoodiTyyppi: 'OPPIAINE',
        koodi,
      };
    }));
  }

  get opintokokonaisuusKoodit() {
    return _.chain(this.oppaanKiinnitetytKoodit)
      .filter(kiinnitettyKoodi => kiinnitettyKoodi.kiinnitettyKoodiTyyppi === 'OPINTOKOKONAISUUS')
      .map('koodi')
      .value();
  }

  set opintokokonaisuusKoodit(koodit) {
    this.asetaOppaanKoodit(_.map(koodit, koodi => {
      return {
        kiinnitettyKoodiTyyppi: 'OPINTOKOKONAISUUS',
        koodi,
      };
    }));
  }

  get koulutuksenosaKoodit() {
    return _.chain(this.oppaanKiinnitetytKoodit)
      .filter(kiinnitettyKoodi => kiinnitettyKoodi.kiinnitettyKoodiTyyppi === 'KOULUTUKSENOSA')
      .map('koodi')
      .value();
  }

  set koulutuksenosaKoodit(koodit) {
    this.asetaOppaanKoodit(_.map(koodit, koodi => {
      return {
        kiinnitettyKoodiTyyppi: 'KOULUTUKSENOSA',
        koodi,
      };
    }));
  }

  get oppaanKiinnitetytKoodit() {
    return this.store!.data.value.peruste.oppaanSisalto.oppaanKiinnitetytKoodit;
  }

  get oppaanKiinnitetytKooditUris() {
    return _.map(this.oppaanKiinnitetytKoodit, okk => okk.koodi.uri);
  }

  asetaOppaanKoodit(kiinnitettyKoodi) {
    this.store!.setData(
      {
        ...this.store?.data.value,
        peruste: {
          ...this.store?.data.value.peruste,
          oppaanSisalto: {
            ...this.store?.data.value.peruste.oppaanSisalto,
            oppaanKiinnitetytKoodit: [
              ...this.store?.data.value.peruste.oppaanSisalto.oppaanKiinnitetytKoodit,
              ..._.filter(kiinnitettyKoodi, koodi => !_.includes(this.oppaanKiinnitetytKooditUris, koodi.koodi.uri)),
            ],
          },
        },
      },
    );
  }

  removeOppaanKoodi(koodi) {
    this.store!.setData(
      {
        ...this.store?.data.value,
        peruste: {
          ...this.store?.data.value.peruste,
          oppaanSisalto: {
            ...this.store?.data.value.peruste.oppaanSisalto,
            oppaanKiinnitetytKoodit: _.filter(this.store?.data.value.peruste.oppaanSisalto.oppaanKiinnitetytKoodit, kiinnitettyKoodi => kiinnitettyKoodi.koodi.uri !== koodi.uri),
          },
        },
      },
    );
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

  .asettamatta {
    font-style: italic;
    color: $gray-lighten-2;
  }

  .koodiryhma {
    padding: 1rem;
    border: 1px solid $gray-lighten-3;
    margin-bottom: 2rem;
  }
</style>
