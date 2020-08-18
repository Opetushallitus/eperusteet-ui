<template>
  <div>
    <div v-if="showCards">
      <div class="upper">
        <slot name="upperheader">
          <h1 class="bg-danger">slot: upperheader</h1>
        </slot>
      </div>

      <div class="d-flex flex-wrap" v-if="items">
        <div class="card-wrapper">
          <ProjektiCard :full-background="true" :link="newRoute">
            <div class="d-flex align-items-center flex-column h-100">
              <div class="h-50 text-center d-flex align-items-center pt-4">
                <div class="ikoni">
                  <fas icon="plus" />
                </div>
              </div>
              <div class="h-50 text-center d-flex align-items-center pb-5">
                <div class="teksti">
                  {{ $t('luo-uusi') }}
                </div>
              </div>
            </div>
          </ProjektiCard>
        </div>
        <div class="card-wrapper" v-for="project in ownProjects" :key="project.id">
          <ProjektiCard :link="{ name: editRoute, params: { projektiId: project.id } }"
                        :indicator="project.koulutustyyppi">
            <template slot="lower" class="small-text">
              {{ $t('tila-' + project.tila) }}
            </template>
            <div class="h-100 w-100 d-flex align-items-center justify-content-center text-center p-4">
              {{ project.nimi }}
            </div>
          </ProjektiCard>
        </div>
      </div>
      <EpSpinner v-else />
    </div>

    <div class="lower" :class="{'mt-0': !showCards}">
      <slot name="lowerheader">
        <h1 class="bg-danger">slot: lowerheader</h1>
      </slot>
    </div>

    <div class="filters" v-if="items">
      <div class="d-lg-flex align-items-end">
        <div class="mt-2 mb-2 mr-2 flex-fill">
          <EpSearch v-model="query.nimi" :placeholder="$t('etsi-perusteprojektia')"/>
        </div>
        <div class="m-2 flex-fill" v-if="filtersInclude('koulutustyyppi')">
          <label>{{ $t('koulutustyyppi') }}</label>
          <EpMultiSelect v-model="koulutustyyppi"
                    :enable-empty-option="true"
                    placeholder="kaikki"
                    :is-editing="true"
                    :options="vaihtoehdotKoulutustyypit">
            <template slot="singleLabel" slot-scope="{ option }">
              {{ $t(option) }}
            </template>
            <template slot="option" slot-scope="{ option }">
              {{ $t(option) }}
            </template>
          </EpMultiSelect>
        </div>
        <div class="m-2 flex-fill" v-if="filtersInclude('peruste')">
          <label>{{ $t('peruste') }}</label>
          <EpMultiSelect v-model="peruste"
                    :enable-empty-option="true"
                    placeholder="kaikki"
                    :is-editing="true"
                    :options="perusteet">
            <template slot="singleLabel" slot-scope="{ option }">
              {{ $kaanna(option.nimi) }}
            </template>
            <template slot="option" slot-scope="{ option }">
              {{ $kaanna(option.nimi) }}
            </template>
          </EpMultiSelect>
        </div>
        <div class="m-2 flex-fill" v-if="filtersInclude('voimassaolo')">
          <label>{{ $t('voimassaolo') }}</label>
          <EpMultiSelect v-model="voimassaolo"
                    :enable-empty-option="true"
                    placeholder="kaikki"
                    :is-editing="true"
                    :options="vaihtoehdotVoimassaolo">
            <template slot="singleLabel" slot-scope="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
            <template slot="option" slot-scope="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
          </EpMultiSelect>
        </div>
        <div class="mb-3">
          <EpSpinner v-if="isLoading" />
        </div>
      </div>

      <div class="d-lg-flex align-items-end">
        <div class="m-2" v-if="filtersInclude('tila')">
          <b-form-checkbox-group v-model="tila">
            <b-form-checkbox v-for="tila in vaihtoehdotTilat" :key="tila" :value="tila">
              {{ $t('tila-' + tila.toLowerCase()) }}
            </b-form-checkbox>
          </b-form-checkbox-group>
        </div>
      </div>

      <div v-if="items.data.length > 0">
        <b-table striped hover responsive :items="items.data" :fields="fields">
          <template v-slot:head(nimi)>
            <slot name="nimiotsikko"></slot>
          </template>
          <template v-slot:cell(nimi)="data">
            <router-link :to="{ name: editRoute, params: { projektiId: data.item.id } }">
              {{ data.item.nimi }}
            </router-link>
          </template>
          <template v-slot:cell(koulutustyyppi)="data">
            <slot name="koulutustyyppisarake" :perusteProjekti="data.item">
              <span class="text-nowrap">
                <EpColorIndicator :size="10" :kind="data.item.koulutustyyppi" v-if="data.item.koulutustyyppi"/>
                <span class="ml-1">
                  {{ $t(data.item.koulutustyyppi) }}
                </span>
              </span>
            </slot>
          </template>
        </b-table>
        <ep-pagination v-model="sivu"
                       :per-page="perPage"
                       :total-rows="total"/>
      </div>
      <div v-else class="m-2 alert alert-info">
        {{ $t('ei-hakutuloksia') }}
      </div>
    </div>
    <EpSpinner v-else />
  </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { PerusteQuery, PerusteprojektiKevytDto, PerusteprojektiListausDto, Perusteet, PerusteKevytDto } from '@shared/api/eperusteet';
import { EperusteetKoulutustyypit } from '@/utils/perusteet';
import { Page } from '@shared/tyypit';
import { BvTableFieldArray } from 'bootstrap-vue';
import { IProjektiProvider } from './types';
import ProjektiCard from './ProjektiCard.vue';
import * as _ from 'lodash';

export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

@Component({
  components: {
    EpColorIndicator,
    EpIcon,
    EpMainView,
    EpMultiSelect,
    EpPagination,
    EpSearch,
    EpSpinner,
    ProjektiCard,
  },
})
export default class EpPerusteprojektiListaus extends Vue {
  @Prop({ required: true })
  provider!: IProjektiProvider;

  @Prop({ required: true })
  newRoute!: any;

  @Prop({ required: true })
  editRoute!: string;

  @Prop({ required: false, default: true })
  showCards!: boolean;

  @Prop({ required: false, default: false })
  isPohja!: boolean;

  @Prop({ required: false })
  fieldKeys!: string[];

  @Prop({ required: false, default: () => ['koulutustyyppi', 'tila', 'voimassaolo'] })
  filters!: ProjektiFilter[];

  private koulutustyyppi: string | null = null;
  private peruste: PerusteKevytDto | null = null;
  private tila: string[] | null = null;
  private voimassaolo: string | null = null;
  private isLoading = false;

  private query = {
    sivu: 0,
    sivukoko: 10,
    koulutustyyppi: null as unknown,
    voimassaolo: true,
    siirtyma: true,
    tuleva: true,
    poistunut: false,
    koulutusvienti: true,
    tila: this.isPohja ? ['LAADINTA', 'VALMIS'] : ['LAADINTA', 'JULKAISTU'],
    nimi: '',
    jarjestysOrder: false,
    jarjestysTapa: 'nimi',
    perusteet: [],
  } as PerusteQuery;

  private perusteet: PerusteKevytDto[] = [];

  async mounted() {
    this.tila = this.isPohja ? ['LAADINTA', 'VALMIS'] : ['LAADINTA', 'JULKAISTU'];
    this.provider.updateOwnProjects();

    if (this.filtersInclude('peruste')) {
      this.perusteet = (await Perusteet.getAllOppaidenPerusteet()).data;
    }
  }

  @Watch('query', { deep: true, immediate: true })
  async onQueryChange(query: PerusteQuery) {
    this.isLoading = true;
    try {
      await this.provider.updateQuery({
        ...query,
      });
    }
    finally {
      this.isLoading = false;
    }
  }

  @Watch('tila')
  onTilaChange(tila: string) {
    this.query = {
      ...this.query,
      tila: tila
        ? [tila]
        : (this.isPohja ? ['LAADINTA', 'VALMIS', 'POISTETTU'] : ['LAADINTA', 'JULKAISTU', 'POISTETTU']),
    };
  }

  @Watch('voimassaolo')
  onChangeVoimassaolo(tila: string) {
    const defaults = {
      voimassaolo: false,
      siirtyma: false,
      tuleva: false,
      poistunut: false,
    };

    switch (tila) {
    case 'tuleva':
      this.query = { ...defaults, tuleva: true };
      break;
    case 'voimassaolo':
      this.query = { ...defaults, voimassaolo: true };
      break;
    case 'siirtyma':
      this.query = { ...defaults, siirtyma: true };
      break;
    case 'poistunut':
      this.query = { ...defaults, poistunut: true };
      break;
    default:
      this.query = {
        ...defaults,
        voimassaolo: true,
        tuleva: true,
        siirtyma: true,
      };
      break;
    }
  }

  @Watch('koulutustyyppi')
  onKoulutustyyppiChange(kt: string) {
    this.query.koulutustyyppi = [kt];
  }

  @Watch('peruste')
  onPerusteChange(peruste: PerusteKevytDto) {
    this.query.perusteet = [peruste.id as number];
  }

  get vaihtoehdotKoulutustyypit() {
    return EperusteetKoulutustyypit;
  }

  get vaihtoehdotTilat() {
    return this.isPohja ? ['LAADINTA', 'VALMIS', 'POISTETTU'] : ['LAADINTA', 'JULKAISTU', 'POISTETTU'];
  }

  get vaihtoehdotVoimassaolo() {
    return [
      'kaikki',
      'tuleva',
      'voimassaolo',
      'siirtyma',
      'poistunut',
    ];
  }

  get sivu() {
    return this.items?.sivu! + 1;
  }

  set sivu(value: number) {
    this.query.sivu = value - 1;
  }

  get perPage() {
    return this.items?.sivukoko || 10;
  }

  get total() {
    return this.items?.kokonaismäärä || 0;
  }

  get ownProjects() {
    if (this.$isAdmin?.value) {
      return [];
    }
    return this.provider.ownProjects.value;
  }

  get items() {
    return this.provider.projects.value;
  }

  get fields() {
    return _.filter(this.initialFields, (field: any) => !this.fieldKeys || _.includes(this.fieldKeys, field.key));
  }

  get initialFields(): BvTableFieldArray {
    const dateFormatter = (value: Date) => {
      return value
        ? this.$sd(value)
        : '-';
    };

    return [{
      key: 'nimi',
      label: this.$t('projektin-nimi') as string,
      sortable: true,
      formatter(value: any, key: string, item: PerusteprojektiKevytDto) {
        return item.nimi;
      },
    }, {
      key: 'koulutustyyppi',
      sortable: true,
      label: this.$t('koulutustyyppi') as string,
    }, {
      key: 'tila',
      sortable: true,
      label: this.$t('tila') as string,
      formatter: (value: any, key: string, item: PerusteprojektiKevytDto) => {
        return this.$t('tila-' + item!.tila);
      },
    }, {
      key: 'luotu',
      sortable: true,
      label: this.$t('luotu') as string,
      formatter: dateFormatter,
    }, {
      key: 'globalVersion.aikaleima',
      sortable: true,
      label: this.$t('muokattu') as string,
      formatter: dateFormatter,
    }, {
      key: 'peruste.voimassaoloAlkaa',
      sortable: true,
      label: this.$t('voimassaolo-alkaa') as string,
      formatter: dateFormatter,
    }, {
      key: 'peruste.voimassaoloLoppuu',
      sortable: true,
      label: this.$t('voimassaolo-loppuu') as string,
      formatter: dateFormatter,
    }];
  }

  filtersInclude(filter) {
    return !this.filters || _.includes(this.filters, filter);
  }
}
</script>

<style lang="scss" scoped>

.upper {
  margin-bottom: 3rem;
}

.lower {
  margin-top: 4rem;
}

.teksti {
  font-size: 22px;
  font-weight: 400;
}

.ikoni {
  font-size: 38px;
  font-weight: 100;
}

.card-wrapper {
  margin: 0 20px 20px 0;
}

.small-text {
  color: #1d346b;
}

</style>
