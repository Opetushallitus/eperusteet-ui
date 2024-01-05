<template>
  <ep-main-view :tutoriaaliStore="tutoriaaliStore">
    <template slot="icon">
      <ep-icon class="float-right" icon="add">
      </ep-icon>
    </template>
    <template slot="header">
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

<script lang="ts">
import { Prop, Vue, Component, Mixins, Watch } from 'vue-property-decorator';
import _ from 'lodash';

import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpTiedoteModal from '@shared/components/EpTiedoteModal/EpTiedoteModal.vue';
import { TutoriaaliStore } from '@shared/stores/tutoriaali';
import { Perusteet, TiedoteDto } from '@shared/api/eperusteet';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { julkaisupaikka, julkaisupaikkaSort } from '@shared/utils/tiedote';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { PerusteKevytDto } from '@shared/generated/eperusteet';

@Component({
  components: {
    EpIcon,
    EpMainView,
    EpSearch,
    EpFormContent,
    EpMultiSelect,
    EpTiedoteModal,
    EpSpinner,
  },
} as any)
export default class RouteTiedotteet extends Vue {
  @Prop({ required: true })
  private tiedotteetStore!: TiedotteetStore;

  @Prop({ required: true })
  private tutoriaaliStore!: TutoriaaliStore;

  private sivu = 0;
  private perPage = 10;
  private nimiFilter = '';
  private sort = {};
  private valitutJulkaisupaikat: [] = [];
  private perusteet: PerusteKevytDto[] | null = null;

  async mounted() {
    this.tiedotteetStore.init(
      {
        sivu: this.sivu,
        sivukoko: 10,
      },
    );
    this.perusteet = (await Perusteet.getJulkaistutPerusteet()).data;
  }

  @Watch('nimiFilter')
  nimiChange() {
    this.fetch(
      {
        sivu: 0,
        nimi: this.nimiFilter,
      },
    );
  }

  @Watch('valitutJulkaisupaikat')
  valitutJulkaispaikatChange() {
    this.fetch(
      {
        sivu: 0,
        tiedoteJulkaisuPaikka: _.map(this.valitutJulkaisupaikat, 'value'),
      },
    );
  }

  @Watch('sivu')
  sivuChange() {
    this.fetch(
      {
        sivu: this.sivu,
      },
    );
  }

  sortingChanged(sort) {
    this.sort = sort;
    this.fetch(
      {
        sivu: 0,
        jarjestys: sort.sortBy,
        jarjestysNouseva: !sort.sortDesc,
      },
    );
  }

  private fetch(query) {
    this.tiedotteetStore.init(
      {
        ...this.tiedotteetStore.options.value,
        ...query,
      },
    );
  }

  get tiedotteetPage() {
    return this.tiedotteetStore?.tiedotteetPage.value || null;
  }

  get totalRows() {
    return this.tiedotteetPage!.kokonaismäärä;
  }

  get page() {
    return this.tiedotteetPage!.sivu + 1;
  }

  set page(value: number) {
    this.sivu = value - 1;
  }

  get tiedotteetFiltered() {
    return _.map(this.tiedotteetStore.tiedotteet.value, tiedote => {
      return {
        ...tiedote,
        julkaisupaikat: _.chain(tiedote.julkaisupaikat)
          .sortBy((julkaisupaikka) => julkaisupaikkaSort[julkaisupaikka])
          .value(),
      };
    });
  }

  get valitutJulkaisuPaikatValues() {
    return _.map(this.valitutJulkaisupaikat, 'value');
  }

  get julkaisupaikatItems() {
    return [
      { text: this.$t('tiedote-julkaisupaikka-opintopolku'), value: julkaisupaikka.opintopolku_etusivu },
      { text: this.$t('tiedote-julkaisupaikka-ops'), value: julkaisupaikka.ops },
      { text: this.$t('tiedote-julkaisupaikka-lops'), value: julkaisupaikka.lops },
      { text: this.$t('tiedote-julkaisupaikka-amosaa'), value: julkaisupaikka.amosaa },
      { text: this.$t('tiedote-julkaisupaikka-vst'), value: julkaisupaikka.vst },
    ];
  }

  get tableFields() {
    return [{
      key: 'luotu',
      label: this.$t('julkaistu'),
      sortable: true,
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$sdt(value);
      },
    }, {
      key: 'muokattu',
      label: this.$t('muokattu'),
      sortable: true,
      formatter: (value: any, key: any, item: any) => {
        if (item.luotu !== item.muokattu) {
          return (this as any).$sdt(value);
        }

        return '';
      },
    }, {
      key: 'otsikko',
      label: this.$t('tiedotteen-otsikko'),
      sortable: false,
      thStyle: { width: '35%', borderBottom: '0px' },
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$kaanna(value);
      },
    }, {
      key: 'julkaisupaikat',
      label: this.$t('tiedote-julkaistu'),
      sortable: false,
      thStyle: { width: '35%', borderBottom: '0px' },
      formatter: (value: any, key: any, item: any) => {
        return _.join(
          [
            ..._.chain(value)
              .sortBy(julkaisupaikka => julkaisupaikkaSort[julkaisupaikka])
              .map((julkaisupaikka) => this.$t('tiedote-julkaisupaikka-' + julkaisupaikka))
              .value(),
            ..._.map(item.koulutustyypit, kt => this.$t(kt)),
          ],
          ', ',
        );
      },
    }];
  }

  avaaTiedote(tiedote: TiedoteDto) {
    (this as any).$refs['eptiedotemodal'].muokkaa(tiedote);
  }
}
</script>

<style scoped lang="scss">

  .tiedote-muokkaustieto {
    font-size: 0.8rem;
  }

</style>
