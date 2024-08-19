<template>
  <div>
    <EpSpinner v-if="!toteutussuunnitelmat || !opetussuunnitelmat" />

    <template v-else>

      <div class="d-flex">
        <ep-form-content name="koulutustyyppi">
          <koulutustyyppi-select class="koulutustyyppi-select" v-model="koulutustyyppi" :isEditing="true" :koulutustyypit="koulutustyyppiValinnat"/>
        </ep-form-content>
        <ep-form-content name="ajanjakso" class="ml-5">
          <b-form-group class="mt-0">
            <b-form-radio
              v-model="ajanjakso"
              name="ajanjakso"
              value="kuukausi">{{ $t('kuukausittain') }}
            </b-form-radio>
            <b-form-radio
              v-model="ajanjakso"
              name="ajanjakso"
              value="vuosi">{{ $t('vuosittain') }}
            </b-form-radio>
          </b-form-group>
        </ep-form-content>
        <ep-form-content name="vuosi" class="ml-5">
          <b-form-select v-model="vuosi" :options="vuosivalinnat" :disabled="ajanjakso === 'vuosi'"/>
        </ep-form-content>
      </div>

      <ep-form-content name="tila" class="mb-4">
        <b-form-checkbox-group v-model="tila">
          <b-form-checkbox v-for="tila in tilaValinnat" :key="'tila' + tila" :value="tila">{{$t(tila)}}</b-form-checkbox>
        </b-form-checkbox-group>
      </ep-form-content>

      <div class="mb-2">{{$t('suunnitelmien-lukumaarat-graafi-selite')}}</div>

      <apexchart type="bar" :options="chartOptions" :series="chartSeries" height="500px" width="75%"/>
    </template>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TilastotStore } from '@/stores/TilastotStore';
import { suunnitelmatTilastoksi } from './tilastot';
import moment from 'moment';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';

type Ajanjakso = 'kuukausi' | 'vuosi';

@Component({
  components: {
    KoulutustyyppiSelect,
  },
})
export default class EpLukumaaraGraafit extends Vue {
  @Prop({ required: true })
  private tilastotStore!: TilastotStore;

  koulutustyyppi: string[] | null = null;
  tila: string[] | null = null;
  ajanjakso: Ajanjakso = 'kuukausi';
  vuosi: number | null = null;

  mounted() {
    this.vuosi = new Date().getFullYear();
    this.tila = [];
    this.koulutustyyppi = [];
  }

  get toteutussuunnitelmat() {
    return this.tilastotStore.toteutussuunnitelmat.value;
  }

  get opetussuunnitelmat() {
    return this.tilastotStore.opetussuunnitelmat.value;
  }

  get suunnitelmat() {
    return [
      ...this.toteutussuunnitelmat ?? [],
      ...this.opetussuunnitelmat ?? [],
    ];
  }

  get tilaValinnat() {
    return [
      'julkaistu',
      'luonnos',
      'poistettu',
      'kaikki',
    ];
  }

  get koulutustyyppiValinnat() {
    return _.uniq(_.map(this.suunnitelmat, 'koulutustyyppi'));
  }

  get maxViimeisinTilaMuutosAikaInYears() {
    return new Date(_.max(_.map(this.suunnitelmat, 'viimeisinTilaMuutosAika'))).getFullYear();
  }

  get minViimeisinTilaMuutosAikaInYears() {
    return new Date(_.min(_.map(this.suunnitelmat, 'viimeisinTilaMuutosAika'))).getFullYear();
  }

  get vuosivalinnat() {
    return _.range(
      this.minViimeisinTilaMuutosAikaInYears,
      this.maxViimeisinTilaMuutosAikaInYears + 1);
  }

  get tilastoitavatAjat() {
    if (this.ajanjakso === 'kuukausi') {
      return _.map(_.range(0, 12), kuukausi => {
        return {
          alkupvm: new Date(this.vuosi!, kuukausi, 1).getTime(),
          loppupvm: new Date(this.vuosi!, kuukausi + 1, 0, 23, 59, 59).getTime(),
        };
      });
    }
    else {
      return _.map(this.vuosivalinnat, vuosi => {
        return {
          alkupvm: new Date(vuosi, 0, 1).getTime(),
          loppupvm: new Date(vuosi, 11, 31, 23, 59, 59).getTime(),
        };
      });
    }
  }

  get suunnitelmatFiltered() {
    return _.chain(this.suunnitelmat)
      .filter(suunnitelma => _.size(this.koulutustyyppi) === 0 || _.includes(this.koulutustyyppi, suunnitelma.koulutustyyppi))
      .value();
  }

  get aikaFormat() {
    return this.ajanjakso === 'kuukausi' ? 'M/y' : 'y';
  }

  get suunnitelmaLukumaarat() {
    return _.map(this.tilastoitavatAjat, aika => {
      const suunnitelmat = suunnitelmatTilastoksi(this.suunnitelmatFiltered, aika.alkupvm, aika.loppupvm);
      const aikaFormatted = moment(aika.alkupvm).format(this.aikaFormat);

      if (aika.alkupvm > new Date().getTime()) {
        return this.emptyLukumaaraObject(aikaFormatted);
      }

      return {
        aika: aikaFormatted,
        julkaistut: _.sumBy(suunnitelmat, 'julkaistut'),
        luonnokset: _.sumBy(suunnitelmat, 'luonnokset'),
        arkistoidut: _.sumBy(suunnitelmat, 'arkistoidut'),
        kaikki: _.sumBy(suunnitelmat, 'yhteensa'),
      };
    });
  }

  emptyLukumaaraObject(aika) {
    return {
      aika,
      julkaistut: 0,
      luonnokset: 0,
      arkistoidut: 0,
      kaikki: 0,
    };
  }

  get chartOptions() {
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
        categories: _.map(this.suunnitelmaLukumaarat, 'aika'),
      },
      yaxis: {
        stepSize: _.floor(this.maxKaikki / 10),
      },
      colors: this.selectedTilaColors,
      chart: {
        animations: {
          enabled: false,
        },
      }
    };
  }

  get selectedTilaColors() {
    return [
      ...(_.size(this.tila) === 0 || _.includes(this.tila, 'julkaistu') ? [this.tilaColors['julkaistu']] : []),
      ...(_.size(this.tila) === 0 || _.includes(this.tila, 'luonnos') ? [this.tilaColors['luonnos']] : []),
      ...(_.size(this.tila) === 0 || _.includes(this.tila, 'poistettu') ? [this.tilaColors['poistettu']] : []),
      ...(_.size(this.tila) === 0 || _.includes(this.tila, 'kaikki') ? [this.tilaColors['kaikki']] : []),
    ];
  }

  get tilaColors() {
    return {
      'julkaistu': '#008ffbd9',
      'luonnos': '#00e396d9',
      'poistettu': '#feb019d9',
      'kaikki': '#ff4560d9',
    };
  }

  get maxKaikki() {
    return _.maxBy(this.suunnitelmaLukumaarat, 'kaikki')?.kaikki ?? 0;
  }

  get chartSeries() {
    return [
      ...(_.size(this.tila) === 0 || _.includes(this.tila, 'julkaistu') ? [{
        name: this.$t('julkaistut'),
        data: _.map(this.suunnitelmaLukumaarat, 'julkaistut'),
      }] : []),
      ...(_.size(this.tila) === 0 || _.includes(this.tila, 'luonnos') ? [{
        name: this.$t('luonnokset'),
        data: _.map(this.suunnitelmaLukumaarat, 'luonnokset'),
      }] : []),
      ...(_.size(this.tila) === 0 || _.includes(this.tila, 'poistettu') ? [{
        name: this.$t('arkistoidut'),
        data: _.map(this.suunnitelmaLukumaarat, 'arkistoidut'),
      }] : []),
      ...(_.size(this.tila) === 0 || _.includes(this.tila, 'kaikki') ? [{
        name: this.$t('kaikki'),
        data: _.map(this.suunnitelmaLukumaarat, 'kaikki'),
      }] : []),
    ];
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.koulutustyyppi-select {
  min-width: 500px;
  max-width:800px;
}

::v-deep .apexcharts-tooltip.apexcharts-theme-light .apexcharts-tooltip-title {
  background: $white;
  border: none;
}

::v-deep .apexcharts-tooltip-y-group {
  padding: 0;
}

::v-deep .form-content {
  margin-bottom: 0;
}

</style>
