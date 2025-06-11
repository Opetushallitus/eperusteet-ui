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

      <h2 class="mt-5">
        <span>{{$t('toteutussuunnitelmat')}} {{toteutussuunnitelmatFiltered.length}} {{$t('kpl')}}</span>
        <EpButton class="ml-5" variant="link" @click="downloadTiedosto('csv')" noPadding>Lataa csv</EpButton>
        <EpButton variant="link" @click="downloadTiedosto('xlsx')" noPadding>Lataa xlsx</EpButton>
      </h2>

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

<script setup lang="ts">
import { ref, computed } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { EPERUSTEET_KOULUTUSTYYPPI_PAIKALLISET_SOVELLUKSET, EPERUSTEET_SOVELLUKSET } from '@shared/plugins/oikeustarkastelu';
import EpTilastoAikavaliVertailu, { AikavaliVertailu } from '@/components/tilastot/EpTilastoAikavaliVertailu.vue';
import { csvAikaleima, dataTiedostoksi } from './tilastot';
import { $t, $kaanna, $sd } from '@shared/utils/globals';
import EpButton from '@shared/components/EpButton/EpButton.vue';

interface Toteutussuunnitelma {
  id: string | number;
  nimi: Record<string, string>;
  koulutustyyppi: string;
  tila: string;
  voimaantulo: Date;
  paatospaivamaara?: Date;
  julkaistu?: Date;
  ensijulkaisu?: Date;
  luotu: Date;
  perusteId?: string | number;
  perusteNimi?: Record<string, string>;
  koulutustoimija: {
    id: string | number;
    nimi: Record<string, string>;
  };
  julkaisukielet?: string[];
  voimassaolo?: string;
  url?: string;
}

const props = defineProps<{
  toteutussuunnitelmat: Toteutussuunnitelma[];
}>();

const opsPage = ref(1);
const ktPage = ref(1);
const perPage = ref(10);
const query = ref('');
const valitutTilat = ref<Array<{value: string, text: string}>>([]);
const valitutKoulutustyypit = ref<Array<{value: string, text: string}>>([]);
const valitutVoimassaolot = ref<Array<{value: string, text: string}>>([]);
const valitutPerusteet = ref<Array<{value: string | number, text: string}>>([]);
const valitutKoulutustoimijat = ref<Array<{value: string | number, text: string}>>([]);
const aikavali = ref<AikavaliVertailu>({});

const toteutussuunnitelmatFilled = computed(() => {
  if (props.toteutussuunnitelmat) {
    return _.map(props.toteutussuunnitelmat, (toteutussuunnitelma: Toteutussuunnitelma) => {
      return {
        ...toteutussuunnitelma,
        voimassaolo: toteutussuunnitelmaVoimassaolo(toteutussuunnitelma),
        url: _.find(EPERUSTEET_SOVELLUKSET, sovellus => sovellus.sovellus === EPERUSTEET_KOULUTUSTYYPPI_PAIKALLISET_SOVELLUKSET[toteutussuunnitelma.koulutustyyppi])?.url
            + '/fi/koulutustoimija/' + toteutussuunnitelma.koulutustoimija.id + '/toteutussuunnitelma/' + toteutussuunnitelma.id,
      };
    });
  }
  return [];
});

const toteutussuunnitelmatFiltered = computed(() => {
  return _.chain(toteutussuunnitelmatFilled.value)
    .filter(toteutussuunnitelma => _.isEmpty(valitutTilat.value) || _.includes(_.map(valitutTilat.value, 'value'), toteutussuunnitelma.tila))
    .filter(toteutussuunnitelma => _.isEmpty(valitutKoulutustyypit.value) || _.includes(_.map(valitutKoulutustyypit.value, 'value'), toteutussuunnitelma.koulutustyyppi))
    .filter(toteutussuunnitelma => Kielet.search(query.value, toteutussuunnitelma.nimi))
    .filter(toteutussuunnitelma => _.isEmpty(valitutVoimassaolot.value) || _.includes(_.map(valitutVoimassaolot.value, 'value'), toteutussuunnitelma.voimassaolo))
    .filter(toteutussuunnitelma => _.isEmpty(valitutPerusteet.value) || _.includes(_.map(valitutPerusteet.value, 'value'), toteutussuunnitelma.perusteId))
    .filter(toteutussuunnitelma => _.isEmpty(valitutKoulutustoimijat.value) || _.includes(_.map(valitutKoulutustoimijat.value, 'value'), toteutussuunnitelma.koulutustoimija!.id))
    .filter(toteutussuunnitelma => aikavertailu(toteutussuunnitelma))
    .sortBy(toteutussuunnitelma => $kaanna(toteutussuunnitelma.nimi))
    .value();
});

const aikavaliValue = computed(() => {
  return _.get(aikavali.value, 'tyyppi.value');
});

const aikavaliAlkuVrt = computed(() => {
  return aikavali.value?.aikavaliAlku ? aikavali.value.aikavaliAlku : new Date(0);
});

const aikavaliLoppuVrt = computed(() => {
  return aikavali.value?.aikavaliLoppu ? aikavali.value.aikavaliLoppu : new Date(8640000000000000);
});

function aikavertailu(toteutussuunnitelma: Toteutussuunnitelma) {
  if (!aikavaliValue.value) {
    return true;
  }

  if (_.get(toteutussuunnitelma, aikavaliValue.value) === null) {
    return false;
  }

  return toteutussuunnitelma[aikavaliValue.value] >= aikavaliAlkuVrt.value &&
         toteutussuunnitelma[aikavaliValue.value] <= aikavaliLoppuVrt.value;
}

function toteutussuunnitelmaVoimassaolo(toteutussuunnitelma: Toteutussuunnitelma) {
  if (toteutussuunnitelma.paatospaivamaara && toteutussuunnitelma.paatospaivamaara < new Date()) {
    return 'paattyneet';
  }

  if (toteutussuunnitelma.voimaantulo > new Date()) {
    return 'tulevat';
  }

  return 'voimassaolevat';
}

const koulutustoimijatFiltered = computed(() => {
  const toteutussuunnitelmatByKoulutustoimijaId = _.groupBy(toteutussuunnitelmatFiltered.value, 'koulutustoimija.id');

  return _.chain(toteutussuunnitelmatFiltered.value)
    .map('koulutustoimija')
    .uniqWith(_.isEqual)
    .map(koulutustoimija => {
      return {
        koulutustoimija: koulutustoimija,
        luonnos: _.size(_.groupBy(toteutussuunnitelmatByKoulutustoimijaId[koulutustoimija!.id!], 'tila')['luonnos']),
        valmis: _.size(_.groupBy(toteutussuunnitelmatByKoulutustoimijaId[koulutustoimija!.id!], 'tila')['valmis']),
        julkaistu: _.size(_.groupBy(toteutussuunnitelmatByKoulutustoimijaId[koulutustoimija!.id!], 'tila')['julkaistu']),
      };
    })
    .value();
});

const koulutustyyppiItems = computed(() => {
  return _.chain(toteutussuunnitelmatFilled.value)
    .map(toteutussuunnitelma => {
      return {
        text: toteutussuunnitelma.koulutustyyppi ? $t(toteutussuunnitelma.koulutustyyppi as string) : $t('null'),
        value: toteutussuunnitelma.koulutustyyppi,
      };
    })
    .uniqWith(_.isEqual)
    .filter('text')
    .value();
});

const tilaItems = computed(() => {
  return _.chain(toteutussuunnitelmatFilled.value)
    .map(toteutussuunnitelma => {
      return {
        text: $t(toteutussuunnitelma.tila as string),
        value: toteutussuunnitelma.tila,
      };
    })
    .uniqWith(_.isEqual)
    .filter('text')
    .value();
});

const voimassaoloItems = computed(() => {
  return _.chain(toteutussuunnitelmatFilled.value)
    .map(toteutussuunnitelma => {
      return {
        text: $t(toteutussuunnitelma.voimassaolo as string),
        value: toteutussuunnitelma.voimassaolo,
      };
    })
    .uniqWith(_.isEqual)
    .value();
});

const koulutustoimijaItems = computed(() => {
  return _.chain(toteutussuunnitelmatFilled.value)
    .map(toteutussuunnitelma => {
      return {
        value: toteutussuunnitelma.koulutustoimija!.id,
        text: $kaanna(toteutussuunnitelma.koulutustoimija!.nimi),
      };
    })
    .uniqWith(_.isEqual)
    .value();
});

const perusteItems = computed(() => {
  return _.chain(toteutussuunnitelmatFilled.value)
    .filter('perusteNimi')
    .map(toteutussuunnitelma => {
      return {
        value: toteutussuunnitelma.perusteId,
        text: $kaanna(toteutussuunnitelma.perusteNimi),
      };
    })
    .uniqBy('value')
    .value();
});

const statistiikka = computed(() => {
  return {
    koulutustyypeittain: _.groupBy(toteutussuunnitelmatFiltered.value, 'koulutustyyppi'),
    tiloittain: _.groupBy(toteutussuunnitelmatFiltered.value, 'tila'),
    kielittain: _.omitBy({
      fi: _.filter(toteutussuunnitelmatFiltered.value, (ops) => _.includes(ops.julkaisukielet as any, 'fi')),
      sv: _.filter(toteutussuunnitelmatFiltered.value, (ops) => _.includes(ops.julkaisukielet as any, 'sv')),
      en: _.filter(toteutussuunnitelmatFiltered.value, (ops) => _.includes(ops.julkaisukielet as any, 'en')),
      se: _.filter(toteutussuunnitelmatFiltered.value, (ops) => _.includes(ops.julkaisukielet as any, 'se')),
    }, _.isEmpty),
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

function chartOptions(otsikko: string) {
  return {
    labels: _.map(_.keys(statistiikka.value![otsikko]), (alaotsikko) => $t(alaotsikko)),
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

const tyhjaGraafiOptions = computed(() => {
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
});

const tyhjaGraafiData = computed(() => {
  return [1];
});

const toteutussuunnitelmaFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('toteutussuunnitelman-nimi'),
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
    sortByFormatted: true,
    formatter: (value: any, key: string, item: any) => {
      return $t(value);
    },
  }, {
    key: 'tila',
    label: $t('tila'),
    sortable: true,
    thStyle: { width: '10%' },
    sortByFormatted: true,
    formatter: (value: any, key: string, item: any) => {
      return $t(value);
    },
  }, {
    key: 'voimaantulo',
    label: $t('voimassaolo-alkaa'),
    sortable: true,
    thStyle: { width: '130px', paddingTop: '0px' },
    formatter: (value: any, key: string, item: any) => {
      return value ? $sd(value) : '';
    },
  }, {
    key: 'paatospaivamaara',
    label: $t('paatospaivamaara-lyhyt'),
    sortable: true,
    thStyle: { width: '130px', paddingTop: '0px' },
    formatter: (value: any, key: string, item: any) => {
      return value ? $sd(value) : '';
    },
  }, {
    key: 'julkaistu',
    label: $t('julkaistu'),
    sortable: true,
    thStyle: { width: '130px', paddingTop: '0px' },
    formatter: (value: any, key: string, item: any) => {
      return value ? $sd(value) : '';
    },
  }, {
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

const koulutustoimijaFields = computed(() => {
  return [{
    key: 'koulutustoimija',
    label: $t('koulutustoimija'),
    sortable: true,
    sortByFormatted: true,
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(value.nimi);
    },
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

const tiedostoData = computed(() => {
  return _.map(toteutussuunnitelmatFiltered.value, (ops: any) => {
    const csvOps = _.pick(ops, ['nimi', 'koulutustyyppi', 'tila', 'voimaantulo', 'paatospaivamaara', 'julkaistu', 'ensijulkaisu', 'luotu']);
    return {
      nimi: $kaanna(csvOps.nimi),
      koulutustyyppi: $t(csvOps.koulutustyyppi),
      tila: $t(csvOps.tila),
      luotu: csvAikaleima(csvOps.luotu),
      voimassaoloAlkaa: csvAikaleima(csvOps.voimaantulo),
      paatospaivamaara: csvAikaleima(csvOps.paatospaivamaara),
      ensijulkaisu: csvAikaleima(csvOps.ensijulkaisu),
      julkaistu: csvAikaleima(csvOps.julkaistu),
    };
  });
});

function downloadTiedosto(tyyppi: string) {
  dataTiedostoksi(tyyppi, 'amosaa', tiedostoData.value);
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
