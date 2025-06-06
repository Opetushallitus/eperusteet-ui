<template>
  <div v-if="$route.name === 'osaamismerkit'">
    <EpMainView>
      <template #header>
        <div class="d-flex justify-content-between">
          <h1>{{ $t('osaamismerkit') }}</h1>
          <div class="d-flex">
            <router-link :to="{ name: 'osaamismerkkikategoriat' }">
              <EpButton class="m-0 p-0"
                        variant="link"
                        icon="edit">
                {{$t('teemojen-hallinta')}}
              </EpButton>
            </router-link>
            <EpButton class="m-0 p-0"
                      variant="outlined"
                      icon="add"
                      @click="avaaOsaamismerkkiModal">
              {{$t('lisaa-osaamismerkki')}}
            </EpButton>
          </div>
        </div>
        <div class="mb-1">{{$t('osaamismerkit-kuvaus')}}</div>
      </template>

      <div class="row align-items-end">
        <div class="col-6">
          <EpFormContent name="hae">
            <EpSearch v-model="query.nimi" />
          </EpFormContent>
        </div>
        <div class="col-3">
          <EpFormContent name="teema">
            <EpMultiSelect v-model="kategoria"
                           :is-editing="true"
                           :options="osaamismerkkiKategoriaOptions"
                           :placeholder="$t('kaikki')"
                           track-by="value"
                           label="text">
            </EpMultiSelect>
          </EpFormContent>
        </div>
        <div class="col-3">
          <EpFormContent name="voimassaolo">
            <EpMultiSelect v-model="voimassaolo"
                           :is-editing="false"
                           :options="osaamismerkkiVoimassaolot"
                           :placeholder="$t('kaikki')">
              <template #singleLabel="{ option }">
                {{ $t('ajoitus-' + option.toLowerCase()) }}
              </template>
              <template #option="{ option }">
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
      <div v-else-if="totalRows > 0">
        <b-table responsive
                 borderless
                 striped
                 fixed
                 hover
                 no-local-sorting
                 :items="osaamismerkitFiltered"
                 :fields="tableFields"
                 :per-page="perPage"
                 @row-clicked="avaaOsaamismerkkiModal"/>

        <b-pagination v-model="page"
                      :total-rows="totalRows"
                      :per-page="perPage"
                      aria-controls="tiedotteet"
                      align="center">
        </b-pagination>
      </div>
      <div v-else class="m-2 alert alert-info">
        {{ $t('ei-hakutuloksia') }}
      </div>

      <EpOsaamismerkkiModal ref="osaamismerkkiModal" :store="osaamismerkitStore"/>
    </EpMainView>
  </div>
  <router-view v-else/>
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
import { OsaamismerkitQuery } from '@shared/api/eperusteet';
import { OsaamismerkkiDto } from '@shared/generated/eperusteet';
import EpOsaamismerkkiModal from '@/components/EpOsaamismerkki/EpOsaamismerkkiModal.vue';
import * as _ from 'lodash';
import { Murupolku } from '@shared/stores/murupolku';
import { Kielet } from '@shared/stores/kieli';

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
  private tila: string[] | null = ['LAADINTA', 'JULKAISTU'];
  private voimassaolo: string | null = null;
  private kategoria: any | null = null;
  private isLoading = false;

  private query = {
    sivu: 0,
    sivukoko: 10,
    nimi: '',
    tila: ['LAADINTA', 'JULKAISTU'],
    kategoria: undefined,
    voimassa: false,
    tuleva: false,
    poistunut: false,
    kieli: this.kieli,
  } as OsaamismerkitQuery;

  async mounted() {
    Murupolku.aseta('osaamismerkit', this.$t('route-osaamismerkit'), {
      name: 'osaamismerkit',
    });
    await this.osaamismerkitStore.init(this.query);
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

  get osaamismerkkiKategoriaOptions() {
    return [
      {
        text: this.$t('kaikki'),
        value: null,
      },
      ...this.osaamismerkkiKategoriat,
    ];
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
        label: this.$t('osaamismerkki-nimi'),
        sortable: false,
        thStyle: { width: '25%', borderBottom: '2px' },
        formatter: (value: any, key: any, item: any) => {
          return (this as any).$kaanna(value);
        },
      }, {
        key: 'kategoria',
        label: this.$t('teema'),
        sortable: false,
        thStyle: { width: '20%', borderBottom: '2px' },
        formatter: (value: any, key: any, item: any) => {
          return (this as any).$kaanna(value.nimi);
        },
      }, {
        key: 'tila',
        label: this.$t('tila'),
        sortable: false,
        thStyle: { width: '10%', borderBottom: '2px' },
        formatter: (value: any, key: string, item: OsaamismerkkiDto) => {
          return this.$t('tila-' + _.toLower(item!.tila));
        },
      }, {
        key: 'muokattu',
        label: this.$t('muokattu'),
        sortable: false,
        thStyle: { width: '15%', borderBottom: '2px' },
        formatter: (value: any, key: any, item: any) => {
          return value ? (this as any).$sdt(value) : null;
        },
      }, {
        key: 'voimassaoloAlkaa',
        label: this.$t('voimassaolo-alkaa'),
        sortable: false,
        thStyle: { width: '15%', borderBottom: '2px' },
        formatter: (value: any, key: any, item: any) => {
          return value ? (this as any).$sd(value) : null;
        },
      }, {
        key: 'voimassaoloLoppuu',
        label: this.$t('voimassaolo-loppuu'),
        sortable: false,
        thStyle: { width: '15%', borderBottom: '2px' },
        formatter: (value: any, key: any, item: any) => {
          return value ? (this as any).$sd(value) : null;
        },
      },
    ];
  }

  avaaOsaamismerkkiModal(osaamismerkki: OsaamismerkkiDto) {
    (this as any).$refs['osaamismerkkiModal'].avaaModal(osaamismerkki);
  }

  @Watch('kieli')
  private kieliChanged() {
    this.query.kieli = this.kieli;
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  @Watch('query', { deep: true, immediate: true })
  async onQueryChange(query: OsaamismerkitQuery) {
    this.isLoading = true;
    try {
      await this.osaamismerkitStore.updateOsaamismerkkiQuery({
        ...query,
      });
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
    finally {
      this.isLoading = false;
    }
  }

  @Watch('sivu')
  async onPageChange() {
    this.query.sivu = this.sivu;
  }

  @Watch('tila')
  onTilaChange(tila) {
    this.query.tila = tila || ['LAADINTA', 'JULKAISTU'];
  }

  @Watch('kategoria')
  onKategoriaChange(kategoria) {
    this.query.kategoria = kategoria ? kategoria.value : null;
  }

  @Watch('voimassaolo')
  onVoimassaoloChange(tila) {
    const defaults = {
      voimassa: false,
      tuleva: false,
      poistunut: false,
    };

    switch (tila) {
    case 'tuleva':
      this.query = { ...this.query, ...defaults, tuleva: true };
      break;
    case 'voimassaolo':
      this.query = { ...this.query, ...defaults, voimassa: true };
      break;
    case 'poistunut':
      this.query = { ...this.query, ...defaults, poistunut: true };
      break;
    default:
      this.query = {
        ...this.query,
        ...defaults,
      };
      break;
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
