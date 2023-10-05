<template>
  <router-view v-if="maaraysId"/>

  <ep-main-view container v-else>
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t('maarayskokoelma-otsikko') }}</h1>
        <router-link :to="{ name: 'maaraysMuokkaus', params: { maaraysId: 'uusi' } }">
          <EpButton
            icon="add"
            variant="outline"
            v-oikeustarkastelu="{oikeus:'muokkaus', kohde: 'eperusteet_maarays'}"
            >{{ $t('lisaa-maarays') }}</EpButton>
        </router-link>
      </div>
    </template>

    <div>
      <div class="mb-3">{{$t('maarayskokoelma-selite')}}</div>

      <div class="row ml-0 mb-2 mt-4">

        <b-form-group :label="$t('hae')" class="col-4">
          <ep-search v-model="query.nimi" :placeholder="$t('etsi-maarayksia')"/>
        </b-form-group>

        <b-form-group :label="$t('tyyppi')" class="col-4">
          <EpMultiSelect v-model="query.tyyppi"
                  :enable-empty-option="true"
                  placeholder="kaikki"
                  :is-editing="true"
                  :options="tyyppiVaihtoehdot">
            <template slot="singleLabel" slot-scope="{ option }">
              {{ $t('maarays-tyyppi-' + option.toLowerCase()) }}
            </template>
            <template slot="option" slot-scope="{ option }">
              {{ $t('maarays-tyyppi-' + option.toLowerCase()) }}
            </template>
          </EpMultiSelect>
        </b-form-group>

        <b-form-group :label="$t('koulutus-tai-tutkinto')" class="col-2">
          <koulutustyyppi-select v-model="query.koulutustyyppi"
                                :koulutustyypit="koulutustyyppiVaihtoehdot"
                                :isEditing="true"></koulutustyyppi-select>
        </b-form-group>

        <b-form-group :label="$t('voimassaolo')" class="col-2">
          <EpMultiSelect v-model="query.voimassaolo"
                    :enable-empty-option="true"
                    placeholder="kaikki"
                    :is-editing="true"
                    :options="voimassaVaihtoehdot">
            <template slot="singleLabel" slot-scope="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
            <template slot="option" slot-scope="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
          </EpMultiSelect>
        </b-form-group>
      </div>

      <div class="d-flex mb-4">
        <EpToggle v-model="query.luonnos" checkbox>{{ $t('luonnos') }}</EpToggle>
        <EpToggle v-model="query.julkaistu" checkbox>{{ $t('julkaistu') }}</EpToggle>
      </div>

      <ep-spinner v-if="!maaraykset" />

      <div v-else-if="maaraykset.length === 0">
      {{$t('ei-maarayksia')}}
      </div>

      <b-table
        v-else
        class="mt-3"
        responsive
        borderless
        striped
        fixed
        hover
        :items="maaraykset"
        :fields="tableFields"
        :per-page="perPage"
        no-local-sorting
        @sort-changed="sortingChanged"
        :sort-by.sync="sort.sortBy"
        :sort-desc.sync="sort.sortDesc">

      <template v-slot:cell(nimi)="{ item }">
        <router-link :to="{ name: 'maaraysMuokkaus', params: { maaraysId: item.id } }">
          {{$kaanna(item.nimi)}}
        </router-link>
      </template>

      </b-table>

      <ep-pagination
        v-model="sivu"
        :per-page="perPage"
        :total-rows="maarayksetCount"/>
    </div>
  </ep-main-view>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Prop, Component, Vue, ProvideReactive, Watch } from 'vue-property-decorator';
import { MaarayksetStore } from '@shared/stores/MaarayksetStore';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { MaaraysDtoTyyppiEnum } from '@shared/api/eperusteet';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components//EpMaterialIcon/EpMaterialIcon.vue';
import { Murupolku } from '@shared/stores/murupolku';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { EperusteetKoulutustyypit } from '@shared/utils/perusteet';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';
import { Debounced } from '@shared/utils/delay';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { Kielet } from '@shared/stores/kieli';

interface MaaraysQuery {
  nimi: string,
  sivukoko: number,
  voimassaolo: 'KAIKKI' | 'TULEVA' | 'VOIMASSAOLO' | 'POISTUNUT' | null,
  jarjestysTapa?: string;
  jarjestys: string;
}

@Component({
  components: {
    EpIcon,
    EpMainView,
    EpSearch,
    EpSpinner,
    EpButton,
    EpMaterialIcon,
    EpMultiSelect,
    KoulutustyyppiSelect,
    EpPagination,
    EpToggle,
  },
})
export default class RouteMaaraysKokoelma extends Vue {
  @Prop({ required: true })
  private maarayksetStore!: MaarayksetStore;

  private perPage = 10;
  private sivu = 1;
  private sort = {};
  private query: MaaraysQuery = {
    nimi: '',
    sivukoko: 10,
    voimassaolo: null,
    jarjestysTapa: 'nimi',
    jarjestys: 'ASC',
  }

  async mounted() {
    Murupolku.aseta('maarayskokoelma', this.$t('route-maaraykset'), {
      name: 'maarayskokoelma',
    });
  }

  @Watch('maaraysId', { immediate: true })
  async maaraysChange() {
    if (!this.maaraysId) {
      await this.fetch();
    }
  }

  get maaraykset() {
    return this.maarayksetStore.maaraykset.value?.data;
  }

  get maarayksetCount() {
    return this.maarayksetStore.maaraykset.value?.kokonaismäärä;
  }

  get tyyppiVaihtoehdot() {
    return [
      MaaraysDtoTyyppiEnum.OPETUSHALLITUKSENMUU,
      MaaraysDtoTyyppiEnum.AMMATILLINENMUU,
      MaaraysDtoTyyppiEnum.PERUSTE,
    ];
  }

  get koulutustyyppiVaihtoehdot() {
    return EperusteetKoulutustyypit;
  }

  get voimassaVaihtoehdot() {
    return [
      'KAIKKI',
      'TULEVA',
      'VOIMASSAOLO',
      'POISTUNUT',
    ];
  }

  @Watch('sivu',)
  async sivuChange() {
    await this.fetch();
  }

  @Watch('query', { deep: true })
  async queryChange() {
    this.sivu = 1;
    await this.fetch();
  }

  @Debounced(300)
  async fetch() {
    await this.maarayksetStore.fetch(
      {
        ...this.query as any,
        kieli: Kielet.getSisaltoKieli.value,
        sivu: this.sivu - 1,
        tuleva: this.query.voimassaolo === 'TULEVA',
        voimassaolo: this.query.voimassaolo === 'VOIMASSAOLO',
        poistunut: this.query.voimassaolo === 'POISTUNUT',
      });
  }

  get tableFields() {
    return [{
      key: 'nimi',
      label: this.$t('maarayksen-nimi'),
      sortable: true,
      sortByFormatted: true,
      thStyle: { width: '35%' },
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$kaanna(value);
      },
    }, {
      key: 'tila',
      label: this.$t('tila'),
      sortable: false,
      thClass: 'border-0',
      formatter: (value: any, key: any, item: any) => {
        return this.$t(value.toLowerCase());
      },
    }, {
      key: 'muokattu',
      label: this.$t('muokattu'),
      sortable: false,
      thClass: 'border-0',
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$sd(value);
      },
    }, {
      key: 'voimassaoloAlkaa',
      label: this.$t('voimassaolo-alkaa'),
      sortable: false,
      thClass: 'border-0',
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$sd(value);
      },
    }, {
      key: 'voimassaoloLoppuu',
      label: this.$t('voimassaolo-loppuu'),
      sortable: false,
      thClass: 'border-0',
      formatter: (value: any, key: any, item: any) => {
        if (value) {
          return (this as any).$sd(value);
        }

        return null;
      },
    },
    ];
  }

  sortingChanged(sort) {
    this.sort = sort;
    this.sivu = 1;
    this.query = {
      ...this.query,
      jarjestys: sort.sortDesc ? 'DESC' : 'ASC',
      jarjestysTapa: sort.sortBy,
    };
  }

  get maaraysId() {
    return this.$route.params.maaraysId;
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
