<template>
  <router-view v-if="maaraysId"/>

  <ep-main-view container v-else>
    <template #header>
      <div class="d-flex justify-content-between">
        <h1>{{ $t('maarayskokoelma-otsikko') }}</h1>
        <router-link :to="{ name: 'maaraysMuokkaus', params: { maaraysId: 'uusi' } }">
          <EpButton
            icon="add"
            variant="outline"
            v-oikeustarkastelu="{oikeus:'muokkaus', kohde: 'eperusteet_maarays'}"
            >{{ $t('lisaa-maarays') }}</EpButton>
        </router-link>
      </div>
    </template>

    <div>
      <div class="mb-3">{{$t('maarayskokoelma-selite')}}</div>

      <div class="row ml-0 mb-2 mt-4">

        <b-form-group :label="$t('hae')" class="col-4">
          <ep-search v-model="query.nimi" :placeholder="$t('etsi-maarayksia')"/>
        </b-form-group>

        <b-form-group :label="$t('tyyppi')" class="col-3">
          <EpMultiSelect v-model="query.tyyppi"
                  :enable-empty-option="true"
                  placeholder="kaikki"
                  :is-editing="true"
                  :options="tyyppiVaihtoehdot">
            <template #singleLabel="{ option }">
              {{ $t('maarays-tyyppi-' + option.toLowerCase()) }}
            </template>
            <template #option="{ option }">
              {{ $t('maarays-tyyppi-' + option.toLowerCase()) }}
            </template>
          </EpMultiSelect>
        </b-form-group>

        <b-form-group :label="$t('koulutus-tai-tutkinto')" class="col-3">
          <EpMaarayskokoelmaKoulutustyyppiSelect v-model="query.koulutustyyppi" :isEditing="true"/>
        </b-form-group>

        <b-form-group :label="$t('voimassaolo')" class="col-2">
          <EpMultiSelect v-model="query.voimassaolo"
                    :enable-empty-option="true"
                    placeholder="kaikki"
                    :is-editing="true"
                    :options="voimassaVaihtoehdot">
            <template #singleLabel="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
            <template #option="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
          </EpMultiSelect>
        </b-form-group>
      </div>

      <div class="d-flex mb-4">
        <EpToggle v-model="query.luonnos" checkbox>{{ $t('luonnos') }}</EpToggle>
        <EpToggle v-model="query.julkaistu" checkbox>{{ $t('julkaistu') }}</EpToggle>
      </div>

      <ep-spinner v-if="!maaraykset" />

      <div v-else-if="maaraykset.length === 0">
      {{$t('ei-maarayksia')}}
      </div>

      <b-table
        v-else
        class="mt-3"
        responsive
        borderless
        striped
        fixed
        hover
        :items="maaraykset"
        :fields="tableFields"
        :per-page="perPage"
        no-local-sorting
        @sort-changed="sortingChanged"
        :sort-by.sync="sort.sortBy"
        :sort-desc.sync="sort.sortDesc">

      <template v-slot:cell(nimi)="{ item }">
        <router-link :to="{ name: 'maaraysMuokkaus', params: { maaraysId: item.id } }">
          {{$kaanna(item.nimi)}}
        </router-link>
      </template>

      </b-table>

      <ep-pagination
        v-model="sivu"
        :per-page="perPage"
        :total-rows="maarayksetCount"/>
    </div>
  </ep-main-view>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MaarayksetStore, MaaraysQueryDto } from '@shared/stores/maarayksetStore';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { MaaraysDtoTyyppiEnum } from '@shared/api/eperusteet';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components//EpMaterialIcon/EpMaterialIcon.vue';
import { Murupolku } from '@shared/stores/murupolku';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { Kielet } from '@shared/stores/kieli';
import EpMaarayskokoelmaKoulutustyyppiSelect from '@shared/components/EpMaarayskokoelmaKoulutustyyppiSelect/EpMaarayskokoelmaKoulutustyyppiSelect.vue';
import { pinia } from '@/stores/pinia';
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


const props = defineProps<{
  maarayksetStore: MaarayksetStore;
}>();

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

const maaraykset = computed(() => props.maarayksetStore.maaraykset.value?.data);
const maarayksetCount = computed(() => props.maarayksetStore.maaraykset.value?.kokonaismäärä);

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
  await props.maarayksetStore.fetch(
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
