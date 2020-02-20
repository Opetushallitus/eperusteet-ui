import Vue from 'vue'
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api'
import { getPerusteprojektit, PerusteprojektiKevytDto, Perusteprojektit, PerusteQuery, PerusteprojektiListausDto } from '@shared/api/eperusteet'
import { Page } from '@shared/tyypit'
import { IProjektiProvider } from '@/components/EpPerusteprojektiListaus/types';
import { asyncDebounce } from '@shared/utils/delay';
import _ from 'lodash'

Vue.use(VueCompositionApi)


export class PerusteStore implements IProjektiProvider {
  private state = reactive({
    ownProjects: null as PerusteprojektiListausDto[] | null,
    projects: null as Page<PerusteprojektiKevytDto> | null,
    perusteQuery: {} as PerusteQuery,
  })

  public readonly ownProjects = computed(() => this.state.ownProjects);
  public readonly projects = computed(() => this.state.projects);

  public readonly updateOwnProjects = async () => {
    const res = await Perusteprojektit.getOmatPerusteprojektit();
    this.state.ownProjects = res.data;
  }

  public readonly updateQuery = asyncDebounce(async (query: PerusteQuery) => {
    const queryWithDefaults = {
      ...query,
      jarjestysOrder: false,
      jarjestysTapa: 'nimi',
      tila: ['LAADINTA', 'KOMMENTOINTI', 'VIIMEISTELY', 'VALMIS', 'JULKAISTU'],
    };
    const res = await getPerusteprojektit(queryWithDefaults);
    this.state.projects = res.data as any;
  }, 300);

}

export const perusteStore = new PerusteStore()
