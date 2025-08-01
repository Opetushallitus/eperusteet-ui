<template>
  <div v-if="!isInitializing && store">
    <EpEditointi :store="store">
      <template #header>
        <h2 class="m-0">
          {{ $t('oppaan-tiedot') }}
        </h2>
      </template>
      <template #default="{ data, isEditing, validation }">
        <h3>{{ $t('perustiedot') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('oppaan-nimi')+'*'">
                <ep-input
                  v-model="data.peruste.nimi"
                  type="localized"
                  :is-editing="isEditing"
                  :validation="validation.peruste.nimi"
                />
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('opastyoryhma')+'*'">
                <perustetyoryhma-select
                  v-model="data.ryhmaOid"
                  :ulkopuoliset-store="ulkopuolisetStore"
                  :is-editing="isEditing"
                />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row
            v-if="oppaanTyyppiTietoaPalvelusta || isEditing"
            no-gutters
            class="mt-4"
          >
            <b-col lg="6">
              <b-form-group :label="$t('sisallonhallinta')">
                <b-form-checkbox-group
                  v-if="isEditing"
                  v-model="oppaanTyyppi"
                  stacked
                >
                  <b-form-checkbox
                    v-for="tyyppi in oppaanTyypit"
                    :key="tyyppi"
                    :value="tyyppi"
                  >
                    {{ $t('oppaan-tyyppi-' + tyyppi) }}
                  </b-form-checkbox>
                </b-form-checkbox-group>
                <div v-if="oppaanTyyppiTietoaPalvelusta && !isEditing">
                  {{ $t('oppaan-tyyppi-' + oppaanTyyppi[0]) }}
                </div>
              </b-form-group>
            </b-col>
            <b-col
              v-if="oppaanTyyppiTietoaPalvelusta"
              lg="6"
            >
              <b-form-group :label="$t('tietoa-palvelusta-etusivu-teksti')">
                <ep-content
                  v-model="data.peruste.tietoapalvelustaKuvaus"
                  layout="simplified"
                  :is-editable="isEditing"
                />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row
            no-gutters
            class="mt-4"
          >
            <b-col lg="6">
              <b-form-group
                :label="$t('koulutustyyppi')"
                class="pr-5"
              >
                <EpMultiListSelect
                  v-model="data.peruste.oppaanKoulutustyypit"
                  :is-editing="isEditing"
                  :items="koulutustyypit"
                  :required="false"
                >
                  <template #singleLabel="{ option }">
                    <span class="text-nowrap">
                      <EpColorIndicator
                        :size="10"
                        :kind="ktToRyhma(option.value)"
                      />
                      <span class="ml-2">{{ option.text }}</span>
                    </span>
                  </template>
                  <template #option="{ option }">
                    <span class="text-nowrap">
                      <EpColorIndicator
                        :size="10"
                        :kind="ktToRyhma(option.value)"
                      />
                      <span class="ml-2">{{ option.text }}</span>
                    </span>
                  </template>
                  <template #lisaaTeksti>
                    {{ $t('lisaa-koulutus-tutkintotyyppi') }}
                  </template>
                </EpMultiListSelect>
                <span
                  v-if="!isEditing && (!data.peruste.oppaanKoulutustyypit || data.peruste.oppaanKoulutustyypit.length === 0)"
                  class="asettamatta"
                >{{ $t('ei-asetettu') }}</span>
              </b-form-group>
            </b-col>

            <b-col lg="6">
              <b-form-group
                :label="$t('peruste')"
                class="pr-5"
              >
                <EpMultiListSelect
                  v-model="data.peruste.oppaanPerusteet"
                  :is-editing="isEditing"
                  :items="perusteet"
                  :required="false"
                >
                  <template #lisaaTeksti>
                    {{ $t('lisaa-peruste') }}
                  </template>
                </EpMultiListSelect>
                <span
                  v-if="!isEditing && (!data.peruste.oppaanPerusteet || data.peruste.oppaanPerusteet.length === 0)"
                  class="asettamatta"
                >{{ $t('ei-asetettu') }}</span>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row
            no-gutters
            class="mt-4"
          >
            <b-col lg="6">
              <b-form-group :label="$t('oppaan-kielet')">
                <b-form-checkbox-group
                  v-if="isEditing"
                  v-model="data.peruste.kielet"
                  stacked
                >
                  <b-form-checkbox
                    v-for="kieli in kielet"
                    :key="kieli"
                    :value="kieli"
                  >
                    {{ $t(kieli) }}
                  </b-form-checkbox>
                </b-form-checkbox-group>
                <div
                  v-else
                  class="text-nowrap"
                >
                  <span
                    v-for="(kieli, idx) in data.peruste.kielet"
                    :key="kieli"
                    :value="kieli"
                  >
                    {{ $t(kieli) }}<span
                      v-if="idx < data.peruste.kielet.length - 1"
                      class="mr-0"
                    >,</span>
                  </span>
                  <span
                    v-if="!isEditing && (!data.peruste.kielet || data.peruste.kielet.length === 0)"
                    class="asettamatta"
                  >{{ $t('ei-asetettu') }}</span>
                </div>
              </b-form-group>
            </b-col>

            <b-col
              v-if="!oppaanTyyppiTietoaPalvelusta"
              lg="6"
            >
              <b-form-group :label="$t('voimassaolo')">
                <div
                  v-if="!data.peruste.voimassaoloAlkaa && !data.peruste.voimassaoloLoppuu && !isEditing"
                  class="asettamatta"
                >
                  {{ $t('ei-asetettu') }}
                </div>
                <div
                  v-else
                  class="d-flex align-items-center"
                >
                  <ep-datepicker
                    v-model="data.peruste.voimassaoloAlkaa"
                    :is-editing="isEditing"
                  />
                  <div class="ml-2 mr-2">
                    -
                  </div>
                  <ep-datepicker
                    v-model="data.peruste.voimassaoloLoppuu"
                    :is-editing="isEditing"
                  />
                </div>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <EpEsikatselu
                v-model="storeData"
                opas
                :is-editing="isEditing"
              />
            </b-col>
          </b-row>
          <b-row>
            <b-col v-if="!isEditing">
              <b-form-group :label="$t('oppaan-lataus')">
                <ep-button
                  variant="primary"
                  @click="lataa"
                >
                  {{ $t('lataa-opas-json') }}
                </ep-button>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>

        <b-container fluid>
          <b-row no-gutters>
            <b-col lg="8">
              <h3 class="mt-5">
                {{ $t('oppaan-liittaminen-perusteen-sisaltoihin') }}
              </h3>
              <div class="mb-4">
                {{ $t('oppaan-liittaminen-perusteen-sisaltoihin-kuvaus') }}
              </div>
            </b-col>
          </b-row>
        </b-container>

        <b-container fluid>
          <template v-if="isEditing || (tutkinnonosaKoodit.length > 0 || osaamisalaKoodit.length > 0)">
            <h4>{{ $t('ammatillinen-koulutus') }}</h4>
            <b-row no-gutters>
              <b-col lg="8">
                <div class="koodiryhma">
                  <EpKoodistoSelectTable
                    v-if="isEditing || tutkinnonosaKoodit.length > 0"
                    v-model="tutkinnonosaKoodit"
                    class="mb-4"
                    :store="tutkinnonOsatKoodisto"
                    :is-editing="isEditing"
                    @remove="removeOppaanKoodi"
                  >
                    <template #header>
                      <h4>{{ $t('tutkinnonosat') }}</h4>
                    </template>
                    <template #button-text>
                      <span>{{ $t('lisaa-tutkinnon-osa') }}</span>
                    </template>
                  </EpKoodistoSelectTable>
                  <EpKoodistoSelectTable
                    v-if="isEditing || osaamisalaKoodit.length > 0"
                    v-model="osaamisalaKoodit"
                    :store="osaamisalaKoodisto"
                    :is-editing="isEditing"
                    @remove="removeOppaanKoodi"
                  >
                    <template #header>
                      <h4>{{ $t('osaamisalat') }}</h4>
                    </template>
                    <template #button-text>
                      <span>{{ $t('lisaa-osaamisala') }}</span>
                    </template>
                  </EpKoodistoSelectTable>
                </div>
              </b-col>
            </b-row>
          </template>

          <template v-if="isEditing || oppiaineKoodit.length > 0">
            <h4>{{ $t('lukiokoulutus') }}</h4>

            <b-row no-gutters>
              <b-col lg="8">
                <div class="koodiryhma">
                  <EpKoodistoSelectTable
                    v-model="oppiaineKoodit"
                    :store="oppiaineKoodisto"
                    :is-editing="isEditing"
                    :show-koodi-arvo="false"
                    @remove="removeOppaanKoodi"
                  >
                    <template #header>
                      <h4>{{ $t('oppiaineet') }}</h4>
                    </template>
                    <template #button-text>
                      <span>{{ $t('lisaa-oppiaine') }}</span>
                    </template>
                  </EpKoodistoSelectTable>
                </div>
              </b-col>
            </b-row>
          </template>

          <template v-if="isEditing || opintokokonaisuusKoodit.length > 0">
            <h4>{{ $t('vapaa-sivistystyo') }}</h4>

            <b-row no-gutters>
              <b-col lg="8">
                <div class="koodiryhma">
                  <EpKoodistoSelectTable
                    v-model="opintokokonaisuusKoodit"
                    :store="opintokokonaisuusKoodisto"
                    :is-editing="isEditing"
                    :show-koodi-arvo="false"
                    @remove="removeOppaanKoodi"
                  >
                    <template #header>
                      <h4>{{ $t('opintokokonaisuudet') }}</h4>
                    </template>
                    <template #button-text>
                      <span>{{ $t('lisaa-opintokokonaisuus') }}</span>
                    </template>
                  </EpKoodistoSelectTable>
                </div>
              </b-col>
            </b-row>
          </template>

          <template v-if="isEditing || koulutuksenosaKoodit.length > 0">
            <h4>{{ $t('tutkintokoulutukseen-valmentava-koulutus') }}</h4>

            <b-row no-gutters>
              <b-col lg="8">
                <div class="koodiryhma">
                  <EpKoodistoSelectTable
                    v-model="koulutuksenosaKoodit"
                    :store="koulutuksenosaKoodisto"
                    :is-editing="isEditing"
                    :show-koodi-arvo="false"
                    @remove="removeOppaanKoodi"
                  >
                    <template #header>
                      <h4>{{ $t('koulutuksenosat') }}</h4>
                    </template>
                    <template #button-text>
                      <span>{{ $t('lisaa-koulutuksenosa') }}</span>
                    </template>
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

<script setup lang="ts">
import { ref, computed, watch, provide, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import * as _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { usePerusteprojekti } from './PerusteprojektiRoute';
import { OpasEditStore } from '@/stores/OpasEditStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import PerustetyoryhmaSelect from './PerustetyoryhmaSelect.vue';
import EpKoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import { themes, koulutustyyppiRyhmaSort, EperusteetKoulutustyypit } from '@shared/utils/perusteet';
import EpMultiListSelect, { MultiListSelectItem } from '@shared/components/forms/EpMultiListSelect.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { UiKielet } from '@shared/stores/kieli';
import { MaintenanceStore } from '@/stores/MaintenanceStore';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import EpKoodistoSelectTable from '@shared/components/EpKoodistoSelect/EpKoodistoSelectTable.vue';
import { Koodisto, PerusteBaseDtoOpasTyyppiEnum } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpEsikatselu from '@shared/components/EpEsikatselu/EpEsikatselu.vue';
import { KoulutusTyyppi } from '@/utils/perusteet';
import { $t, $kaanna } from '@shared/utils/globals';
import { PerusteStore } from '@/stores/PerusteStore';

const props = defineProps<{
  ulkopuolisetStore: UlkopuolisetStore;
  perusteprojektiStore: PerusteprojektiStore;
  perusteStore: PerusteStore;
}>();

const store = ref<EditointiStore | null>(null);
const maintenanceStore = ref<MaintenanceStore | null>(null);

// Use the composition function
const {
  isInitializing,
  projektiId,
  perusteStore,
} = usePerusteprojekti(props);

onMounted(async () => {
  await props.perusteprojektiStore.fetchPohjaProjektit();
});

watch(projektiId, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    await onProjektiChange(parseInt(newValue), perusteStore.perusteId.value!);
  }
}, { immediate: true });

async function onProjektiChange(projektiId: number, perusteId: number) {
  store.value = new EditointiStore(new OpasEditStore(projektiId, perusteId, props.perusteStore));
  maintenanceStore.value = new MaintenanceStore(projektiId, perusteId);
}

const kielet = computed(() => {
  return UiKielet;
});

function ktToRyhma(koulutustyyppi) {
  return themes[koulutustyyppi];
}

const koulutustyypit = computed(() => {
  return _.chain([...EperusteetKoulutustyypit, KoulutusTyyppi.MUU])
    .map(koulutustyyppi => {
      return {
        value: koulutustyyppi,
        text: $t(koulutustyyppi),
      } as MultiListSelectItem;
    })
    .sortBy(item => koulutustyyppiRyhmaSort[ktToRyhma(item.value)])
    .value();
});

const perusteet = computed(() => {
  return _.chain(props.perusteprojektiStore.perusteet.value)
    .map(peruste => {
      return {
        value: {
          id: peruste.id,
        },
        text: $kaanna((peruste as any).nimi),
      } as MultiListSelectItem;
    })
    .sortBy(peruste => _.toLower(peruste.text))
    .value();
});

async function lataa() {
  await maintenanceStore.value?.exportPeruste();
}

const tutkinnonOsatKoodisto = new KoodistoSelectStore({
  koodisto: 'tutkinnonosat',
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

const osaamisalaKoodisto = new KoodistoSelectStore({
  koodisto: 'osaamisala',
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

const oppiaineKoodisto = new KoodistoSelectStore({
  koodisto: 'oppiaineetjaoppimaaratlops2021',
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

const opintokokonaisuusKoodisto = new KoodistoSelectStore({
  koodisto: 'opintokokonaisuusnimet',
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

const koulutuksenosaKoodisto = new KoodistoSelectStore({
  koodisto: 'koulutuksenosattuva',
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

const oppaanKiinnitetytKoodit = computed(() => {
  return store.value!.data.peruste.oppaanSisalto.oppaanKiinnitetytKoodit;
});

const oppaanKiinnitetytKooditUris = computed(() => {
  return _.map(oppaanKiinnitetytKoodit.value, okk => okk.koodi.uri);
});

const tutkinnonosaKoodit = computed({
  get() {
    return _.chain(oppaanKiinnitetytKoodit.value)
      .filter(kiinnitettyKoodi => kiinnitettyKoodi.kiinnitettyKoodiTyyppi === 'TUTKINNONOSA')
      .map('koodi')
      .value();
  },
  set(koodit) {
    asetaOppaanKoodit(_.map(koodit, koodi => {
      return {
        kiinnitettyKoodiTyyppi: 'TUTKINNONOSA',
        koodi,
      };
    }));
  },
});

const osaamisalaKoodit = computed({
  get() {
    return _.chain(oppaanKiinnitetytKoodit.value)
      .filter(kiinnitettyKoodi => kiinnitettyKoodi.kiinnitettyKoodiTyyppi === 'OSAAMISALA')
      .map('koodi')
      .value();
  },
  set(koodit) {
    asetaOppaanKoodit(_.map(koodit, koodi => {
      return {
        kiinnitettyKoodiTyyppi: 'OSAAMISALA',
        koodi,
      };
    }));
  },
});

const oppiaineKoodit = computed({
  get() {
    return _.chain(oppaanKiinnitetytKoodit.value)
      .filter(kiinnitettyKoodi => kiinnitettyKoodi.kiinnitettyKoodiTyyppi === 'OPPIAINE')
      .map('koodi')
      .value();
  },
  set(koodit) {
    asetaOppaanKoodit(_.map(koodit, koodi => {
      return {
        kiinnitettyKoodiTyyppi: 'OPPIAINE',
        koodi,
      };
    }));
  },
});

const opintokokonaisuusKoodit = computed({
  get() {
    return _.chain(oppaanKiinnitetytKoodit.value)
      .filter(kiinnitettyKoodi => kiinnitettyKoodi.kiinnitettyKoodiTyyppi === 'OPINTOKOKONAISUUS')
      .map('koodi')
      .value();
  },
  set(koodit) {
    asetaOppaanKoodit(_.map(koodit, koodi => {
      return {
        kiinnitettyKoodiTyyppi: 'OPINTOKOKONAISUUS',
        koodi,
      };
    }));
  },
});

const koulutuksenosaKoodit = computed({
  get() {
    return _.chain(oppaanKiinnitetytKoodit.value)
      .filter(kiinnitettyKoodi => kiinnitettyKoodi.kiinnitettyKoodiTyyppi === 'KOULUTUKSENOSA')
      .map('koodi')
      .value();
  },
  set(koodit) {
    asetaOppaanKoodit(_.map(koodit, koodi => {
      return {
        kiinnitettyKoodiTyyppi: 'KOULUTUKSENOSA',
        koodi,
      };
    }));
  },
});

function asetaOppaanKoodit(kiinnitettyKoodi) {
  if (store.value) {
    store.value.setData(
      {
        ...store.value.data.value,
        peruste: {
          ...store.value.data.value.peruste,
          oppaanSisalto: {
            ...store.value.data.value.peruste.oppaanSisalto,
            oppaanKiinnitetytKoodit: [
              ...store.value.data.value.peruste.oppaanSisalto.oppaanKiinnitetytKoodit,
              ..._.filter(kiinnitettyKoodi, koodi => !_.includes(oppaanKiinnitetytKooditUris.value, koodi.koodi.uri)),
            ],
          },
        },
      },
    );
  }
}

function removeOppaanKoodi(koodi) {
  if (store.value) {
    store.value.setData(
      {
        ...store.value.data.value,
        peruste: {
          ...store.value.data.value.peruste,
          oppaanSisalto: {
            ...store.value.data.value.peruste.oppaanSisalto,
            oppaanKiinnitetytKoodit: _.filter(store.value.data.value.peruste.oppaanSisalto.oppaanKiinnitetytKoodit, kiinnitettyKoodi => kiinnitettyKoodi.koodi.uri !== koodi.uri),
          },
        },
      },
    );
  }
}

const oppaanTyypit = [
  _.toLower(PerusteBaseDtoOpasTyyppiEnum.TIETOAPALVELUSTA),
];

const oppaanTyyppi = computed({
  get() {
    if (!store.value?.data.peruste.opasTyyppi || store.value?.data.peruste.opasTyyppi === _.toLower(PerusteBaseDtoOpasTyyppiEnum.NORMAALI)) {
      return [];
    }
    return [store.value?.data.peruste.opasTyyppi];
  },
  set(tyyppi) {
    if (store.value) {
      store.value.setData(
        {
          ...store.value.data,
          peruste: {
            ...store.value.data.peruste,
            opasTyyppi: tyyppi[0] || _.toLower(PerusteBaseDtoOpasTyyppiEnum.NORMAALI),
          },
        },
      );
    }
  },
});

const oppaanTyyppiTietoaPalvelusta = computed(() => {
  return _.includes(oppaanTyyppi.value, _.toLower(PerusteBaseDtoOpasTyyppiEnum.TIETOAPALVELUSTA));
});

const storeData = computed({
  get() {
    return store.value?.data;
  },
  set(data) {
    store.value?.setData(data);
  },
});
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
