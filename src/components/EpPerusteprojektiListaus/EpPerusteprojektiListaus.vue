<template>
  <div>
    <div class="upper">
      <slot name="upperheader">
        <h1 class="bg-danger">slot: upperheader</h1>
      </slot>
    </div>

    <div class="d-flex flex-wrap" v-if="items">
      <div class="card-wrapper">
        <ProjektiCard :full-background="true" :link="{ name: 'perusteprojektiLuonti' }">
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
        <ProjektiCard :link="{ name: 'perusteprojekti', params: { projektiId: project.id } }"
                      :indicator="project.tila">
          <template slot="lower" class="small-text">
            {{ $t('tila-' + project.tila) }}
          </template>
          <div class="h-100 w-100 d-flex align-items-center justify-content-center">
            <div>
              {{ project.nimi }}
            </div>
          </div>
        </ProjektiCard>
      </div>
    </div>
    <EpSpinner v-else />

    <div class="lower">
      <slot name="lowerheader">
        <h1 class="bg-danger">slot: lowerheader</h1>
      </slot>
    </div>

    <div class="filters" v-if="items">
      <div class="d-lg-flex align-items-end">
        <div class="m-2">
          <EpSearch v-model="query.nimi" :placeholder="$t('etsi-perusteprojektia')"/>
        </div>
        <div class="m-2">
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
        <div class="m-2">
          <label>{{ $t('tila') }}</label>
          <EpMultiSelect v-model="tila"
                    :enable-empty-option="true"
                    placeholder="kaikki"
                    :is-editing="true"
                    :options="vaihtoehdotTilat">
            <template slot="singleLabel" slot-scope="{ option }">
              {{ $t('tila-' + option.toLowerCase()) }}
            </template>
            <template slot="option" slot-scope="{ option }">
              {{ $t('tila-' + option.toLowerCase()) }}
            </template>
          </EpMultiSelect>
        </div>
        <div class="m-2">
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
      <b-table striped hover :items="items.data" :fields="fields">
        <template v-slot:cell(nimi)="data">
          <router-link :to="{ name: 'perusteprojekti', params: { projektiId: data.item.id } }">
            {{ data.item.nimi }}
          </router-link>
        </template>
        <template v-slot:cell(koulutustyyppi)="data">
          <span class="text-nowrap">
            <EpColorIndicator :size="10" :kind="data.item.koulutustyyppi" />
            <span class="ml-1">
              {{ $t(data.item.koulutustyyppi) }}
            </span>
          </span>
        </template>
      </b-table>
      <b-pagination align="center"
                    no-local-sorting
                    v-model="sivu"
                    :per-page="perPage"
                    :total-rows="total"/>
    </div>
    <EpSpinner v-else />
  </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator'
import EpMainView from '@shared/components/EpMainView/EpMainView.vue'
import EpIcon from '@shared/components/EpIcon/EpIcon.vue'
import EpSearch from '@shared/components/forms/EpSearch.vue'
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue'
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue'
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue'
import { PerusteQuery, PerusteprojektiKevytDto, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import { EperusteetKoulutustyypit } from '@/utils/perusteet';
import { Page } from '@shared/tyypit'
import { BvTableFieldArray } from 'bootstrap-vue'
import { IProjektiProvider } from './types'
import ProjektiCard from './ProjektiCard.vue';


export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

@Component({
  components: {
    EpColorIndicator,
    EpIcon,
    EpMainView,
    EpMultiSelect,
    EpSearch,
    EpSpinner,
    ProjektiCard,
  }
})
export default class EpPerusteprojektiListaus extends Vue {

  @Prop({ required: true })
  provider!: IProjektiProvider;

  @Prop({ default: () => ['koulutustyyppi', 'tila'] })
  filters!: ProjektiFilter[];

  private koulutustyyppi: string | null = null;
  private tila: string | null = null;
  private voimassaolo: string | null = null;
  private isLoading = false;

  query = {
    sivu: 0,
    sivukoko: 10,
    koulutustyyppi: undefined,
    voimassaolo: true,
    siirtyma: true,
    tuleva: true,
    poistunut: false,
    koulutusvienti: true,
    nimi: '',
  } as PerusteQuery;

  mounted() {
    this.provider.updateOwnProjects();
  }

  @Watch('query', { deep: true, immediate: true })
  async onQueryChange(query: PerusteQuery) {
    this.isLoading = true;
    try {
      await this.provider.updateQuery({
        ...query,
        koulutustyyppi: [this.koulutustyyppi!],
        tila: this.tila
        ? [this.tila]
        : ['LAADINTA', 'KOMMENTOINTI', 'VIIMEISTELY', 'VALMIS', 'JULKAISTU'],
      });
    }
    finally {
      this.isLoading = false;
    }
  }

  get vaihtoehdotKoulutustyypit() {
    return EperusteetKoulutustyypit;
  }

  get vaihtoehdotTilat() {
    return ['POISTETTU', 'LAADINTA', 'KOMMENTOINTI', 'VIIMEISTELY', 'VALMIS', 'JULKAISTU'];
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
    if (!this.provider.ownProjects.value) {
      return null;
    }
    return this.provider.ownProjects.value;
  }

  get items() {
    if (!this.provider.projects.value) {
      return null;
    }
    return this.provider.projects.value;
  }

  get fields(): BvTableFieldArray {
    const dateFormatter = (value: Date) => {
      return value
        ? this.$date(value)
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
