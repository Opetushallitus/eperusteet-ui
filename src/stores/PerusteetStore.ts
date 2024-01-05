import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Ulkopuoliset, getPerusteprojektit, PerusteHakuDto, getAllPerusteet, PerusteprojektiKevytDto, Perusteprojektit, PerusteQuery, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import { Page } from '@shared/tyypit';
import { IProjektiProvider } from '@/components/EpPerusteprojektiListaus/types';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class PerusteetStore implements IProjektiProvider {
  constructor(
    private overrides = {} as PerusteQuery & any,
  ) {
  }

  public state = reactive({
    ownProjects: null as PerusteprojektiListausDto[] | null,
    projects: null as Page<PerusteprojektiKevytDto> | null,
    perusteQuery: {} as PerusteQuery,
  });

  public readonly ownProjects = computed(() => {
    if (this.state.ownProjects) {
      return _.filter(this.state.ownProjects, p => {
        const tyyppi = this.overrides?.tyyppi;
        return !tyyppi || _.includes(tyyppi, _.toUpper(p.peruste?.tyyppi));
      });
    }
    return null;
  });

  public readonly projects = computed(() => this.state.projects);

  public async updateOwnProjects() {
    const res = _.map(await Promise.all([Perusteprojektit.getOmatPerusteprojektit(), Perusteprojektit.getOmatJulkaistutPerusteprojektit()]), 'data') as any;
    this.state.ownProjects = _.uniqBy([...res[0], ...res[1]], projekti => projekti.id);
  }

  public clear() {
    this.state.ownProjects = null;
    this.state.projects = null;
  }

  @Debounced(300)
  public async updateQuery(query: PerusteQuery) {
    const res = (await getPerusteprojektit({
      ...query,
      ...this.overrides,
    })).data as any;
    const projectIds = _.chain((res).data)
      .map('id')
      .value() as number[];

    if (_.size(projectIds) > 0) {
      const rights = (await Perusteprojektit.getPerusteprojektienOikeudet(projectIds)).data;
      const resWithRights = {
        ...res,
        data: (res).data.map((proj: PerusteprojektiKevytDto) => ({
          ...proj,
          oikeudet: rights[proj.id!],
        })),
      };

      this.state.projects = resWithRights;
    }
    else {
      this.state.projects = res;
    }
  }

  public async findPerusteet(query: PerusteQuery) {
    const res = await getAllPerusteet({
      ...query,
    });
    return res.data as Page<PerusteHakuDto>;
  }
}
