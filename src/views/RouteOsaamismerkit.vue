<template>
  <div v-if="$route.name === 'osaamismerkit'">
    <EpMainView>
      <template #header>
        <div class="d-flex justify-content-between">
          <h1>{{ $t('osaamismerkit') }}</h1>
          <div class="d-flex">
            <router-link :to="{ name: 'osaamismerkkikategoriat' }">
              <EpButton
                class="m-0 p-0"
                variant="link"
                icon="edit"
              >
                {{ $t('teemojen-hallinta') }}
              </EpButton>
            </router-link>
            <EpButton
              class="m-0 p-0"
              variant="outlined"
              icon="add"
              @click="avaaOsaamismerkkiModal"
            >
              {{ $t('lisaa-osaamismerkki') }}
            </EpButton>
          </div>
        </div>
        <div class="mb-1">
          {{ $t('osaamismerkit-kuvaus') }}
        </div>
      </template>

      <div class="row align-items-end">
        <div class="col-6">
          <EpFormContent name="hae">
            <EpSearch v-model="query.nimi" />
          </EpFormContent>
        </div>
        <div class="col-3">
          <EpFormContent name="teema">
            <EpMultiSelect
              v-model="kategoria"
              :is-editing="true"
              :options="osaamismerkkiKategoriaOptions"
              :placeholder="$t('kaikki')"
              track-by="value"
              label="text"
            />
          </EpFormContent>
        </div>
        <div class="col-3">
          <EpFormContent name="voimassaolo">
            <EpMultiSelect
              v-model="voimassaolo"
              :is-editing="false"
              :options="osaamismerkkiVoimassaolot"
              :placeholder="$t('kaikki')"
            >
              <template #singleLabel="{ option }">
                {{ $t('ajoitus-' + option.toLowerCase()) }}
              </template>
              <template #option="{ option }">
                {{ $t('ajoitus-' + option.toLowerCase()) }}
              </template>
            </EpMultiSelect>
          </EpFormContent>
        </div>
      </div>

      <div class="row align-items-end">
        <div class="col-4">
          <EpToggleGroup
            v-model="tila"
            :items="osaamismerkkiTilat"
          >
            <template #default="{item}">
              <span>{{ $t('tila-' + item.toLowerCase()) }}</span>
            </template>
          </EpToggleGroup>
        </div>
      </div>

      <EpSpinner v-if="!osaamismerkitPage" />
      <div v-else-if="totalRows > 0">
        <b-table
          responsive
          borderless
          striped
          fixed
          hover
          no-local-sorting
          :items="osaamismerkitFiltered"
          :fields="tableFields"
          :per-page="perPage"
          @row-clicked="avaaOsaamismerkkiModal"
        />

        <b-pagination
          v-model="page"
          :total-rows="totalRows"
          :per-page="perPage"
          aria-controls="tiedotteet"
          align="center"
        />
      </div>
      <div
        v-else
        class="m-2 alert alert-info"
      >
        {{ $t('ei-hakutuloksia') }}
      </div>

      <EpOsaamismerkkiModal
        ref="osaamismerkkiModal"
        :store="props.osaamismerkitStore"
      />
    </EpMainView>
  </div>
  <router-view v-else />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import { OsaamismerkitStore } from '@/stores/OsaamismerkitStore';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { OsaamismerkitQuery } from '@shared/api/eperusteet';
import { OsaamismerkkiDto } from '@shared/generated/eperusteet';
import EpOsaamismerkkiModal from '@/components/EpOsaamismerkki/EpOsaamismerkkiModal.vue';
import * as _ from 'lodash';
import { Murupolku } from '@shared/stores/murupolku';
import { Kielet } from '@shared/stores/kieli';
import { $kaanna, $t, $sdt, $sd, $fail } from '@shared/utils/globals';
import EpToggleGroup from '@shared/components/forms/EpToggleGroup.vue';

const props = defineProps({
  osaamismerkitStore: {
    type: Object as () => OsaamismerkitStore,
    required: true,
  },
});

const route = useRoute();
const instance = getCurrentInstance();
const osaamismerkkiModal = ref<InstanceType<typeof EpOsaamismerkkiModal> | null>(null);

const sivu = ref(0);
const perPage = ref(10);
const tila = ref<string[]>(['LAADINTA', 'JULKAISTU']);
const voimassaolo = ref<string | null>(null);
const kategoria = ref<any | null>(null);
const isLoading = ref(false);

const kieli = computed(() => Kielet.getSisaltoKieli.value);

const query = ref<OsaamismerkitQuery>({
  sivu: 0,
  sivukoko: 10,
  nimi: '',
  tila: ['LAADINTA', 'JULKAISTU'],
  kategoria: undefined,
  voimassa: false,
  tuleva: false,
  poistunut: false,
  kieli: kieli.value,
});

const osaamismerkitPage = computed(() => props.osaamismerkitStore?.osaamismerkkiPage.value || null);
const totalRows = computed(() => osaamismerkitPage.value!.kokonaismäärä);
const page = computed({
  get: () => osaamismerkitPage.value!.sivu + 1,
  set: (value: number) => {
    sivu.value = value - 1;
  },
});

const osaamismerkitFiltered = computed(() => props.osaamismerkitStore.osaamismerkit.value);

const osaamismerkkiKategoriat = computed(() => {
  return _.chain(props.osaamismerkitStore.kategoriat.value)
    .map(kategoria => {
      return {
        text: $kaanna(kategoria.nimi),
        value: kategoria.id,
      };
    })
    .uniqWith(_.isEqual)
    .filter('text')
    .value();
});

const osaamismerkkiKategoriaOptions = computed(() => {
  return [
    {
      text: $t('kaikki'),
      value: null,
    },
    ...osaamismerkkiKategoriat.value,
  ];
});

const osaamismerkkiTilat = computed(() => ['LAADINTA', 'JULKAISTU']);

const osaamismerkkiVoimassaolot = computed(() => [
  'kaikki',
  'tuleva',
  'voimassaolo',
  'poistunut',
]);

const tableFields = computed(() => {
  return [
    {
      key: 'nimi',
      label: $t('osaamismerkki-nimi'),
      sortable: false,
      thStyle: { width: '25%', borderBottom: '2px' },
      formatter: (value: any, key: any, item: any) => {
        return $kaanna(value);
      },
    }, {
      key: 'kategoria',
      label: $t('teema'),
      sortable: false,
      thStyle: { width: '20%', borderBottom: '2px' },
      formatter: (value: any, key: any, item: any) => {
        return $kaanna(value.nimi);
      },
    }, {
      key: 'tila',
      label: $t('tila'),
      sortable: false,
      thStyle: { width: '10%', borderBottom: '2px' },
      formatter: (value: any, key: string, item: OsaamismerkkiDto) => {
        return $t('tila-' + _.toLower(item!.tila));
      },
    }, {
      key: 'muokattu',
      label: $t('muokattu'),
      sortable: false,
      thStyle: { width: '15%', borderBottom: '2px' },
      formatter: (value: any, key: any, item: any) => {
        return value ? $sdt(value) : null;
      },
    }, {
      key: 'voimassaoloAlkaa',
      label: $t('voimassaolo-alkaa'),
      sortable: false,
      thStyle: { width: '15%', borderBottom: '2px' },
      formatter: (value: any, key: any, item: any) => {
        return value ? $sd(value) : null;
      },
    }, {
      key: 'voimassaoloLoppuu',
      label: $t('voimassaolo-loppuu'),
      sortable: false,
      thStyle: { width: '15%', borderBottom: '2px' },
      formatter: (value: any, key: any, item: any) => {
        return value ? $sd(value) : null;
      },
    },
  ];
});

const avaaOsaamismerkkiModal = (osaamismerkki: OsaamismerkkiDto) => {
  osaamismerkkiModal.value?.avaaModal(osaamismerkki);
};

onMounted(async () => {
  Murupolku.aseta('osaamismerkit', $t('route-osaamismerkit'), {
    name: 'osaamismerkit',
  });
  await props.osaamismerkitStore.init(query.value);
});

watch(kieli, () => {
  query.value.kieli = kieli.value;
});

watch(query, async (newQuery) => {
  isLoading.value = true;
  try {
    await props.osaamismerkitStore.updateOsaamismerkkiQuery({
      ...newQuery,
    });
  }
  catch (e) {
    $fail($t('virhe-palvelu-virhe') as string);
  }
  finally {
    isLoading.value = false;
  }
}, { deep: true, immediate: true });

watch(sivu, () => {
  query.value.sivu = sivu.value;
});

watch(tila, (newTila) => {
  query.value.tila = newTila || ['LAADINTA', 'JULKAISTU'];
});

watch(kategoria, (newKategoria) => {
  query.value.kategoria = newKategoria ? newKategoria.value : null;
});

watch(voimassaolo, (newTila) => {
  const defaults = {
    voimassa: false,
    tuleva: false,
    poistunut: false,
  };

  switch (newTila) {
  case 'tuleva':
    query.value = { ...query.value, ...defaults, tuleva: true };
    break;
  case 'voimassaolo':
    query.value = { ...query.value, ...defaults, voimassa: true };
    break;
  case 'poistunut':
    query.value = { ...query.value, ...defaults, poistunut: true };
    break;
  default:
    query.value = {
      ...query.value,
      ...defaults,
    };
    break;
  }
});
</script>

<style lang="scss" scoped>

</style>
