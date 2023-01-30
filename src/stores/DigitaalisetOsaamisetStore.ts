import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Ulkopuoliset, getPerusteprojektit, PerusteHakuDto, getAllPerusteet, PerusteprojektiKevytDto, Perusteprojektit, PerusteQuery, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import { Page } from '@shared/tyypit';
import { IProjektiProvider } from '@/components/EpPerusteprojektiListaus/types';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class DigitaalisetOsaamisetStore implements IProjektiProvider {
  constructor(
    private overrides = {} as PerusteQuery & any
  ) {
  }

  public state = reactive({
    ownProjects: null as PerusteprojektiListausDto[] | null,
    projects: null as Page<PerusteprojektiKevytDto> | null,
    perusteQuery: {} as PerusteQuery,
  })

  public readonly ownProjects = computed(() => this.state.ownProjects);
  public readonly projects = computed(() => this.state.projects);

  public async updateOwnProjects() {
    const res = _.map(await Promise.all(
      [
        this.findPerusteet({ tila: ['LAADINTA'] }),
        this.findPerusteet({ tila: ['JULKAISTU'] }),
      ]
    ), 'data') as any;
    this.state.ownProjects = _.uniqBy([...res[0], ...res[1]], projekti => projekti.id);
  }

  public clear() {
    this.state.ownProjects = null;
    this.state.projects = null;
  }

  @Debounced(300)
  public async updateQuery(query: PerusteQuery) {
    this.state.projects = (await this.findPerusteet({ tila: ['POISTETTU'] }));

    if (_.size(this.state.projects.data) > 0) {
      const rights = (await Perusteprojektit.getPerusteprojektienOikeudet(_.map(this.state.projects.data, 'id') as number[])).data;
      const resWithRights = {
        ...this.state.projects,
        data: (this.state.projects).data.map(proj => ({
          ...proj,
          oikeudet: rights[proj.id!],
        })),
      };

      this.state.projects = resWithRights;
    }
  }

  public async findPerusteet(query) {
    const res = await getPerusteprojektit({
      sivu: 0,
      sivukoko: 100,
      voimassaolo: false,
      siirtyma: false,
      tuleva: false,
      poistunut: false,
      tyyppi: ['DIGITAALINEN_OSAAMINEN'],
      nimi: '',
      jarjestysOrder: false,
      jarjestysTapa: 'nimi',
      perusteet: [],
      ...query,
    });
    return res.data as Page<PerusteprojektiKevytDto>;
  }
}
