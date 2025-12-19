import { reactive, computed, ref, watch } from 'vue';
import { Ulkopuoliset, getPerusteprojektit, PerusteHakuDto, getAllPerusteet, PerusteprojektiKevytDto, Perusteprojektit, PerusteQuery, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import { Page } from '@shared/tyypit';
import { IProjektiProvider } from '@/components/EpPerusteprojektiListaus/types';
import { debounced } from '@shared/utils/delay';
import _ from 'lodash';

export class OmatPerusteetStore implements IProjektiProvider {
  constructor(
    private initQuery = {} as PerusteQuery & any,
  ) {
  }

  public state = reactive({
    ownProjects: null as PerusteprojektiListausDto[] | null,
    projects: null as Page<PerusteprojektiKevytDto> | null,
    perusteQuery: {} as PerusteQuery,
  });

  public readonly ownProjects = computed(() => {
    return this.state.ownProjects;
  });

  public readonly projects = computed(() => this.state.projects);

  public async updateOwnProjects() {
    const res = _.map(await Promise.all([
      Perusteprojektit.getOmatPerusteprojektit([...this.initQuery.tyyppi]),
      Perusteprojektit.getOmatJulkaistutPerusteprojektit([...this.initQuery.tyyppi])],
    ), 'data') as any;
    this.state.ownProjects = _.uniqBy([...res[0], ...res[1]], projekti => projekti.id);
  }

  public clear() {
    this.state.ownProjects = null;
    this.state.projects = null;
  }

  public updateQuery = debounced(async (query: PerusteQuery) => {
    const res = (await getPerusteprojektit({
      ...this.initQuery,
      ...query,
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
  });

  public async findPerusteet(query: PerusteQuery) {
    const res = await getAllPerusteet({
      ...query,
    });
    return res.data as Page<PerusteHakuDto>;
  }
}
