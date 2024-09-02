<template>
  <div>
    <EpSpinner v-if="!toteutussuunnitelmat || !opetussuunnitelmat" />

    <template v-else>
      <ep-form-content name="aikavali">
        <div class="d-flex align-items-center">
          <ep-datepicker v-model="alkupvm" :is-editing="true" />
          <span class="mx-2">-</span>
          <ep-datepicker v-model="loppupvm" :is-editing="true" endOfDay/>
        </div>
      </ep-form-content>

      <div>{{$t('suunnitelmien-lukumaarat-selite')}}</div>

      <b-table
        borderless
        :items="lukumaarat"
        :fields="fields"
        :tbody-tr-class="rowClass">
      </b-table>
    </template>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TilastotStore } from '@/stores/TilastotStore';
import { koulutustyyppiRyhmaSort } from '@shared/utils/perusteet';
import { suunnitelmatTilastoksi, koulutustyyppiTilastoSort } from './tilastot';

@Component
export default class EpLukumaaraTilastot extends Vue {
  @Prop({ required: true })
  private tilastotStore!: TilastotStore;

  alkupvm: number | null = null;
  loppupvm: number | null = null;

  mounted() {
    this.alkupvm = new Date().setMonth(new Date().getMonth() - 4);
    this.loppupvm = new Date().getTime();
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

  get lukumaarat() {
    let lukumaarat = _.chain([
      ...this.suunnitelmaLukumaarat,
      ...this.ryhmaLukumaarat,
    ])
      .sortBy((rivi: any) => koulutustyyppiTilastoSort[rivi.koulutustyyppi] ?? 99)
      .sortBy((rivi: any) => rivi.tyyppi === 'ryhma' ? 0 : 1)
      .sortBy((rivi: any) => koulutustyyppiRyhmaSort[rivi.ryhma] ?? 99)
      .value();

    lukumaarat = [
      ...lukumaarat,
      this.kaikkiYhteensa,
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
  }

  get kaikkiYhteensa() {
    return {
      koulutustyyppi: 'kaikki-yhteensa',
      ryhma: 'kaikki-yhteensa',
      tyyppi: 'kaikki-yhteensa',
      julkaistut: _.sumBy(this.suunnitelmaLukumaarat, 'julkaistut'),
      luonnokset: _.sumBy(this.suunnitelmaLukumaarat, 'luonnokset'),
      arkistoidut: _.sumBy(this.suunnitelmaLukumaarat, 'arkistoidut'),
      yhteensa: _.sumBy(this.suunnitelmaLukumaarat, 'yhteensa'),
      uusia: _.sumBy(this.suunnitelmaLukumaarat, 'uusia'),
    };
  }

  get suunnitelmaLukumaarat() {
    return suunnitelmatTilastoksi(this.suunnitelmat, this.alkupvm!, this.loppupvm!);
  }

  get ryhmaLukumaarat() {
    return _.chain(this.suunnitelmaLukumaarat)
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
      .filter(ryhma => _.size(_.filter((this.suunnitelmaLukumaarat as any[]), suunnitelma => suunnitelma.ryhma === ryhma.ryhma)) > 1)
      .value();
  }

  get koulutustyyppiKiellelinenMuutos() {
    return {
      'koulutustyyppi_muu': 'jotpa-rahoitteisia',
    };
  }

  get fields() {
    return [
      {
        key: 'koulutustyyppi',
        label: this.$t('koulutustyyppi'),
        formatter: (value: string) => this.$t(this.koulutustyyppiKiellelinenMuutos[value] ?? value),
      },
      {
        key: 'julkaistut',
        label: this.$t('julkaistut'),
        thClass: 'text-right otsikko',
        tdClass: 'text-right',
      },
      {
        key: 'luonnokset',
        label: this.$t('luonnokset'),
        thClass: 'text-right otsikko',
        tdClass: 'text-right',
      },
      {
        key: 'arkistoidut',
        label: this.$t('arkistoidut'),
        thClass: 'text-right otsikko',
        tdClass: 'text-right',
      },
      {
        key: 'yhteensa',
        label: this.$t('yhteensa'),
        thClass: 'text-right otsikko',
        tdClass: 'text-right',
      },
      {
        key: 'uusia',
        label: this.$t('uusia-aikavalilla'),
        thClass: 'text-right uusia',
        tdClass: 'text-right uusia',
      },
    ];
  }

  rowClass(item, type) {
    if (!item || type !== 'row') return;
    let rowClass = '';
    if (item.tyyppi !== 'ryhma' && _.includes(_.map(this.ryhmaLukumaarat, 'ryhma'), item.ryhma)) rowClass += 'ryhman-alainen-rivi ';
    if (item.evenrow) rowClass += 'even-row ';

    return rowClass + item.tyyppi;
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

::v-deep .table {
  border-collapse: collapse !important;
}

::v-deep .table .ryhma, ::v-deep .table .kaikki-yhteensa {
  font-weight: bold;
}

::v-deep .table .kaikki-yhteensa td {
  border-top: 2px solid #ccc;
  border-bottom: 2px solid #ccc;
}

::v-deep .otsikko {
  width: 150px;
}

::v-deep .uusia {
  width: 200px;
  border-left: 2px solid #ccc;
}

::v-deep .ryhman-alainen-rivi td {
  padding-left: 25px;
}

::v-deep .even-row td {
  background-color: $table-odd-row-bg-color;
}

::v-deep .table {
  border-collapse: separate;
}

::v-deep .table > thead  {
  background-color: $white;
  position: sticky !important;
  top: 0px;
  z-index: 1;
}

</style>
