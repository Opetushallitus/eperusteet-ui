<template>
  <EpMainView>
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t('osaamismerkit') }}</h1>
        <div class="d-flex">
          <router-link :to="{ name: 'osaamismerkkiKategoria' }">
            <EpButton class="m-0 p-0" variant="link" icon="edit">{{$t('kategorioiden-hallinta')}}</EpButton>
          </router-link>
          <EpButton class="m-0 p-0" variant="link" icon="add" @click="avaaOsaamismerkkiModal">{{$t('lisaa-osaamismerkki')}}</EpButton>
        </div>
      </div>
      <div class="mb-1">{{$t('osaamismerkit-kuvaus')}}</div>
    </template>

    <div class="row align-items-end">
      <div class="col-6">
        <EpFormContent name="hae">
          <EpSearch v-model="nimiFilter" />
        </EpFormContent>
      </div>
      <div class="col-3">
        <EpFormContent name="kategoria">
          <EpMultiSelect :is-editing="true"
                         :options="osaamismerkkiKategoriat"
                         v-model="kategoria"
                         :placeholder="$t('kaikki')"
                         track-by="value"
                         label="text">
          </EpMultiSelect>
        </EpFormContent>
      </div>
      <div class="col-3">
        <EpFormContent name="voimassaolo">
          <EpMultiSelect :is-editing="false"
                         :options="osaamismerkkiVoimassaolot"
                         v-model="voimassaolo"
                         :placeholder="$t('kaikki')"
                         track-by="value"
                         label="text">
            <template slot="singleLabel" slot-scope="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
            <template slot="option" slot-scope="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
          </EpMultiSelect>
        </EpFormContent>
      </div>
    </div>

    <div class="row align-items-end">
      <div class="col-4">
        <b-form-checkbox-group v-model="tila">
          <b-form-checkbox v-for="tila in osaamismerkkiTilat" :key="tila" :value="tila">
            {{ $t('tila-' + tila.toLowerCase()) }}
          </b-form-checkbox>
        </b-form-checkbox-group>
      </div>
    </div>

    <EpSpinner v-if="!osaamismerkitPage" />

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
               :items="osaamismerkitFiltered"
               :fields="tableFields"
               :per-page="perPage"
               @row-clicked="avaaOsaamismerkkiModal"/>

      <b-pagination
        v-model="page"
        :total-rows="totalRows"
        :per-page="perPage"
        aria-controls="tiedotteet"
        align="center">
      </b-pagination>
    </div>
    <EpOsaamismerkkiModal ref="osaamismerkkiModal" :store="osaamismerkitStore"/>

  </EpMainView>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { OsaamismerkitStore } from '@/stores/OsaamismerkitStore';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { OsaamismerkitQuery, PerusteQuery } from '@shared/api/eperusteet';
import { OsaamismerkkiDto } from '@shared/generated/eperusteet';
import * as _ from 'lodash';
import EpOsaamismerkkiModal from '@/components/EpOsaamismerkki/EpOsaamismerkkiModal.vue';

@Component({
  components: {
    EpMainView,
    EpSpinner,
    EpMultiSelect,
    EpSearch,
    EpFormContent,
    EpButton,
    EpOsaamismerkkiModal,
  },
})
export default class RouteOsaamismerkit extends Vue {
  @Prop({ required: true })
  private osaamismerkitStore!: OsaamismerkitStore;

  private sivu = 0;
  private perPage = 10;
  private nimiFilter = ''
  private sort = {};
  private tila: string[] | null = null;
  private voimassaolo: string | null = null;
  private kategoria: any | null = null;

  private query = {
    sivu: 0,
    sivukoko: 10,
    voimassaolo: false,
    tuleva: false,
    poistunut: false,
    tila: ['LAADINTA', 'JULKAISTU'],
    nimi: '',
    kategoria: undefined,
    jarjestysOrder: false,
    jarjestysTapa: 'nimi',
  } as OsaamismerkitQuery;

  async mounted() {
    await this.osaamismerkitStore.init(this.query);
    this.tila = ['LAADINTA', 'JULKAISTU'];
  }

  private fetch(query) {
    this.osaamismerkitStore.init(
      {
        ...this.osaamismerkitStore.options.value,
        ...query,
      }
    );
  }

  get osaamismerkitPage() {
    return this.osaamismerkitStore?.osaamismerkkiPage.value || null;
  }

  get totalRows() {
    return this.osaamismerkitPage!.kokonaismäärä;
  }

  get page() {
    return this.osaamismerkitPage!.sivu + 1;
  }

  set page(value: number) {
    this.sivu = value - 1;
  }

  get osaamismerkitFiltered() {
    return this.osaamismerkitStore.osaamismerkit.value;
  }

  get osaamismerkkiKategoriat() {
    return _.chain(this.osaamismerkitStore.kategoriat.value)
      .map(kategoria => {
        return {
          text: this.$kaanna(kategoria.nimi),
          value: kategoria.id,
        };
      })
      .uniqWith(_.isEqual)
      .filter('text')
      .value();
  }

  get osaamismerkkiTilat() {
    return ['LAADINTA', 'JULKAISTU'];
  }

  get osaamismerkkiVoimassaolot() {
    return [
      'kaikki',
      'tuleva',
      'voimassaolo',
      'poistunut',
    ];
  }

  get tableFields() {
    return [
      {
        key: 'nimi',
        label: this.$t('nimi'),
        sortable: false,
        thStyle: { width: '35%', borderBottom: '2px' },
        formatter: (value: any, key: any, item: any) => {
          return (this as any).$kaanna(value);
        },
      }, {
        key: 'kategoria',
        label: this.$t('kategoria'),
        sortable: false,
        thStyle: { width: '20%', borderBottom: '2px' },
        formatter: (value: any, key: any, item: any) => {
          return (this as any).$kaanna(value.nimi);
        },
      }, {
        key: 'tila',
        label: this.$t('tila'),
        sortable: true,
        thStyle: { width: '10%', borderBottom: '2px' },
        formatter: (value: any, key: string, item: OsaamismerkkiDto) => {
          return this.$t('tila-' + _.toLower(item!.tila));
        },
      }, {
        key: 'muokattu',
        label: this.$t('muokattu'),
        sortable: true,
        thStyle: { width: '15%', borderBottom: '2px' },
        formatter: (value: any, key: any, item: any) => {
          return (this as any).$sdt(value);
        },
      }, {
        key: 'voimassaoloAlkaa',
        label: this.$t('voimassaolo-alkaa'),
        sortable: true,
        thStyle: { width: '15%', borderBottom: '2px' },
        formatter: (value: any, key: any, item: any) => {
          return (this as any).$sd(value);
        },
      }, {
        key: 'voimassaoloLoppuu',
        label: this.$t('voimassaolo-loppuu'),
        sortable: true,
        thStyle: { width: '15%', borderBottom: '2px' },
        formatter: (value: any, key: any, item: any) => {
          return (this as any).$sd(value);
        },
      },
    ];
  }

  sortingChanged(sort) {
    this.sort = sort;
    this.fetch(
      {
        sivu: 0,
        jarjestys: sort.sortBy,
        jarjestysNouseva: !sort.sortDesc,
      }
    );
  }

  avaaOsaamismerkkiModal(osaamismerkki: OsaamismerkkiDto) {
    (this as any).$refs['osaamismerkkiModal'].avaaModal(osaamismerkki);
  }

  @Watch('query', { deep: true, immediate: true })
  async onQueryChange(query: PerusteQuery) {
  }

  @Watch('tila')
  onTilaChange(tila: string) {
    this.query = {
      ...this.query,
      tila: tila ? [tila] : ['LAADINTA', 'JULKAISTU'],
    };
  }

  @Watch('kategoria')
  onKategoriaChange(kategoria) {
    this.query.kategoria = kategoria.value;
  }
};
</script>

<style lang="scss" scoped>

</style>
