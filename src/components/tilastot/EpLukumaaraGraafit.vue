<template>
  <div>
    <EpSpinner v-if="!toteutussuunnitelmat || !opetussuunnitelmat" />

    <template v-else>
      <div class="d-flex">
        <ep-form-content name="koulutustyyppi">
          <koulutustyyppi-select class="koulutustyyppi-select" v-model="koulutustyyppi" :isEditing="true" :koulutustyypit="koulutustyyppiValinnat"/>
        </ep-form-content>
        <ep-form-content name="ajanjakso" class="ml-5">
          <EpRadio v-model="ajanjakso" value="kuukausi">{{ $t('kuukausittain') }}</EpRadio>
          <EpRadio v-model="ajanjakso" value="vuosi">{{ $t('vuosittain') }}</EpRadio>
        </ep-form-content>
        <ep-form-content name="vuosi" class="ml-5">
          <b-form-select v-model="vuosi" :options="vuosivalinnat" :disabled="ajanjakso === 'vuosi'"/>
        </ep-form-content>
      </div>

      <ep-form-content name="tila" class="mb-4">
        <EpToggleGroup v-model="tila" :items="tilaValinnat">
          <template #default="{item}">
            <span>{{$t(item)}}</span>
          </template>
        </EpToggleGroup>
      </ep-form-content>

      <div class="mb-2">{{$t('suunnitelmien-lukumaarat-graafi-selite')}}</div>

      <apexchart type="bar" :options="chartOptions" :series="chartSeries" height="500px" width="75%"/>
    </template>
  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { ref, computed, onMounted } from 'vue';
import { TilastotStore } from '@/stores/TilastotStore';
import { suunnitelmatTilastoksi } from './tilastot';
import moment from 'moment';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { $t } from '@shared/utils/globals';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpToggleGroup from '@shared/components/forms/EpToggleGroup.vue';
import EpRadio from '@shared/components/forms/EpRadio.vue';

type Ajanjakso = 'kuukausi' | 'vuosi';

const props = defineProps({
  tilastotStore: {
    type: Object as () => TilastotStore,
    required: true,
  },
});

const koulutustyyppi = ref<string[] | null>([]);
const tila = ref<string[] | null>([]);
const ajanjakso = ref<Ajanjakso>('kuukausi');
const vuosi = ref<number | null>(null);

onMounted(() => {
  vuosi.value = new Date().getFullYear();
  tila.value = [];
  koulutustyyppi.value = [];
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

const tilaValinnat = computed(() => {
  return [
    'julkaistu',
    'luonnos',
    'poistettu',
    'kaikki',
  ];
});

const koulutustyyppiValinnat = computed(() => {
  return _.uniq(_.map(suunnitelmat.value, 'koulutustyyppi'));
});

const maxViimeisinTilaMuutosAikaInYears = computed(() => {
  return new Date(_.max(_.map(suunnitelmat.value, 'viimeisinTilaMuutosAika'))).getFullYear();
});

const minViimeisinTilaMuutosAikaInYears = computed(() => {
  return new Date(_.min(_.map(suunnitelmat.value, 'viimeisinTilaMuutosAika'))).getFullYear();
});

const vuosivalinnat = computed(() => {
  return _.range(
    minViimeisinTilaMuutosAikaInYears.value,
    maxViimeisinTilaMuutosAikaInYears.value + 1);
});

const tilastoitavatAjat = computed(() => {
  if (ajanjakso.value === 'kuukausi') {
    return _.map(_.range(0, 12), kuukausi => {
      return {
        alkupvm: new Date(vuosi.value!, kuukausi, 1).getTime(),
        loppupvm: new Date(vuosi.value!, kuukausi + 1, 0, 23, 59, 59).getTime(),
      };
    });
  }
  else {
    return _.map(vuosivalinnat.value, vuosi => {
      return {
        alkupvm: new Date(vuosi, 0, 1).getTime(),
        loppupvm: new Date(vuosi, 11, 31, 23, 59, 59).getTime(),
      };
    });
  }
});

const suunnitelmatFiltered = computed(() => {
  return _.chain(suunnitelmat.value)
    .filter(suunnitelma => _.size(koulutustyyppi.value) === 0 || _.includes(koulutustyyppi.value, suunnitelma.koulutustyyppi))
    .value();
});

const aikaFormat = computed(() => {
  return ajanjakso.value === 'kuukausi' ? 'M/y' : 'y';
});

const emptyLukumaaraObject = (aika) => {
  return {
    aika,
    julkaistut: 0,
    luonnokset: 0,
    arkistoidut: 0,
    kaikki: 0,
  };
};

const suunnitelmaLukumaarat = computed(() => {
  return _.map(tilastoitavatAjat.value, aika => {
    const suunnitelmat = suunnitelmatTilastoksi(suunnitelmatFiltered.value, aika.alkupvm, aika.loppupvm);
    const aikaFormatted = moment(aika.alkupvm).format(aikaFormat.value);

    if (aika.alkupvm > new Date().getTime()) {
      return emptyLukumaaraObject(aikaFormatted);
    }

    return {
      aika: aikaFormatted,
      julkaistut: _.sumBy(suunnitelmat, 'julkaistut'),
      luonnokset: _.sumBy(suunnitelmat, 'luonnokset'),
      arkistoidut: _.sumBy(suunnitelmat, 'arkistoidut'),
      kaikki: _.sumBy(suunnitelmat, 'yhteensa'),
    };
  });
});

const tilaColors = computed(() => {
  return {
    'julkaistu': '#008ffbd9',
    'luonnos': '#00e396d9',
    'poistettu': '#feb019d9',
    'kaikki': '#ff4560d9',
  };
});

const selectedTilaColors = computed(() => {
  return [
    ...(_.size(tila.value) === 0 || _.includes(tila.value, 'julkaistu') ? [tilaColors.value['julkaistu']] : []),
    ...(_.size(tila.value) === 0 || _.includes(tila.value, 'luonnos') ? [tilaColors.value['luonnos']] : []),
    ...(_.size(tila.value) === 0 || _.includes(tila.value, 'poistettu') ? [tilaColors.value['poistettu']] : []),
    ...(_.size(tila.value) === 0 || _.includes(tila.value, 'kaikki') ? [tilaColors.value['kaikki']] : []),
  ];
});

const maxKaikki = computed(() => {
  return _.maxBy(suunnitelmaLukumaarat.value, 'kaikki')?.kaikki ?? 0;
});

const chartOptions = computed(() => {
  return {
    type: 'bar',
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
    },
    xaxis: {
      categories: _.map(suunnitelmaLukumaarat.value, 'aika'),
    },
    yaxis: {
      stepSize: _.floor(maxKaikki.value / 10),
    },
    colors: selectedTilaColors.value,
    chart: {
      animations: {
        enabled: false,
      },
    },
  };
});

const chartSeries = computed(() => {
  return [
    ...(_.size(tila.value) === 0 || _.includes(tila.value, 'julkaistu') ? [{
      name: $t('julkaistut'),
      data: _.map(suunnitelmaLukumaarat.value, 'julkaistut'),
    }] : []),
    ...(_.size(tila.value) === 0 || _.includes(tila.value, 'luonnos') ? [{
      name: $t('luonnokset'),
      data: _.map(suunnitelmaLukumaarat.value, 'luonnokset'),
    }] : []),
    ...(_.size(tila.value) === 0 || _.includes(tila.value, 'poistettu') ? [{
      name: $t('arkistoidut'),
      data: _.map(suunnitelmaLukumaarat.value, 'arkistoidut'),
    }] : []),
    ...(_.size(tila.value) === 0 || _.includes(tila.value, 'kaikki') ? [{
      name: $t('kaikki'),
      data: _.map(suunnitelmaLukumaarat.value, 'kaikki'),
    }] : []),
  ];
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.koulutustyyppi-select {
  min-width: 500px;
  max-width:800px;
}

:deep(.apexcharts-tooltip.apexcharts-theme-light .apexcharts-tooltip-title) {
  background: $white;
  border: none;
}

:deep(.apexcharts-tooltip-y-group) {
  padding: 0;
}

:deep(.form-content) {
  margin-bottom: 0;
}

</style>
