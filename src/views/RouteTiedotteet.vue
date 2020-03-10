<template>
  <ep-main-view :tutoriaaliStore="tutoriaaliStore">
    <template slot="icon">
      <ep-icon class="float-right" icon="luo-uusi">
      </ep-icon>
    </template>
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t('tiedotteet') }}</h1>

        <ep-tiedote-modal ref="eptiedotemodal" :perusteet="perusteet" :tiedotteetStore="tiedotteetStore" :koulutustyyppiTaiTutkintoItems="koulutustyyppiTaiTutkintoItems"/>

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

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpMultiListSelect from '@shared/components/forms/EpMultiListSelect.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpTiedoteModal from '@shared/components/EpTiedoteModal/EpTiedoteModal.vue';

import { themes, ktToState, perustetila } from '@shared/utils/perusteet';
import { TutoriaaliStore } from '@shared/stores/tutoriaali';
import { Perusteet, Kayttajat, PageTiedoteDto, TiedoteDto, PerusteHakuDto, PerusteKevytDto } from '@shared/api/eperusteet';
import { Kielet } from '@shared/stores/kieli';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { parsiEsitysnimi } from '@/stores/kayttaja';


interface KoulutustyyppiTaiTutkinto {
  type: string,
  object: any,
}

const julkaisupaikkaSort = {
  'opintopolku': 1,
  'ops': 2,
  'amosaa': 3,
};

@Component({
  components: {
    EpIcon,
    EpButton,
    EpContent,
    EpMainView,
    EpSearch,
    EpSpinner,
    EpFormContent,
    EpMultiSelect,
    EpInput,
    EpField,
    EpMultiListSelect,
    EpSelect,
    EpToggle,
    EpKielivalinta,
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
  private koulutustyypitTaiTutkinnot: KoulutustyyppiTaiTutkinto[] = [];
  private valitutJulkaisupaikat: [] = [];
  private editing: boolean = false;
  private perusteet: PerusteHakuDto[] = [];

  private muokattavaTiedote: TiedoteDto = {};
  private muokkaavanKayttajanNimi = '';

  private opintopolkuJulkaisu: boolean = false;
  private opintopolkuJulkaisuEtusivu: boolean = false;
  private opintopolkuJulkaisuKoulutustyyppiTutkinto: boolean = false;
  private opsJulkaisu: boolean = false;
  private amosaaJulkaisu: boolean = false;

  async mounted() {
    this.tiedotteetStore.fetch();
    const res = (await Perusteet.getAllPerusteet() as any).data;
    this.perusteet = res.data;
  }

  @Watch('opintopolkuJulkaisu')
  async onValueChanged(newVal: any) {
    if (!newVal) {
      this.opintopolkuJulkaisuEtusivu = false;
    }
  }

  get tiedotteetFiltered() {
    return _.chain(this.tiedotteetStore.tiedotteet.value)
      .filter(tiedote => !this.nimiFilter || (!_.isEmpty(tiedote.otsikko) && Kielet.search(this.nimiFilter, tiedote.otsikko)))
      .filter(tiedote => _.isEmpty(this.valitutJulkaisuPaikatValues) || _.some(this.valitutJulkaisuPaikatValues, (filter) => _.includes(tiedote.julkaisupaikat, filter)))
      .filter(tiedote => _.isEmpty(tiedote.perusteet) || !_.some(tiedote.perusteet, (peruste) => (peruste.tila as any) !== perustetila.valmis))
      .map(tiedote => {
        return {
          ...tiedote,
          filteredJulkaisupaikat: _.chain(tiedote.julkaisupaikat)
            .filter((julkaisupaikka) => (julkaisupaikka as any) !== 'opintopolku_etusivu')
            .sortBy((julkaisupaikka) => julkaisupaikkaSort[julkaisupaikka])
            .value(),
          opintopolkuEtusivu: _.includes((tiedote.julkaisupaikat as any), 'opintopolku_etusivu'),
        };
      })
      .value();
  }

  get valitutJulkaisuPaikatValues() {
    return _.map(this.valitutJulkaisupaikat, 'value');
  }

  get julkaisupaikatItems() {
    return [
      { text: this.$t('tiedote-julkaisupaikka-opintopolku'), value: 'opintopolku' },
      { text: this.$t('tiedote-julkaisupaikka-ops'), value: 'ops' },
      { text: this.$t('tiedote-julkaisupaikka-amosaa'), value: 'amosaa' },
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
      key: 'filteredJulkaisupaikat',
      label: this.$t('tiedote-julkaistu'),
      sortable: true,
      thStyle: { width: '35%' },
      sortByFormatted: true,
      formatter: (value: any, key: any, item: any) => {
        return _.join(_.map(value, (julkaisupaikka) => this.$t(julkaisupaikka)), ', ');
      },
    }];
  }

  get koulutustyyppiTaiTutkintoItems() {
    return [
      ..._.chain(_.keys(ktToState))
        .map((koulutustyyppi) => {
          return [
            {
              text: this.$t(koulutustyyppi),
              value: {
                type: 'koulutustyyppi',
                object: koulutustyyppi,
              },
            },
            ..._.chain(this.perusteet)
              .filter((peruste) => peruste.koulutustyyppi === koulutustyyppi)
              .map(peruste => {
                return {
                  text: (this as any).$kaanna(peruste.nimi),
                  value: {
                    type: 'peruste',
                    object: peruste.id,
                  },
                  child: true,
                };
              })
              .value(),
          ];
        })
        .flatten()
        .value(),
    ];
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
