<template>
  <ep-spinner v-if="!opetussuunnitelmat || !perusteet" />
  <div v-else >

    <div class="row">
      <div class="col-xl-3 col-md-6 col-sm-12">
        <ep-form-content name="nimi">
          <ep-search v-model="query" />
        </ep-form-content>
      </div>

      <div class="col-xl-3 col-md-6 col-sm-12">
        <ep-form-content name="koulutustyyppi">
          <ep-multi-select :multiple="true"
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
        <ep-form-content name="koulutuksenjarjestaja">
          <ep-multi-select :multiple="true"
            :is-editing="true"
            :options="koulutuksenjarjestajaItems"
            v-model="valitutKoulutuksenjarjestajat"
            :placeholder="$t('kaikki')"
            track-by="value"
            label="text">
          </ep-multi-select>
        </ep-form-content>
      </div>

      <div class="col-xl-3 col-md-3 col-sm-12">
        <ep-form-content name="koulutuksenjarjestajan-tyyppi">
          <ep-multi-select :multiple="true"
            :is-editing="true"
            :options="koulutuksenjarjestajaTyyppiItems"
            v-model="valitutKoulutuksenjarjestajaTyypit"
            :placeholder="$t('kaikki')"
            track-by="value"
            label="text">
          </ep-multi-select>
        </ep-form-content>
      </div>
    </div>

    <h2 class="mt-5">{{$t('opetussuunnitelmien-lukumaarat')}}</h2>

    <div class="row">
      <div class="col-xl-4 col-md-6 col-sm-12 tilastotyyppi" v-for="(tilastotieto,i) in statistiikkaData" :key="i">
        <div class="otsake">{{$t(tilastotieto.otsikko)}}</div>
        <apexchart type="donut" :options="tilastotieto.graafiAvaimet" :series="tilastotieto.graafiData" v-if="!opetussuunnitelmatEmpty"/>
        <apexchart type="donut" :options="tyhjaGraafiOptions" :series="tyhjaGraafiData" v-else/>
      </div>
    </div>

    <h2 class="mt-5">{{$t('opetussuunnitelmat')}} {{opetussuunnitelmatFiltered.length}} {{$t('kpl')}}</h2>

    <b-table responsive
            borderless
            striped
            fixed
            :items="opetussuunnitelmatFiltered"
            :fields="tableFields"
            :current-page="currentPage"
            :per-page="perPage">

      <template v-slot:cell(nimi)="{item, value}">
        <a :href="item.url" rel="noopener noreferrer" target="_blank">{{ value }}</a>
      </template>

      <template v-slot:cell(koulutustyyppi)="data">
        {{ $t(data.value) }}
      </template>

      <template v-slot:cell(tila)="data">
        {{ $t(data.value) }}
      </template>

      <template v-slot:cell(perusteenVoimassaoloAlkaa)="data">
        {{ $sd(data.value) }}
      </template>

      <template v-slot:cell(perusteenVoimassaoloLoppuu)="data">
        {{ $sd(data.value) }}
      </template>

    </b-table>

    <b-pagination
      v-model="currentPage"
      :total-rows="opetussuunnitelmatFiltered.length"
      :per-page="perPage"
      aria-controls="opetussuunnitelmat"
      align="center">
    </b-pagination>

    <h2 class="mt-5">{{$t('koulutuksenjarjestajat')}} {{koulutuksenjarjestajaFiltered.length}} {{$t('kpl')}}</h2>

      <b-table responsive
                borderless
                striped
                fixed
                :items="koulutuksenjarjestajaFiltered"
                :fields="koulutuksenjarjestajaFields"
                :current-page="koulutuksenjarjestajaPage"
                :per-page="perPage">
      </b-table>

      <b-pagination
        v-model="koulutuksenjarjestajaPage"
        :total-rows="koulutuksenjarjestajaFiltered.length"
        :per-page="perPage"
        aria-controls="opetussuunnitelmat"
        align="center">
      </b-pagination>

  </div>
</template>

<script lang="ts">
import { Prop, Vue, Component, Mixins } from 'vue-property-decorator';
import * as _ from 'lodash';

import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import { Kielet } from '@shared/stores/kieli';
import { EPERUSTEET_KOULUTUSTYYPPI_PAIKALLISET_SOVELLUKSET, EPERUSTEET_SOVELLUKSET } from '@shared/plugins/oikeustarkastelu';
import EpTilastoAikavaliVertailu, { AikavaliVertailu } from '@/components/tilastot/EpTilastoAikavaliVertailu.vue';

@Component({
  components: {
    EpSearch,
    EpSpinner,
    EpMultiSelect,
    EpFormContent,
    EpTilastoAikavaliVertailu,
  },
})
export default class EpYlopsTilastot extends Vue {
  @Prop({ required: true })
  private opetussuunnitelmat!: any[];

  @Prop({ required: true })
  private perusteet!: any[];

  private currentPage = 1;
  private perPage = 10;
  private koulutuksenjarjestajaPage = 1;
  private query = '';
  private valitutTilat: [] = [];
  private valitutKoulutustyypit: [] = [];
  private valitutVoimassaolot: [] = [];
  private valitutPerusteet: [] = [];
  private aikavali: AikavaliVertailu = {};
  private valitutKoulutuksenjarjestajat: [] = [];
  private valitutKoulutuksenjarjestajaTyypit: [] = [];

  get opetussuunnitelmatFilled() {
    if (this.opetussuunnitelmat) {
      return _.map(this.opetussuunnitelmat, ops => {
        return {
          ...ops,
          url: _.find(EPERUSTEET_SOVELLUKSET, sovellus => sovellus.sovellus === EPERUSTEET_KOULUTUSTYYPPI_PAIKALLISET_SOVELLUKSET[ops.koulutustyyppi])?.url + '/#/fi/opetussuunnitelmat/' + ops.id + '/yleisnakyma',

        };
      });
    }
  }

  get opetussuunnitelmatFiltered() {
    return _.chain(this.opetussuunnitelmatFilled)
      .filter(ops => _.isEmpty(this.valitutTilat) || _.includes(_.map(this.valitutTilat, 'value'), ops.tila))
      .filter(ops => _.isEmpty(this.valitutKoulutustyypit) || _.includes(_.map(this.valitutKoulutustyypit, 'value'), ops.koulutustyyppi))
      .filter(ops => Kielet.search(this.query, ops.nimi))
      .filter(ops => _.isEmpty(this.valitutVoimassaolot) || _.includes(_.map(this.valitutVoimassaolot, 'value'), this.opetussuunnitelmaVoimassaolo(ops)))
      .filter(ops => _.isEmpty(this.valitutPerusteet) || _.includes(_.map(this.valitutPerusteet, 'value'), ops.perusteenId))
      .filter(ops => _.isEmpty(this.valitutKoulutuksenjarjestajat) || _.includes(_.map(this.valitutKoulutuksenjarjestajat, 'value'), ops.koulutuksenjarjestaja!.oid))
      .filter(ops => _.isEmpty(this.valitutKoulutuksenjarjestajaTyypit) || _.some(_.map(this.valitutKoulutuksenjarjestajaTyypit, 'value'), tyyppi => _.includes(ops.koulutuksenjarjestaja!.tyypit, tyyppi)))
      .filter(ops => this.aikavertailu(ops))
      .sortBy(ops => Kielet.kaanna(ops.nimi))
      .value();
  }

  get koulutuksenjarjestajaFiltered() {
    return _.chain(this.opetussuunnitelmatFiltered)
      .filter(ops => !!ops.koulutuksenjarjestaja)
      .map('koulutuksenjarjestaja')
      .uniqWith(_.isEqual)
      .map(koulutuksenjarjestaja => {
        return {
          koulutuksenjarjestaja,
          arkistoitu: _.size(_.groupBy(this.koulutuksenjarjestajaByOid[koulutuksenjarjestaja.oid], 'tila')['poistettu']),
          luonnos: _.size(_.groupBy(this.koulutuksenjarjestajaByOid[koulutuksenjarjestaja.oid], 'tila')['luonnos']),
          valmis: _.size(_.groupBy(this.koulutuksenjarjestajaByOid[koulutuksenjarjestaja.oid], 'tila')['valmis']),
          julkaistu: _.size(_.groupBy(this.koulutuksenjarjestajaByOid[koulutuksenjarjestaja.oid], 'tila')['julkaistu']),
        };
      })
      .value();
  }

  get koulutuksenjarjestajaByOid() {
    return _.groupBy(this.opetussuunnitelmatFiltered, 'koulutuksenjarjestaja.oid');
  }

  get aikavaliValue() {
    return _.get(this.aikavali, 'tyyppi.value');
  }

  aikavertailu(ops) {
    if (!this.aikavaliValue) {
      return true;
    }

    if (_.get(ops, this.aikavaliValue) === null) {
      return false;
    }

    return ops[this.aikavaliValue] >= this.aikavaliAlkuVrt && ops[this.aikavaliValue] <= this.aikavaliLoppuVrt;
  }

  get aikavaliAlkuVrt() {
    return this.aikavali?.aikavaliAlku ? this.aikavali.aikavaliAlku : new Date(0);
  }

  get aikavaliLoppuVrt() {
    return this.aikavali?.aikavaliLoppu ? this.aikavali.aikavaliLoppu : new Date(8640000000000000);
  }

  opetussuunnitelmaVoimassaolo(ops) {
    if (ops.perusteenVoimassaoloLoppuu && ops.perusteenVoimassaoloLoppuu < new Date()) {
      return 'paattynyt';
    }

    if (ops.perusteenVoimassaoloAlkaa > new Date()) {
      return 'tuleva';
    }

    return 'voimassaoleva';
  }

  get opetussuunnitelmatEmpty() {
    return _.isEmpty(this.opetussuunnitelmatFiltered);
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
      koulutustyypeittain: _.groupBy(this.opetussuunnitelmatFiltered, 'koulutustyyppi'),
      tiloittain: _.groupBy(this.opetussuunnitelmatFiltered, 'tila'),
      kielittain: _.omitBy({
        fi: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.includes(ops.julkaisukielet as any, 'fi')),
        sv: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.includes(ops.julkaisukielet as any, 'sv')),
        en: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.includes(ops.julkaisukielet as any, 'en')),
        se: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.includes(ops.julkaisukielet as any, 'se')),
      }, _.isEmpty),
      tasoittain: _.omitBy({
        seutukunnat: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.size(ops.kunnat) > 1),
        kunnat: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.size(ops.kunnat) === 1),
        koulujoukko: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.size(_.filter(ops.organisaatiot, (org) => _.size(org.tyypit) > 0 && _.head(org.tyypit) === 'Oppilaitos')) > 1),
        koulut: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.size(_.filter(ops.organisaatiot, (org) => _.size(org.tyypit) > 0 && _.head(org.tyypit) === 'Oppilaitos')) === 1),
      }, _.isEmpty),
      perusteittain: _.groupBy(this.opetussuunnitelmatFiltered, 'perusteenId'),
    };
  }

  get tableFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
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
    }, {
      key: 'tila',
      label: this.$t('tila'),
      sortable: true,
      thStyle: { width: '10%' },
    }, {
      key: 'perusteenVoimassaoloAlkaa',
      label: this.$t('voimassaolo-alkaa'),
      sortable: true,
      thStyle: { width: '130px' },
    }, {
      key: 'perusteenVoimassaoloLoppuu',
      label: this.$t('voimassaolo-paattyy'),
      sortable: true,
      thStyle: { width: '130px' },
    }, {
      key: 'julkaistu',
      label: this.$t('julkaistu'),
      sortable: true,
      thStyle: { width: '130px', paddingTop: '0px' },
      formatter: (value, key, item) => {
        return value ? (this as any).$sd(value) : '';
      },
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

  chartLegends(otsikko) {
    if (otsikko !== 'perusteittain') {
      return _.map(_.keys(this.statistiikka![otsikko]), (alaotsikko) => this.$t(alaotsikko));
    }
    else {
      const perusteet = _.keyBy(this.perusteet, 'id');
      return _.map(_.keys(this.statistiikka![otsikko]), (alaotsikko) => perusteet[alaotsikko] ? (this as any).$kaanna(perusteet[alaotsikko].nimi) : this.$t('null'));
    }
  }

  chartOptions(otsikko) {
    return {
      labels: this.chartLegends(otsikko),
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
        show: (otsikko !== 'perusteittain' || !_.isEmpty(this.valitutPerusteet)),
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

  get koulutustyyppiItems() {
    return _.chain(this.opetussuunnitelmat)
      .map('koulutustyyppi')
      .uniq()
      .map(koulutustyyppi => {
        return {
          text: this.$t(koulutustyyppi),
          value: koulutustyyppi,
        };
      })
      .value();
  }

  get tilaItems() {
    return [
      { text: this.$t('luonnos'), value: 'luonnos' },
      { text: this.$t('valmis'), value: 'valmis' },
      { text: this.$t('julkaistu'), value: 'julkaistu' },
      { text: this.$t('poistettu'), value: 'poistettu' },
    ];
  }

  get voimassaoloItems() {
    return [
      { text: this.$t('voimassaolevat'), value: 'voimassaoleva' },
      { text: this.$t('tulevat'), value: 'tuleva' },
      { text: this.$t('paattyneet'), value: 'paattynyt' },
    ];
  }

  get perusteItems() {
    return _.map(this.perusteet, peruste => {
      return {
        value: peruste.id,
        text: (this as any).$kaanna(peruste.nimi),
      };
    });
  }

  get koulutuksenjarjestajaTyyppiItems() {
    return [
      { text: this.$t('kunta'), value: 'Kunta' },
      { text: this.$t('oppilaitos'), value: 'Oppilaitos' },
    ];
  }

  get tyhjaGraafiOptions() {
    return {
      labels: ['test'],
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

  get koulutuksenjarjestajaFields() {
    return [{
      key: 'koulutuksenjarjestaja',
      label: this.$t('koulutuksenjarjestaja'),
      sortable: true,
      sortByFormatted: true,
      formatter: (value, key, item) => {
        return (this as any).$kaanna(value.nimi);
      },
    }, {
      key: 'arkistoitu',
      label: this.$t('arkistoidut'),
      sortable: true,
      thStyle: { width: '15%' },
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

  get koulutuksenjarjestajaItems() {
    return _.chain(this.opetussuunnitelmatFilled)
      .filter(opetussuunnitelma => !!opetussuunnitelma.koulutuksenjarjestaja)
      .map(opetussuunnitelma => {
        return {
          value: opetussuunnitelma.koulutuksenjarjestaja.oid,
          text: (this as any).$kaanna(opetussuunnitelma.koulutuksenjarjestaja!.nimi),
        };
      })
      .uniqWith(_.isEqual)
      .value();
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
