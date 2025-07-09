<template>
  <ep-main-view>
    <template #icon>
      <ep-icon class="float-right" icon="add">
      </ep-icon>
    </template>
    <template #header>
      <div class="d-flex justify-content-between">
        <h1>{{ $t('tiedotteet') }}</h1>
        <ep-tiedote-modal
          ref="eptiedotemodal"
          :perusteet="perusteet"
          :tiedotteetStore="tiedotteetStore"
          :oikeustarkastelu="{oikeus:'hallinta'}"/>
      </div>
    </template>

    <div class="row align-items-end mb-4">
      <div class="col-4">
        <ep-search v-model="nimiFilter" />
      </div>
      <div class="col-6">
        <ep-form-content name="tiedote-julkaistu" class="mb-0">
          <ep-multi-select :multiple="true"
            :is-editing="true"
            :options="julkaisupaikatItems"
            v-model="valitutJulkaisupaikat"
            :placeholder="$t('kaikki')"
            track-by="value"
            label="text">
          </ep-multi-select>
        </ep-form-content>
      </div>
    </div>

    <ep-spinner v-if="!tiedotteetPage" />

    <div v-else>
      <b-table responsive
        borderless
        striped
        fixed
        hover
        no-local-sorting
        @sort-changed="sortingChanged"
        :sort-by.sync="sort.sortBy"
        :sort-desc.sync="sort.sortDesc"
        :items="tiedotteetFiltered"
        :fields="tableFields"
        :per-page="perPage"
        @row-clicked="avaaTiedote"/>

      <b-pagination
        v-model="page"
        :total-rows="totalRows"
        :per-page="perPage"
        aria-controls="tiedotteet"
        align="center">
      </b-pagination>
    </div>

  </ep-main-view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, useTemplateRef } from 'vue';
import _ from 'lodash';

import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpTiedoteModal from '@shared/components/EpTiedoteModal/EpTiedoteModal.vue';
import { Perusteet, TiedoteDto } from '@shared/api/eperusteet';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { julkaisupaikka, julkaisupaikkaSort } from '@shared/utils/tiedote';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { PerusteKevytDto } from '@shared/generated/eperusteet';
import { $t, $sdt, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  tiedotteetStore: TiedotteetStore;
}>();

const eptiedotemodalRef = useTemplateRef('eptiedotemodal');
const sivu = ref(0);
const perPage = ref(10);
const nimiFilter = ref('');
const sort = ref({});
const valitutJulkaisupaikat = ref<any[]>([]);
const perusteet = ref<PerusteKevytDto[] | null>(null);

onMounted(async () => {
  props.tiedotteetStore.init({
    sivu: sivu.value,
    sivukoko: 10,
  });
  perusteet.value = (await Perusteet.getJulkaistutPerusteet()).data;
});

watch(nimiFilter, () => {
  fetch({
    sivu: 0,
    nimi: nimiFilter.value,
  });
});

watch(valitutJulkaisupaikat, () => {
  fetch({
    sivu: 0,
    tiedoteJulkaisuPaikka: _.map(valitutJulkaisupaikat.value, 'value'),
  });
});

watch(sivu, () => {
  fetch({
    sivu: sivu.value,
  });
});

const sortingChanged = (sortValue) => {
  sort.value = sortValue;
  fetch({
    sivu: 0,
    jarjestys: sortValue.sortBy,
    jarjestysNouseva: !sortValue.sortDesc,
  });
};

const fetch = (query) => {
  props.tiedotteetStore.init({
    ...props.tiedotteetStore.options.value,
    ...query,
  });
};

const tiedotteetPage = computed(() => {
  return props.tiedotteetStore?.tiedotteetPage.value || null;
});

const totalRows = computed(() => {
  return tiedotteetPage.value!.kokonaismäärä;
});

const page = computed({
  get() {
    return tiedotteetPage.value!.sivu + 1;
  },
  set(value: number) {
    sivu.value = value - 1;
  }
});

const tiedotteetFiltered = computed(() => {
  return _.map(props.tiedotteetStore.tiedotteet.value, tiedote => {
    return {
      ...tiedote,
      julkaisupaikat: _.chain(tiedote.julkaisupaikat)
        .sortBy((julkaisupaikka) => julkaisupaikkaSort[julkaisupaikka])
        .value(),
    };
  });
});

const valitutJulkaisuPaikatValues = computed(() => {
  return _.map(valitutJulkaisupaikat.value, 'value');
});

const julkaisupaikatItems = computed(() => {
  return [
    { text: $t('tiedote-julkaisupaikka-opintopolku'), value: julkaisupaikka.opintopolku_etusivu },
    { text: $t('tiedote-julkaisupaikka-ops'), value: julkaisupaikka.ops },
    { text: $t('tiedote-julkaisupaikka-lops'), value: julkaisupaikka.lops },
    { text: $t('tiedote-julkaisupaikka-amosaa'), value: julkaisupaikka.amosaa },
    { text: $t('tiedote-julkaisupaikka-vst'), value: julkaisupaikka.vst },
  ];
});

const tableFields = computed(() => {
  return [{
    key: 'luotu',
    label: $t('julkaistu'),
    sortable: true,
    formatter: (value: any, key: any, item: any) => {
      return $sdt(value);
    },
  }, {
    key: 'muokattu',
    label: $t('muokattu'),
    sortable: true,
    formatter: (value: any, key: any, item: any) => {
      if (item.luotu !== item.muokattu) {
        return $sdt(value);
      }

      return '';
    },
  }, {
    key: 'otsikko',
    label: $t('tiedotteen-otsikko'),
    sortable: false,
    thStyle: { width: '35%', borderBottom: '0px' },
    formatter: (value: any, key: any, item: any) => {
      return $kaanna(value);
    },
  }, {
    key: 'julkaisupaikat',
    label: $t('tiedote-julkaistu'),
    sortable: false,
    thStyle: { width: '35%', borderBottom: '0px' },
    formatter: (value: any, key: any, item: any) => {
      return _.join(
        [
          ..._.chain(value)
            .sortBy(julkaisupaikka => julkaisupaikkaSort[julkaisupaikka])
            .map((julkaisupaikka) => $t('tiedote-julkaisupaikka-' + julkaisupaikka))
            .value(),
          ..._.map(item.koulutustyypit, kt => $t(kt)),
        ],
        ', ',
      );
    },
  }];
});

const avaaTiedote = (tiedote: TiedoteDto) => {
  eptiedotemodalRef.value.muokkaa(tiedote);
};
</script>

<style scoped lang="scss">
.tiedote-muokkaustieto {
  font-size: 0.8rem;
}
</style>
