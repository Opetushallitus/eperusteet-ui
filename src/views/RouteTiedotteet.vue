<template>
  <ep-main-view :tutoriaaliStore="tutoriaaliStore">
    <template slot="icon">
      <ep-icon class="float-right" icon="luo-uusi">
      </ep-icon>
    </template>
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t('tiedotteet') }}</h1>
        <ep-tiedote-modal ref="eptiedotemodal" :perusteet="julkaistutPerusteet" :tiedotteetStore="tiedotteetStore"/>
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

    <b-table responsive
      borderless
      striped
      fixed
      hover
      :items="tiedotteetFiltered"
      :fields="tableFields"
      :per-page="perPage"
      :current-page="currentPage"
      @row-clicked="avaaTiedote"/>

    <b-pagination
      v-model="currentPage"
      :total-rows="tiedotteetFiltered.length"
      :per-page="perPage"
      aria-controls="tiedotteet"
      align="center">
    </b-pagination>

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

import { perustetila, perusteprojektitila } from '@shared/utils/perusteet';
import { TutoriaaliStore } from '@shared/stores/tutoriaali';
import { TiedoteDto, Perusteet, PerusteHakuDto, PerusteHakuInternalDto } from '@shared/api/eperusteet';
import { Kielet } from '@shared/stores/kieli';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { parsiEsitysnimi } from '@/stores/kayttaja';
import { julkaisupaikka, julkaisupaikkaSort } from '@shared/utils/tiedote';

@Component({
  components: {
    EpIcon,
    EpMainView,
    EpSearch,
    EpFormContent,
    EpMultiSelect,
    EpTiedoteModal,
  },
} as any)
export default class RouteTiedotteet extends Vue {
  @Prop({ required: true })
  private tiedotteetStore!: TiedotteetStore;

  @Prop({ required: true })
  private tutoriaaliStore!: TutoriaaliStore;

  private currentPage = 1;
  private perPage = 10;
  private totalRows = 0;
  private nimiFilter = ''
  private valitutJulkaisupaikat: [] = [];
  private perusteet: PerusteHakuInternalDto[] = [];

  async mounted() {
    this.tiedotteetStore.fetch();
    const res = (await Perusteet.getAllPerusteetInternal(0, 9999) as any).data;
    this.perusteet = res.data;
  }

  get julkaistutPerusteet() {
    return _.chain(this.perusteet)
      .filter(peruste => peruste.perusteprojekti?.tila === perusteprojektitila.julkaistu)
      .filter(peruste => peruste.tila === perustetila.valmis)
      .filter(peruste => (!peruste.voimassaoloAlkaa || new Date(peruste.voimassaoloAlkaa) < new Date()))
      .filter(peruste => (!peruste.voimassaoloLoppuu || new Date(peruste.voimassaoloLoppuu) > new Date()))
      .value();
  }

  get tiedotteetFiltered() {
    return _.chain(this.tiedotteetStore.tiedotteet.value)
      .filter(tiedote => !this.nimiFilter || (!_.isEmpty(tiedote.otsikko) && Kielet.search(this.nimiFilter, tiedote.otsikko)))
      .filter(tiedote => _.isEmpty(this.valitutJulkaisuPaikatValues) || _.some(this.valitutJulkaisuPaikatValues, (filter) => _.includes(tiedote.julkaisupaikat, filter)))
      .filter(tiedote => _.isEmpty(tiedote.perusteet) || !_.some(tiedote.perusteet, (peruste) => (peruste.tila as any) !== perustetila.valmis))
      .map(tiedote => {
        return {
          ...tiedote,
          julkaisupaikat: _.chain(tiedote.julkaisupaikat)
            .sortBy((julkaisupaikka) => julkaisupaikkaSort[julkaisupaikka])
            .value(),
        };
      })
      .value();
  }

  get valitutJulkaisuPaikatValues() {
    return _.map(this.valitutJulkaisupaikat, 'value');
  }

  get julkaisupaikatItems() {
    return [
      { text: this.$t('tiedote-julkaisupaikka-opintopolku'), value: julkaisupaikka.opintopolku_etusivu },
      { text: this.$t('tiedote-julkaisupaikka-ops'), value: julkaisupaikka.lops },
      { text: this.$t('tiedote-julkaisupaikka-lops'), value: julkaisupaikka.lops },
      { text: this.$t('tiedote-julkaisupaikka-amosaa'), value: julkaisupaikka.amosaa },
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
      sortable: true,
      sortByFormatted: true,
      thStyle: { width: '35%' },
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$kaanna(value);
      },
    }, {
      key: 'julkaisupaikat',
      label: this.$t('tiedote-julkaistu'),
      sortable: true,
      thStyle: { width: '35%' },
      sortByFormatted: true,
      formatter: (value: any, key: any, item: any) => {
        return _.chain(value)
          .sortBy(julkaisupaikka => julkaisupaikkaSort[julkaisupaikka])
          .map((julkaisupaikka) => this.$t('tiedote-julkaisupaikka-' + julkaisupaikka))
          .join(', ')
          .value();
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
