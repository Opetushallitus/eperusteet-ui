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

    <h2 class="mt-5">
      <span>{{$t('opetussuunnitelmat')}} {{opetussuunnitelmatFiltered.length}} {{$t('kpl')}}</span>
      <EpButton class="ml-5" variant="link" @click="downloadTiedosto('csv')" noPadding>Lataa csv</EpButton>
      <EpButton variant="link" @click="downloadTiedosto('xlsx')" noPadding>Lataa xlsx</EpButton>
    </h2>

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

<script setup lang="ts">
import * as _ from 'lodash';
import { ref, computed } from 'vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import { Kielet } from '@shared/stores/kieli';
import { EPERUSTEET_KOULUTUSTYYPPI_PAIKALLISET_SOVELLUKSET, EPERUSTEET_SOVELLUKSET } from '@shared/plugins/oikeustarkastelu';
import EpTilastoAikavaliVertailu, { AikavaliVertailu } from '@/components/tilastot/EpTilastoAikavaliVertailu.vue';
import { csvAikaleima, dataTiedostoksi } from './tilastot';
import { $t, $kaanna, $sd } from '@shared/utils/globals';
import EpButton from '@shared/components/EpButton/EpButton.vue';

interface Opetussuunnitelma {
  id: string | number;
  nimi: Record<string, string>;
  koulutustyyppi: string;
  tila: string;
  perusteenVoimassaoloAlkaa: Date;
  perusteenVoimassaoloLoppuu?: Date;
  julkaistu?: Date;
  ensijulkaisu?: Date;
  luotu: Date;
  perusteenId?: string | number;
  julkaisukielet?: string[];
  voimassaolo?: string;
  url?: string;
  koulutuksenjarjestaja?: {
    oid: string;
    nimi: Record<string, string>;
  };
  kunnat?: any[];
  organisaatiot?: any[];
}

interface Peruste {
  id: string | number;
  nimi: Record<string, string>;
}

const props = defineProps<{
  opetussuunnitelmat: Opetussuunnitelma[];
  perusteet: Peruste[];
}>();

const currentPage = ref(1);
const perPage = ref(10);
const koulutuksenjarjestajaPage = ref(1);
const query = ref('');
const valitutTilat = ref<Array<{value: string, text: string}>>([]);
const valitutKoulutustyypit = ref<Array<{value: string, text: string}>>([]);
const valitutVoimassaolot = ref<Array<{value: string, text: string}>>([]);
const valitutPerusteet = ref<Array<{value: string | number, text: string}>>([]);
const aikavali = ref<AikavaliVertailu>({});
const valitutKoulutuksenjarjestajat = ref<Array<{value: string, text: string}>>([]);
const valitutKoulutuksenjarjestajaTyypit = ref<Array<{value: string, text: string}>>([]);

const opetussuunnitelmatFilled = computed(() => {
  if (props.opetussuunnitelmat) {
    return _.map(props.opetussuunnitelmat, (opetussuunnitelma: Opetussuunnitelma) => {
      return {
        ...opetussuunnitelma,
        url: _.find(EPERUSTEET_SOVELLUKSET, sovellus => sovellus.sovellus === EPERUSTEET_KOULUTUSTYYPPI_PAIKALLISET_SOVELLUKSET[ops.koulutustyyppi])?.url + '/#/fi/opetussuunnitelmat/' + ops.id + '/yleisnakyma',
      };
    });
  }
  return [];
});

const opetussuunnitelmatFiltered = computed(() => {
  return _.chain(opetussuunnitelmatFilled.value)
    .filter(ops => _.isEmpty(valitutTilat) || _.includes(_.map(valitutTilat, 'value'), ops.tila))
    .filter(ops => _.isEmpty(valitutKoulutustyypit) || _.includes(_.map(valitutKoulutustyypit, 'value'), ops.koulutustyyppi))
    .filter(ops => Kielet.search(query, ops.nimi))
    .filter(ops => _.isEmpty(valitutVoimassaolot) || _.includes(_.map(valitutVoimassaolot, 'value'), opetussuunnitelmaVoimassaolo(ops)))
    .filter(ops => _.isEmpty(valitutPerusteet) || _.includes(_.map(valitutPerusteet, 'value'), ops.perusteenId))
    .filter(ops => _.isEmpty(valitutKoulutuksenjarjestajat) || _.includes(_.map(valitutKoulutuksenjarjestajat, 'value'), ops.koulutuksenjarjestaja!.oid))
    .filter(ops => _.isEmpty(valitutKoulutuksenjarjestajaTyypit)
      || _.some(_.map(valitutKoulutuksenjarjestajaTyypit, 'value'), tyyppi => _.includes(ops.koulutuksenjarjestaja?.tyypit, tyyppi) || (tyyppi === 'maarittelematon' && _.isEmpty(ops.koulutuksenjarjestaja?.tyypit))))
    .filter(ops => aikavertailu(ops))
    .sortBy(ops => Kielet.kaanna(ops.nimi))
    .value();
});

const koulutuksenjarjestajaFiltered = computed(() => {
  const koulutuksenjarjestajaByOid = _.groupBy(opetussuunnitelmatFiltered.value, 'koulutuksenjarjestaja.oid');

  return _.chain(opetussuunnitelmatFiltered.value)
    .filter(ops => !!ops.koulutuksenjarjestaja)
    .map('koulutuksenjarjestaja')
    .uniqWith(_.isEqual)
    .map(koulutuksenjarjestaja => {
      return {
        koulutuksenjarjestaja,
        arkistoitu: _.size(_.groupBy(koulutuksenjarjestajaByOid[koulutuksenjarjestaja.oid], 'tila')['poistettu']),
        luonnos: _.size(_.groupBy(koulutuksenjarjestajaByOid[koulutuksenjarjestaja.oid], 'tila')['luonnos']),
        valmis: _.size(_.groupBy(koulutuksenjarjestajaByOid[koulutuksenjarjestaja.oid], 'tila')['valmis']),
        julkaistu: _.size(_.groupBy(koulutuksenjarjestajaByOid[koulutuksenjarjestaja.oid], 'tila')['julkaistu']),
      };
    })
    .value();
});

const aikavaliValue = computed(() => {
  return _.get(aikavali.value, 'tyyppi.value');
});

function aikavertailu(ops: Opetussuunnitelma) {
  if (!aikavaliValue.value) {
    return true;
  }

  if (_.get(ops, aikavaliValue.value) === null) {
    return false;
  }

  return ops[aikavaliValue.value as keyof Opetussuunnitelma] >= aikavaliAlkuVrt.value &&
         ops[aikavaliValue.value as keyof Opetussuunnitelma] <= aikavaliLoppuVrt.value;
}

const aikavaliAlkuVrt = computed(() => {
  return aikavali.value?.aikavaliAlku ? aikavali.value.aikavaliAlku : new Date(0);
});

const aikavaliLoppuVrt = computed(() => {
  return aikavali.value?.aikavaliLoppu ? aikavali.value.aikavaliLoppu : new Date(8640000000000000);
});

function opetussuunnitelmaVoimassaolo(ops: Opetussuunnitelma) {
  if (ops.perusteenVoimassaoloLoppuu && ops.perusteenVoimassaoloLoppuu < new Date()) {
    return 'paattynyt';
  }

  if (ops.perusteenVoimassaoloAlkaa > new Date()) {
    return 'tuleva';
  }

  return 'voimassaoleva';
}

const opetussuunnitelmatEmpty = computed(() => {
  return _.isEmpty(opetussuunnitelmatFiltered.value);
});

const statistiikka = computed(() => {
  return {
    koulutustyypeittain: _.groupBy(opetussuunnitelmatFiltered.value, 'koulutustyyppi'),
    tiloittain: _.groupBy(opetussuunnitelmatFiltered.value, 'tila'),
    kielittain: _.omitBy({
      fi: _.filter(opetussuunnitelmatFiltered.value, (ops) => _.includes(ops.julkaisukielet as any, 'fi')),
      sv: _.filter(opetussuunnitelmatFiltered.value, (ops) => _.includes(ops.julkaisukielet as any, 'sv')),
      en: _.filter(opetussuunnitelmatFiltered.value, (ops) => _.includes(ops.julkaisukielet as any, 'en')),
      se: _.filter(opetussuunnitelmatFiltered.value, (ops) => _.includes(ops.julkaisukielet as any, 'se')),
    }, _.isEmpty),
    tasoittain: _.omitBy({
      seutukunnat: _.filter(opetussuunnitelmatFiltered.value, (ops) => _.size(ops.kunnat) > 1),
      kunnat: _.filter(opetussuunnitelmatFiltered.value, (ops) => _.size(ops.kunnat) === 1),
      koulujoukko: _.filter(opetussuunnitelmatFiltered.value, (ops) => _.size(_.filter(ops.organisaatiot, (org) => _.size(org.tyypit) > 0 && _.head(org.tyypit) === 'Oppilaitos')) > 1),
      koulut: _.filter(opetussuunnitelmatFiltered.value, (ops) => _.size(_.filter(ops.organisaatiot, (org) => _.size(org.tyypit) > 0 && _.head(org.tyypit) === 'Oppilaitos')) === 1),
    }, _.isEmpty),
    perusteittain: _.groupBy(opetussuunnitelmatFiltered.value, 'perusteenId'),
  };
});

const statistiikkaData = computed(() => {
  return _.map(_.keys(statistiikka.value), otsikko => {
    return {
      otsikko: otsikko,
      graafiAvaimet: chartOptions(otsikko),
      graafiData: series(otsikko),
    };
  });
});

const tableFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
    sortable: true,
    sortByFormatted: true,
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(value);
    },
  }, {
    key: 'koulutustyyppi',
    label: $t('koulutustyyppi'),
    sortable: true,
    thStyle: { width: '20%' },
  }, {
    key: 'tila',
    label: $t('tila'),
    sortable: true,
    thStyle: { width: '10%' },
  }, {
    key: 'perusteenVoimassaoloAlkaa',
    label: $t('voimassaolo-alkaa'),
    sortable: true,
    thStyle: { width: '130px' },
  }, {
    key: 'perusteenVoimassaoloLoppuu',
    label: $t('voimassaolo-paattyy'),
    sortable: true,
    thStyle: { width: '130px' },
  }, {
    key: 'julkaistu',
    label: $t('julkaistu'),
    sortable: true,
    thStyle: { width: '130px', paddingTop: '0px' },
    formatter: (value: any, key: string, item: any) => {
      return value ? $sd(value) : '';
    },
  }, {
    key: 'ensijulkaisu',
    label: $t('ensijulkaisu'),
    sortable: true,
    thStyle: { width: '130px', paddingTop: '0px' },
    formatter: (value: any, key: string, item: any) => {
      return value ? $sd(value) : '';
    },
  }, {
    key: 'luotu',
    label: $t('luotu'),
    sortable: true,
    thStyle: { width: '130px', paddingTop: '0px' },
    formatter: (value: any, key: string, item: any) => {
      return value ? $sd(value) : '';
    },
  }];
});

function chartLegends(otsikko: string) {
  if (otsikko !== 'perusteittain') {
    return _.map(_.keys(statistiikka.value![otsikko]), (alaotsikko) => $t(alaotsikko));
  }
  else {
    const perusteMap = _.keyBy(props.perusteet, 'id');
    return _.map(_.keys(statistiikka.value![otsikko]), (alaotsikko) => perusteMap[alaotsikko] ? $kaanna(perusteMap[alaotsikko].nimi) : $t('null'));
  }
}

function chartOptions(otsikko: string) {
  return {
    labels: chartLegends(otsikko),
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
      show: (otsikko !== 'perusteittain' || !_.isEmpty(valitutPerusteet.value)),
      formatter: function(seriesName: string, opts: any) {
        return [seriesName, ': ', opts.w.globals.series[opts.seriesIndex]];
      },
    },
    tooltip: {
      enabled: true,
    },
    colors: ['#82D4FF', '#9DDF72', '#FFD900', '#F166C0', '#B2B2B2', '#99B3F1', '#7CD443', '#FACCEA', '#CDEEFF', '#C126B8'],
  };
}

function series(avain: string) {
  return _.map(statistiikka.value![avain], (value) => _.size(value));
}

const koulutustyyppiItems = computed(() => {
  return _.chain(props.opetussuunnitelmat)
    .map('koulutustyyppi')
    .uniq()
    .map(koulutustyyppi => {
      return {
        text: $t(koulutustyyppi),
        value: koulutustyyppi,
      };
    })
    .value();
});

const tilaItems = computed(() => {
  return [
    { text: $t('luonnos'), value: 'luonnos' },
    { text: $t('valmis'), value: 'valmis' },
    { text: $t('julkaistu'), value: 'julkaistu' },
    { text: $t('poistettu'), value: 'poistettu' },
  ];
});

const voimassaoloItems = computed(() => {
  return [
    { text: $t('voimassaolevat'), value: 'voimassaoleva' },
    { text: $t('tulevat'), value: 'tuleva' },
    { text: $t('paattyneet'), value: 'paattynyt' },
  ];
});

const perusteItems = computed(() => {
  return _.map(props.perusteet, peruste => {
    return {
      value: peruste.id,
      text: $kaanna(peruste.nimi),
    };
  });
});

const koulutuksenjarjestajaTyyppiItems = computed(() => {
  return [
    { text: $t('maarittelematon'), value: 'maarittelematon' },
    { text: $t('kunta'), value: 'Kunta' },
    { text: $t('oppilaitos'), value: 'Oppilaitos' },
  ];
});

const tyhjaGraafiOptions = computed(() => {
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
});

const tyhjaGraafiData = computed(() => {
  return [1];
});

const koulutuksenjarjestajaFields = computed(() => {
  return [{
    key: 'koulutuksenjarjestaja',
    label: $t('koulutuksenjarjestaja'),
    sortable: true,
    sortByFormatted: true,
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(value.nimi);
    },
  }, {
    key: 'arkistoitu',
    label: $t('arkistoidut'),
    sortable: true,
    thStyle: { width: '15%' },
  }, {
    key: 'luonnos',
    label: $t('luonnokset'),
    sortable: true,
    thStyle: { width: '15%' },
  }, {
    key: 'valmis',
    label: $t('valmiit'),
    sortable: true,
    thStyle: { width: '15%' },
  }, {
    key: 'julkaistu',
    label: $t('julkaistut'),
    sortable: true,
    thStyle: { width: '15%' },
  }];
});

const koulutuksenjarjestajaItems = computed(() => {
  return _.chain(opetussuunnitelmatFilled.value)
    .filter(opetussuunnitelma => !!opetussuunnitelma.koulutuksenjarjestaja)
    .map(opetussuunnitelma => {
      return {
        value: opetussuunnitelma.koulutuksenjarjestaja!.oid,
        text: $kaanna(opetussuunnitelma.koulutuksenjarjestaja!.nimi),
      };
    })
    .uniqWith(_.isEqual)
    .value();
});

const tiedostoData = computed(() => {
  return _.map(opetussuunnitelmatFiltered.value, (ops: any) => {
    const csvOps = _.pick(ops, ['nimi', 'koulutustyyppi', 'tila', 'perusteenVoimassaoloAlkaa', 'perusteenVoimassaoloLoppuu', 'julkaistu', 'ensijulkaisu', 'luotu']);
    return {
      nimi: $kaanna(csvOps.nimi),
      koulutustyyppi: $t(csvOps.koulutustyyppi),
      tila: $t(csvOps.tila),
      luotu: csvAikaleima(csvOps.luotu),
      voimassaoloAlkaa: csvAikaleima(csvOps.perusteenVoimassaoloAlkaa),
      voimassaoloLoppuu: csvAikaleima(csvOps.perusteenVoimassaoloLoppuu),
      ensijulkaisu: csvAikaleima(csvOps.ensijulkaisu),
      julkaistu: csvAikaleima(csvOps.julkaistu),
    };
  });
});

function downloadTiedosto(tyyppi: string) {
  dataTiedostoksi(tyyppi, 'ylops', tiedostoData.value);
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
