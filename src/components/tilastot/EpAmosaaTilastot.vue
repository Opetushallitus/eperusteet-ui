<template>
    <ep-spinner v-if="!toteutussuunnitelmat" />
    <div v-else>

      <div class="row">
        <div class="col-xl-3 col-md-6 col-sm-12">
          <ep-form-content name="nimi">
            <ep-search v-model="query" :placeholder="$t('etsi-toteutussuunnitelmia')"/>
          </ep-form-content>
        </div>

        <div class="col-xl-3 col-md-6 col-sm-12">
          <ep-form-content name="koulutustyyppi">
            <ep-multi-select :multiple="true"
              id="koulutustyyppiFilter"
              :is-editing="true"
              :options="koulutustyyppiItems"
              v-model="valitutKoulutustyypit"
              :placeholder="$t('kaikki')"
              track-by="value"
              label="text">
            </ep-multi-select>
          </ep-form-content>
        </div>

        <div class="col-xl-3 col-md-6 col-sm-12">
          <ep-form-content name="tila">
            <ep-multi-select :multiple="true"
              id="tilaFilter"
              :is-editing="true"
              :options="tilaItems"
              v-model="valitutTilat"
              :placeholder="$t('kaikki')"
              track-by="value"
              label="text">
            </ep-multi-select>
          </ep-form-content>
        </div>

        <div class="col-xl-3 col-md-6 col-sm-12">
          <ep-form-content name="voimassaolo">
            <ep-multi-select :multiple="true"
              id="voimassaoloFilter"
              :is-editing="true"
              :options="voimassaoloItems"
              v-model="valitutVoimassaolot"
              :placeholder="$t('kaikki')"
              track-by="value"
              label="text">
            </ep-multi-select>
          </ep-form-content>
        </div>

        <EpTilastoAikavaliVertailu class="col-12" v-model="aikavali"/>

        <div class="col-xl-6 col-md-6 col-sm-12">
          <ep-form-content name="peruste">
            <ep-multi-select :multiple="true"
              id="perusteFilter"
              :is-editing="true"
              :options="perusteItems"
              v-model="valitutPerusteet"
              :placeholder="$t('kaikki')"
              track-by="value"
              label="text">
            </ep-multi-select>
          </ep-form-content>
        </div>

        <div class="col-xl-6 col-md-6 col-sm-12">
          <ep-form-content name="koulutustoimija">
            <ep-multi-select :multiple="true"
              id="koulutustoimijaFilter"
              :is-editing="true"
              :options="koulutustoimijaItems"
              v-model="valitutKoulutustoimijat"
              :placeholder="$t('kaikki')"
              track-by="value"
              label="text">
            </ep-multi-select>
          </ep-form-content>
        </div>
      </div>

      <h2 class="mt-5">{{$t('toteutussuunnitelmien-lukumaarat')}} </h2>

      <div class="row">
        <div class="col-xl-4 col-md-6 col-sm-12 tilastotyyppi" v-for="(tilastotieto,i) in statistiikkaData" :key="i">
          <div class="otsake">{{$t(tilastotieto.otsikko)}}</div>
          <apexchart type="donut" :options="tilastotieto.graafiAvaimet" :series="tilastotieto.graafiData" v-if="toteutussuunnitelmatFiltered.length > 0"/>
          <apexchart type="donut" :options="tyhjaGraafiOptions" :series="tyhjaGraafiData" v-else/>
        </div>
      </div>

      <h2 class="mt-5">{{$t('toteutussuunnitelmat')}} {{toteutussuunnitelmatFiltered.length}} {{$t('kpl')}}</h2>

      <b-table responsive
                borderless
                striped
                fixed
                :items="toteutussuunnitelmatFiltered"
                :fields="toteutussuunnitelmaFields"
                :current-page="opsPage"
                :per-page="perPage">
        <template v-slot:cell(nimi)="{item, value}">
          <a :href="item.url" rel="noopener noreferrer" target="_blank">{{ value }}</a>
        </template>
      </b-table>

      <b-pagination
        v-model="opsPage"
        :total-rows="toteutussuunnitelmatFiltered.length"
        :per-page="perPage"
        aria-controls="opetussuunnitelmat"
        align="center">
      </b-pagination>

      <h2 class="mt-5">{{$t('koulutustoimijat')}} {{koulutustoimijatFiltered.length}} {{$t('kpl')}}</h2>

      <b-table responsive
                borderless
                striped
                fixed
                :items="koulutustoimijatFiltered"
                :fields="koulutustoimijaFields"
                :current-page="ktPage"
                :per-page="perPage">
      </b-table>

      <b-pagination
        v-model="ktPage"
        :total-rows="koulutustoimijatFiltered.length"
        :per-page="perPage"
        aria-controls="opetussuunnitelmat"
        align="center">
      </b-pagination>

    </div>

</template>

<script lang="ts" >
import { Component, Vue, Prop } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { EPERUSTEET_KOULUTUSTYYPPI_PAIKALLISET_SOVELLUKSET, EPERUSTEET_SOVELLUKSET } from '@shared/plugins/oikeustarkastelu';
import EpTilastoAikavaliVertailu, { AikavaliVertailu } from '@/components/tilastot/EpTilastoAikavaliVertailu.vue';

@Component({
  components: {
    EpMainView,
    EpSpinner,
    EpFormContent,
    EpMultiSelect,
    EpSearch,
    EpTilastoAikavaliVertailu,
  },
})
export default class EpAmosaaTilastot extends Vue {
  @Prop({ required: true })
  private toteutussuunnitelmat!: any[];

  private opsPage = 1;
  private ktPage = 1;
  private perPage = 10;
  private query = '';
  private valitutTilat: [] = [];
  private valitutKoulutustyypit: [] = [];
  private valitutVoimassaolot: [] = [];
  private valitutPerusteet: [] = [];
  private valitutKoulutustoimijat: [] = [];
  private aikavali: AikavaliVertailu = {};

  get toteutussuunnitelmatFilled() {
    if (this.toteutussuunnitelmat) {
      return _.map(this.toteutussuunnitelmat, toteutussuunnitelma => {
        return {
          ...toteutussuunnitelma,
          voimassaolo: this.toteutussuunnitelmaVoimassaolo(toteutussuunnitelma),
          url: _.find(EPERUSTEET_SOVELLUKSET, sovellus => sovellus.sovellus === EPERUSTEET_KOULUTUSTYYPPI_PAIKALLISET_SOVELLUKSET[toteutussuunnitelma.koulutustyyppi])?.url
              + '/fi/koulutustoimija/' + toteutussuunnitelma.koulutustoimija.id + '/toteutussuunnitelma/' + toteutussuunnitelma.id,
        };
      });
    }
  }

  get toteutussuunnitelmatFiltered() {
    return _.chain(this.toteutussuunnitelmatFilled)
      .filter(toteutussuunnitelma => _.isEmpty(this.valitutTilat) || _.includes(_.map(this.valitutTilat, 'value'), toteutussuunnitelma.tila))
      .filter(toteutussuunnitelma => _.isEmpty(this.valitutKoulutustyypit) || _.includes(_.map(this.valitutKoulutustyypit, 'value'), toteutussuunnitelma.koulutustyyppi))
      .filter(toteutussuunnitelma => Kielet.search(this.query, toteutussuunnitelma.nimi))
      .filter(toteutussuunnitelma => _.isEmpty(this.valitutVoimassaolot) || _.includes(_.map(this.valitutVoimassaolot, 'value'), toteutussuunnitelma.voimassaolo))
      .filter(toteutussuunnitelma => _.isEmpty(this.valitutPerusteet) || _.includes(_.map(this.valitutPerusteet, 'value'), toteutussuunnitelma.perusteId))
      .filter(toteutussuunnitelma => _.isEmpty(this.valitutKoulutustoimijat) || _.includes(_.map(this.valitutKoulutustoimijat, 'value'), toteutussuunnitelma.koulutustoimija!.id))
      .filter(toteutussuunnitelma => this.aikavertailu(toteutussuunnitelma))
      .sortBy(toteutussuunnitelma => Kielet.kaanna(toteutussuunnitelma.nimi))
      .value();
  }

  get aikavaliValue() {
    return _.get(this.aikavali, 'tyyppi.value');
  }

  aikavertailu(toteutussuunnitelma) {
    if (!this.aikavaliValue) {
      return true;
    }

    if (_.get(toteutussuunnitelma, this.aikavaliValue) === null) {
      return false;
    }

    return toteutussuunnitelma[this.aikavaliValue] >= this.aikavaliAlkuVrt && toteutussuunnitelma[this.aikavaliValue] <= this.aikavaliLoppuVrt;
  }

  get aikavaliAlkuVrt() {
    return this.aikavali?.aikavaliAlku ? this.aikavali.aikavaliAlku : new Date(0);
  }

  get aikavaliLoppuVrt() {
    return this.aikavali?.aikavaliLoppu ? this.aikavali.aikavaliLoppu : new Date(8640000000000000);
  }

  toteutussuunnitelmaVoimassaolo(toteutussuunnitelma) {
    if (toteutussuunnitelma.paatospaivamaara && toteutussuunnitelma.paatospaivamaara < new Date()) {
      return 'paattyneet';
    }

    if (toteutussuunnitelma.voimaantulo > new Date()) {
      return 'tulevat';
    }

    return 'voimassaolevat';
  }

  get koulutustoimijatFiltered() {
    return _.chain(this.toteutussuunnitelmatFiltered)
      .map('koulutustoimija')
      .uniqWith(_.isEqual)
      .map(koulutustoimija => {
        return {
          koulutustoimija: koulutustoimija,
          luonnos: _.size(_.groupBy(this.toteutussuunnitelmatByKoulutustoimijaId[koulutustoimija!.id!], 'tila')['luonnos']),
          valmis: _.size(_.groupBy(this.toteutussuunnitelmatByKoulutustoimijaId[koulutustoimija!.id!], 'tila')['valmis']),
          julkaistu: _.size(_.groupBy(this.toteutussuunnitelmatByKoulutustoimijaId[koulutustoimija!.id!], 'tila')['julkaistu']),
        };
      })
      .value();
  }

  get toteutussuunnitelmatByKoulutustoimijaId() {
    return _.groupBy(this.toteutussuunnitelmatFiltered, 'koulutustoimija.id');
  }

  get koulutustyyppiItems() {
    return _.chain(this.toteutussuunnitelmatFilled)
      .map(toteutussuunnitelma => {
        return {
          text: toteutussuunnitelma.koulutustyyppi ? this.$t(toteutussuunnitelma.koulutustyyppi as string) : this.$t('null'),
          value: toteutussuunnitelma.koulutustyyppi,
        };
      })
      .uniqWith(_.isEqual)
      .filter('text')
      .value();
  }

  get tilaItems() {
    return _.chain(this.toteutussuunnitelmatFilled)
      .map(toteutussuunnitelma => {
        return {
          text: this.$t(toteutussuunnitelma.tila as string),
          value: toteutussuunnitelma.tila,
        };
      })
      .uniqWith(_.isEqual)
      .filter('text')
      .value();
  }

  get voimassaoloItems() {
    return _.chain(this.toteutussuunnitelmatFilled)
      .map(toteutussuunnitelma => {
        return {
          text: this.$t(toteutussuunnitelma.voimassaolo as string),
          value: toteutussuunnitelma.voimassaolo,
        };
      })
      .uniqWith(_.isEqual)
      .value();
  }

  get koulutustoimijaItems() {
    return _.chain(this.toteutussuunnitelmatFilled)
      .map(toteutussuunnitelma => {
        return {
          value: toteutussuunnitelma.koulutustoimija!.id,
          text: (this as any).$kaanna(toteutussuunnitelma.koulutustoimija!.nimi),
        };
      })
      .uniqWith(_.isEqual)
      .value();
  }

  get perusteItems() {
    return _.chain(this.toteutussuunnitelmatFilled)
      .filter('perusteNimi')
      .map(toteutussuunnitelma => {
        return {
          value: toteutussuunnitelma.perusteId,
          text: (this as any).$kaanna(toteutussuunnitelma.perusteNimi),
        };
      })
      .uniqBy('value')
      .value();
  }

  get statistiikkaData() {
    return _.map(_.keys(this.statistiikka), otsikko => {
      return {
        otsikko: otsikko,
        graafiAvaimet: this.chartOptions(otsikko),
        graafiData: this.series(otsikko),
      };
    });
  }

  get statistiikka() {
    return {
      koulutustyypeittain: _.groupBy(this.toteutussuunnitelmatFiltered, 'koulutustyyppi'),
      tiloittain: _.groupBy(this.toteutussuunnitelmatFiltered, 'tila'),
      kielittain: _.omitBy({
        fi: _.filter(this.toteutussuunnitelmatFiltered, (ops) => _.includes(ops.julkaisukielet as any, 'fi')),
        sv: _.filter(this.toteutussuunnitelmatFiltered, (ops) => _.includes(ops.julkaisukielet as any, 'sv')),
        en: _.filter(this.toteutussuunnitelmatFiltered, (ops) => _.includes(ops.julkaisukielet as any, 'en')),
        se: _.filter(this.toteutussuunnitelmatFiltered, (ops) => _.includes(ops.julkaisukielet as any, 'se')),
      }, _.isEmpty),
    };
  }

  chartOptions(otsikko) {
    return {
      labels: _.map(_.keys(this.statistiikka![otsikko]), (alaotsikko) => this.$t(alaotsikko)),
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#000'],
          fontWeight: '400',
        },
        dropShadow: {
          enabled: false,
        },
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        show: true,
        formatter: function(seriesName, opts) {
          return [seriesName, ': ', opts.w.globals.series[opts.seriesIndex]];
        },
      },
      tooltip: {
        enabled: true,
      },
      colors: ['#82D4FF', '#9DDF72', '#FFD900', '#F166C0', '#B2B2B2', '#99B3F1', '#7CD443', '#FACCEA', '#CDEEFF', '#C126B8'],
    };
  }

  series(avain) {
    return _.map(this.statistiikka![avain], (value) => _.size(value));
  }

  get tyhjaGraafiOptions() {
    return {
      labels: [''],
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      colors: ['#546E7A'],
    };
  }

  get tyhjaGraafiData() {
    return [1];
  }

  get toteutussuunnitelmaFields() {
    return [{
      key: 'nimi',
      label: this.$t('toteutussuunnitelman-nimi'),
      sortable: true,
      sortByFormatted: true,
      formatter: (value, key, item) => {
        return (this as any).$kaanna(value);
      },
    }, {
      key: 'koulutustyyppi',
      label: this.$t('koulutustyyppi'),
      sortable: true,
      thStyle: { width: '20%' },
      sortByFormatted: true,
      formatter: (value, key, item) => {
        return (this as any).$t(value);
      },
    }, {
      key: 'tila',
      label: this.$t('tila'),
      sortable: true,
      thStyle: { width: '10%' },
      sortByFormatted: true,
      formatter: (value, key, item) => {
        return (this as any).$t(value);
      },
    }, {
      key: 'voimaantulo',
      label: this.$t('voimassaolo-alkaa'),
      sortable: true,
      thStyle: { width: '130px', paddingTop: '0px' },
      formatter: (value, key, item) => {
        return value ? (this as any).$sd(value) : '';
      },
    }, {
      key: 'paatospaivamaara',
      label: this.$t('paatospaivamaara-lyhyt'),
      sortable: true,
      thStyle: { width: '130px', paddingTop: '0px' },
      formatter: (value, key, item) => {
        return value ? (this as any).$sd(value) : '';
      },
    }, {
      key: 'julkaistu',
      label: this.$t('julkaistu'),
      sortable: true,
      thStyle: { width: '130px', paddingTop: '0px' },
      formatter: (value, key, item) => {
        return value ? (this as any).$sd(value) : '';
      },
    }, {
    }, {
      key: 'ensijulkaisu',
      label: this.$t('ensijulkaisu'),
      sortable: true,
      thStyle: { width: '130px', paddingTop: '0px' },
      formatter: (value, key, item) => {
        return value ? (this as any).$sd(value) : '';
      },
    }, {
      key: 'luotu',
      label: this.$t('luotu'),
      sortable: true,
      thStyle: { width: '130px', paddingTop: '0px' },
      formatter: (value, key, item) => {
        return value ? (this as any).$sd(value) : '';
      },
    }];
  }

  get koulutustoimijaFields() {
    return [{
      key: 'koulutustoimija',
      label: this.$t('koulutustoimija'),
      sortable: true,
      sortByFormatted: true,
      formatter: (value, key, item) => {
        return (this as any).$kaanna(value.nimi);
      },
    }, {
      key: 'luonnos',
      label: this.$t('luonnokset'),
      sortable: true,
      thStyle: { width: '15%' },
    }, {
      key: 'valmis',
      label: this.$t('valmiit'),
      sortable: true,
      thStyle: { width: '15%' },
    }, {
      key: 'julkaistu',
      label: this.$t('julkaistut'),
      sortable: true,
      thStyle: { width: '15%' },
    }];
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .tilastotyyppi {
    margin-top: 20px;
    margin-bottom: 20px;

    .otsake {
      margin-bottom:20px;
    }

  }

</style>
