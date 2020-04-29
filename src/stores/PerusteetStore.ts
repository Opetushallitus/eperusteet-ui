import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Ulkopuoliset, getPerusteprojektit, getAllPerusteet, PerusteprojektiKevytDto, Perusteprojektit, PerusteQuery, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import { Page } from '@shared/tyypit';
import { IProjektiProvider } from '@/components/EpPerusteprojektiListaus/types';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class PerusteetStore implements IProjektiProvider {
  constructor(
    private overrides = {} as PerusteQuery & any
  ) {
  }

  public state = reactive({
    ownProjects: null as PerusteprojektiListausDto[] | null,
    projects: null as Page<PerusteprojektiKevytDto> | null,
    perusteQuery: {} as PerusteQuery,
  })

  public readonly ownProjects = computed(() => {
    return _.filter(this.state.ownProjects, p => {
      const tyyppi = this.overrides?.tyyppi;
      return !tyyppi || _.includes(tyyppi, _.toUpper(p.peruste?.tyyppi));
    });
  });

  public readonly projects = computed(() => this.state.projects);

  public async updateOwnProjects() {
    const res = await Perusteprojektit.getOmatPerusteprojektit();
    this.state.ownProjects = res.data;
  }

  public clear() {
    this.state.ownProjects = null;
    this.state.projects = null;
  }

  @Debounced(300)
  public async updateQuery(query: PerusteQuery) {
    const res = await getPerusteprojektit({
      ...query,
      ...this.overrides,
    });
    this.state.projects = res.data as any;
  }

  public async findPerusteet(query: PerusteQuery) {
    const res = await getAllPerusteet({
      ...query,
    });
    return res.data;
  }

}
