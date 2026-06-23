<template>
  <router-view v-if="maaraysId" />

  <ep-main-view
    v-else
    container
  >
    <template #header>
      <div class="flex justify-between">
        <h1>{{ $t('maarayskokoelma-otsikko') }}</h1>
        <router-link :to="{ name: 'maaraysMuokkaus', params: { maaraysId: 'uusi' } }">
          <EpButton
            v-oikeustarkastelu="{oikeus:'muokkaus', kohde: 'eperusteet_maarays'}"
            icon="add"
            variant="outline"
          >
            {{ $t('lisaa-maarays') }}
          </EpButton>
        </router-link>
      </div>
    </template>

    <div>
      <div class="mb-3">
        {{ $t('maarayskokoelma-selite') }}
      </div>

      <div class="flex flex-wrap gap-4 ml-0 mb-2 mt-4">
        <EpFormGroup
          :label="$t('hae')"
          class="w-1/3"
        >
          <ep-search
            v-model="query.nimi"
            :placeholder="$t('etsi-maarayksia')"
          />
        </EpFormGroup>

        <EpFormGroup
          :label="$t('tyyppi')"
          class="w-1/4"
        >
          <EpMultiSelect
            v-model="query.tyyppi"
            :enable-empty-option="true"
            placeholder="kaikki"
            :is-editing="true"
            :options="tyyppiVaihtoehdot"
          >
            <template #singleLabel="{ option }">
              {{ $t('maarays-tyyppi-' + option.toLowerCase()) }}
            </template>
            <template #option="{ option }">
              {{ $t('maarays-tyyppi-' + option.toLowerCase()) }}
            </template>
          </EpMultiSelect>
        </EpFormGroup>

        <EpFormGroup
          :label="$t('koulutus-tai-tutkinto')"
          class="w-1/4"
        >
          <EpMaarayskokoelmaKoulutustyyppiSelect
            v-model="query.koulutustyyppi"
            :is-editing="true"
          />
        </EpFormGroup>

        <EpFormGroup
          :label="$t('voimassaolo')"
          class="w-1/6"
        >
          <EpMultiSelect
            v-model="query.voimassaolo"
            :enable-empty-option="true"
            placeholder="kaikki"
            :is-editing="true"
            :options="voimassaVaihtoehdot"
          >
            <template #singleLabel="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
            <template #option="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
          </EpMultiSelect>
        </EpFormGroup>
      </div>

      <div class="flex mb-4">
        <EpToggle
          v-model="query.luonnos"
          checkbox
        >
          {{ $t('luonnos') }}
        </EpToggle>
        <EpToggle
          v-model="query.julkaistu"
          checkbox
        >
          {{ $t('julkaistu') }}
        </EpToggle>
      </div>

      <ep-spinner v-if="!maaraykset" />

      <div v-else-if="maaraykset.length === 0">
        {{ $t('ei-maarayksia') }}
      </div>

      <EpTable
        v-else
        class="mt-3"
        responsive
        borderless
        striped
        fixed
        hover
        no-local-sorting
        :sort-by="sort.sortBy"
        :sort-desc="sort.sortDesc"
        :items="maaraykset"
        :fields="tableFields"
        @sort-changed="sortingChanged"
      >
        <template #cell(nimi)="{ item }">
          <router-link :to="{ name: 'maaraysMuokkaus', params: { maaraysId: item.id } }">
            {{ $kaanna(item.nimi) }}
          </router-link>
        </template>
      </EpTable>

      <ep-b-pagination
        v-model="sivu"
        :items-per-page="perPage"
        :total="maarayksetCount"
      />
    </div>
  </ep-main-view>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MaarayksetStore } from '@shared/stores/MaarayksetStore';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { MaaraysDtoTyyppiEnum } from '@shared/api/eperusteet';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { Murupolku } from '@shared/stores/murupolku';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpBPagination from '@shared/components/EpBPagination/EpBPagination.vue';
import EpTable from '@shared/components/EpTable/EpTable.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import { Kielet } from '@shared/stores/kieli';
import EpMaarayskokoelmaKoulutustyyppiSelect from '@shared/components/EpMaarayskokoelmaKoulutustyyppiSelect/EpMaarayskokoelmaKoulutustyyppiSelect.vue';
import { $kaanna, $t, $sd } from '@shared/utils/globals';

interface MaaraysQuery {
  nimi: string,
  sivukoko: number,
  voimassaolo: 'KAIKKI' | 'TULEVA' | 'VOIMASSAOLO' | 'POISTUNUT' | null,
  jarjestysTapa?: string;
  jarjestys: string;
  koulutustyyppi: string | null,
  luonnos?: boolean,
  julkaistu?: boolean,
  tyyppi?: any,
}

const maarayksetStore = new MaarayksetStore();
const route = useRoute();
const router = useRouter();

const perPage = ref(10);
const sivu = ref(1);
const sort = ref({});
const query = ref<MaaraysQuery>({
  nimi: '',
  sivukoko: 10,
  voimassaolo: null,
  jarjestysTapa: 'nimi',
  jarjestys: 'ASC',
  koulutustyyppi: null,
});

onMounted(async () => {
  Murupolku.aseta('maarayskokoelma', $t('route-maaraykset'), {
    name: 'maarayskokoelma',
  });
});

const maaraysId = computed(() => route.params.maaraysId);

const maaraykset = computed(() => maarayksetStore.maaraykset.value?.data);
const maarayksetCount = computed(() => maarayksetStore.maaraykset.value?.kokonaismäärä);

const tyyppiVaihtoehdot = computed(() => [
  MaaraysDtoTyyppiEnum.OPETUSHALLITUKSENMUU,
  MaaraysDtoTyyppiEnum.AMMATILLINENMUU,
  MaaraysDtoTyyppiEnum.PERUSTE,
]);

const voimassaVaihtoehdot = computed(() => [
  'KAIKKI',
  'TULEVA',
  'VOIMASSAOLO',
  'POISTUNUT',
]);

const tableFields = computed(() => [
  {
    key: 'nimi',
    label: $t('maarayksen-nimi'),
    sortable: true,
    sortByFormatted: true,
    thStyle: { width: '35%' },
    formatter: (value: any) => {
      return $kaanna(value);
    },
  },
  {
    key: 'tila',
    label: $t('tila'),
    sortable: false,
    thClass: 'border-0',
    formatter: (value: any) => {
      return $t(value.toLowerCase());
    },
  },
  {
    key: 'muokattu',
    label: $t('muokattu'),
    sortable: false,
    thClass: 'border-0',
    formatter: (value: any) => {
      return $sd(value);
    },
  },
  {
    key: 'voimassaoloAlkaa',
    label: $t('voimaantulo'),
    sortable: false,
    thClass: 'border-0',
    formatter: (value: any) => {
      return $sd(value);
    },
  },
  {
    key: 'voimassaoloLoppuu',
    label: $t('voimassaolo-paattyy'),
    sortable: false,
    thClass: 'border-0',
    formatter: (value: any) => {
      if (value) {
        return $sd(value);
      }
      return null;
    },
  },
]);

// Watch for changes in maaraysId
watch(maaraysId, async () => {
  if (!maaraysId.value) {
    await fetch();
  }
});

// Watch for changes in sivu
watch(sivu, async () => {
  await fetch();
});

// Watch for changes in query
watch(query, async () => {
  sivu.value = 1;
  await fetch();
}, { deep: true });

const fetch = _.debounce(async () => {
  await maarayksetStore.fetch(
    {
      ...query.value as any,
      kieli: Kielet.getSisaltoKieli.value,
      sivu: sivu.value - 1,
      tuleva: query.value.voimassaolo === 'TULEVA',
      voimassaolo: query.value.voimassaolo === 'VOIMASSAOLO',
      poistunut: query.value.voimassaolo === 'POISTUNUT',
      koulutustyypit: query.value.koulutustyyppi ? [query.value.koulutustyyppi] : [],
    });
}, 300);

const sortingChanged = (sortVal: any) => {
  sort.value = sortVal;
  sivu.value = 1;
  query.value = {
    ...query.value,
    jarjestys: sortVal.sortDesc ? 'DESC' : 'ASC',
    jarjestysTapa: sortVal.sortBy,
  };
};

onMounted(async () => {
  await fetch();
});

</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
