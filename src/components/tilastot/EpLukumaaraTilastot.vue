<template>
  <div>
    <EpSpinner v-if="!toteutussuunnitelmat || !opetussuunnitelmat" />

    <template v-else>
      <ep-form-content name="aikavali">
        <div class="d-flex align-items-center">
          <ep-datepicker
            v-model="alkupvm"
            :is-editing="true"
          />
          <span class="mx-2">-</span>
          <ep-datepicker
            v-model="loppupvm"
            :is-editing="true"
            end-of-day
          />
        </div>
      </ep-form-content>

      <div>{{ $t('suunnitelmien-lukumaarat-selite') }}</div>

      <b-table
        borderless
        :items="lukumaarat"
        :fields="fields"
        :tbody-tr-class="rowClass"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed, onMounted, ref } from 'vue';
import { TilastotStore } from '@/stores/TilastotStore';
import { koulutustyyppiRyhmaSort } from '@shared/utils/perusteet';
import { suunnitelmatTilastoksi, koulutustyyppiTilastoSort } from './tilastot';
import { $t } from '@shared/utils/globals';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';

const props = defineProps<{
  tilastotStore: TilastotStore;
}>();

const alkupvm = ref<number | null>(null);
const loppupvm = ref<number | null>(null);

onMounted(() => {
  alkupvm.value = new Date().setMonth(new Date().getMonth() - 4);
  loppupvm.value = new Date().getTime();
});

const toteutussuunnitelmat = computed(() => {
  return props.tilastotStore.toteutussuunnitelmat.value;
});

const opetussuunnitelmat = computed(() => {
  return props.tilastotStore.opetussuunnitelmat.value;
});

const suunnitelmat = computed(() => {
  return [
    ...toteutussuunnitelmat.value ?? [],
    ...opetussuunnitelmat.value ?? [],
  ];
});

const suunnitelmaLukumaarat = computed(() => {
  return suunnitelmatTilastoksi(suunnitelmat.value, alkupvm.value!, loppupvm.value!);
});

const ryhmaLukumaarat = computed(() => {
  return _.chain(suunnitelmaLukumaarat.value)
    .groupBy('ryhma')
    .map((ryhma: any) => {
      return {
        koulutustyyppi: ryhma[0].ryhma,
        ryhma: ryhma[0].ryhma,
        julkaistut: _.sumBy(ryhma, 'julkaistut'),
        luonnokset: _.sumBy(ryhma, 'luonnokset'),
        arkistoidut: _.sumBy(ryhma, 'arkistoidut'),
        yhteensa: _.sumBy(ryhma, 'yhteensa'),
        uusia: _.sumBy(ryhma, 'uusia'),
        tyyppi: 'ryhma',
      };
    })
    .filter(ryhma => _.size(_.filter((suunnitelmaLukumaarat.value as any[]), suunnitelma => suunnitelma.ryhma === ryhma.ryhma)) > 1)
    .value();
});

const kaikkiYhteensa = computed(() => {
  return {
    koulutustyyppi: 'kaikki-yhteensa',
    ryhma: 'kaikki-yhteensa',
    tyyppi: 'kaikki-yhteensa',
    julkaistut: _.sumBy(suunnitelmaLukumaarat.value, 'julkaistut'),
    luonnokset: _.sumBy(suunnitelmaLukumaarat.value, 'luonnokset'),
    arkistoidut: _.sumBy(suunnitelmaLukumaarat.value, 'arkistoidut'),
    yhteensa: _.sumBy(suunnitelmaLukumaarat.value, 'yhteensa'),
    uusia: _.sumBy(suunnitelmaLukumaarat.value, 'uusia'),
  };
});

const lukumaarat = computed(() => {
  let lukumaarat = _.chain([
    ...suunnitelmaLukumaarat.value,
    ...ryhmaLukumaarat.value,
  ])
    .sortBy((rivi: any) => koulutustyyppiTilastoSort[rivi.koulutustyyppi] ?? 99)
    .sortBy((rivi: any) => rivi.tyyppi === 'ryhma' ? 0 : 1)
    .sortBy((rivi: any) => koulutustyyppiRyhmaSort[rivi.ryhma] ?? 99)
    .value();

  lukumaarat = [
    ...lukumaarat,
    kaikkiYhteensa.value,
  ];

  let evenrow = false;
  lukumaarat = _.map(lukumaarat, (rivi, index) => {
    if (index > 0) {
      if (!_.isEqual(rivi.ryhma, (lukumaarat as any[])[index - 1]?.ryhma)) {
        evenrow = !evenrow;
      }
    }

    return {
      ...rivi,
      evenrow,
    };
  });

  return lukumaarat;
});

const koulutustyyppiKiellelinenMuutos = computed(() => {
  return {
    'koulutustyyppi_muu': 'jotpa-rahoitteisia',
  };
});

const fields = computed(() => {
  return [
    {
      key: 'koulutustyyppi',
      label: $t('koulutustyyppi'),
      formatter: (value: string) => $t(koulutustyyppiKiellelinenMuutos.value[value] ?? value),
    },
    {
      key: 'julkaistut',
      label: $t('julkaistut'),
      thClass: 'text-right otsikko',
      tdClass: 'text-right',
    },
    {
      key: 'luonnokset',
      label: $t('luonnokset'),
      thClass: 'text-right otsikko',
      tdClass: 'text-right',
    },
    {
      key: 'arkistoidut',
      label: $t('arkistoidut'),
      thClass: 'text-right otsikko',
      tdClass: 'text-right',
    },
    {
      key: 'yhteensa',
      label: $t('yhteensa'),
      thClass: 'text-right otsikko',
      tdClass: 'text-right',
    },
    {
      key: 'uusia',
      label: $t('uusia-aikavalilla'),
      thClass: 'text-right uusia',
      tdClass: 'text-right uusia',
    },
  ];
});

const rowClass = (item, type) => {
  if (!item || type !== 'row') return;
  let rowClass = '';
  if (item.tyyppi !== 'ryhma' && _.includes(_.map(ryhmaLukumaarat.value, 'ryhma'), item.ryhma)) rowClass += 'ryhman-alainen-rivi ';
  if (item.evenrow) rowClass += 'even-row ';

  return rowClass + item.tyyppi;
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

:deep(.table) {
  border-collapse: collapse !important;
}

:deep(.table .ryhma), :deep(.table .kaikki-yhteensa) {
  font-weight: bold;
}

:deep(.table .kaikki-yhteensa td) {
  border-top: 2px solid #ccc;
  border-bottom: 2px solid #ccc;
}

:deep(.otsikko) {
  width: 150px;
}

:deep(.uusia) {
  width: 200px;
  border-left: 2px solid #ccc;
}

:deep(.ryhman-alainen-rivi td) {
  padding-left: 25px;
}

:deep(.even-row td) {
  background-color: $table-odd-row-bg-color;
}

:deep(.table) {
  border-collapse: separate;
}

:deep(.table > thead) {
  background-color: $white;
  position: sticky !important;
  top: 0px;
  z-index: 1;
}

</style>
