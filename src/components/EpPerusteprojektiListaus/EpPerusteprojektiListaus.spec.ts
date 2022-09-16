import Vue from 'vue';
import VueCompositionApi, { ref, computed, reactive } from '@vue/composition-api';
import { mount, Wrapper, WrapperArray, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import { PerusteQuery, PerusteprojektiKevytDto, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import EpPerusteprojektiListaus from './EpPerusteprojektiListaus.vue';
import { IProjektiProvider } from './types';
import { Page } from '@shared/tyypit';
import '@shared/config/bootstrap';
import '@shared/config/fontawesome';
import { Oikeustarkastelu } from '@shared/plugins/oikeustarkastelu';
Vue.use(VueCompositionApi);

function map<T extends Vue, R>(wrapper: WrapperArray<T>, fn: (param: Wrapper<T>) => R): R[] {
  const result = [] as R[];
  for (let idx = 0; idx < wrapper.length; ++idx) {
    result.push(fn(wrapper.at(idx)));
  }
  return result;
}

describe('Projektilistaus', () => {
  const localVue = createLocalVue();
  localVue.use(Oikeustarkastelu, {
    oikeusProvider: {
      async hasOikeus() {
        return true;
      },
    },
  });

  const data = reactive({
    projects: null as Page<PerusteprojektiKevytDto[]> | null,
    ownProjects: null as PerusteprojektiListausDto[] | null,
  });

  const store: IProjektiProvider = {
    ownProjects: computed(() => data.ownProjects),
    projects: computed(() => data.projects),
    updateQuery: jest.fn(async (query: PerusteQuery) => {
    }),
    updateOwnProjects: jest.fn(async () => {
    }),
  };

  test('Mounting', async () => {
    const wrapper = mount(EpPerusteprojektiListaus, {
      propsData: {
        provider: store,
        newRoute: { name: 'luonti' },
        editRoute: 'asia',
      },
      localVue,
      mocks: {
        $t: x => x,
        $isAdmin: () => false,
        $hasOphCrud: () => true,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    });

    expect(wrapper.findAll('.oph-spinner').length).toEqual(2);
    expect(store.updateQuery).toBeCalledTimes(1);
    expect(store.updateOwnProjects).toBeCalledTimes(1);
    data.projects = {
      sivu: 0,
      sivukoko: 10,
      sivuja: 1,
      kokonaismäärä: 1,
      data: [{
        id: 42,
        nimi: 'projekti 42',
        tila: 'valmis',
        peruste: {
          tyyppi: 'normaali',
          koulutustyyppi: 'koulutustyyppi_11',
        },
      }] as any,
    };

    data.ownProjects = [{
      id: 43,
      nimi: 'perusteprojekti',
      tila: 'laadinta' as any,
      peruste: {
        koulutustyyppi: 'koulutustyyppi_11',
      },
    }];

    await localVue.nextTick();

    expect(wrapper.findAll('.oph-spinner').length).toEqual(0);
    expect(wrapper.html()).toContain('projekti 42');
    expect(wrapper.html()).toContain('perusteprojekti');
    expect(wrapper.html()).toContain('laadinta');
    expect(wrapper.html()).toContain('valmis');
    expect(map(wrapper.findAll(RouterLinkStub), v => v.props().to)).toEqual(expect.arrayContaining([{
      name: 'luonti',
    }, {
      name: 'asia',
      params: {
        projektiId: 42,
      },
    }, {
      name: 'asia',
      params: {
        projektiId: 43,
      },
    }]));
  });

  test('Oma projekti', async () => {
    const wrapper = mount(EpPerusteprojektiListaus, {
      propsData: {
        provider: store,
        newRoute: { name: 'luonti' },
        editRoute: 'asia',
      },
      localVue,
      mocks: {
        $t: x => x,
        $isAdmin: () => true,
        $hasOphCrud: () => true,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    });

    data.projects = {
      sivu: 0,
      sivukoko: 10,
      sivuja: 1,
      kokonaismäärä: 1,
      data: [{
        id: 42,
        nimi: 'projekti 42',
        peruste: {
          tyyppi: 'normaali',
          koulutustyyppi: 'koulutustyyppi_11',
        },
        tila: 'valmis',
      }] as any,
    };

    data.ownProjects = [{
      id: 43,
      nimi: 'oma projekti',
      tila: 'laadinta' as any,
      peruste: {
        koulutustyyppi: 'koulutustyyppi_11',
      },
    }];

    expect(wrapper.html()).toContain('projekti 42');
    expect(wrapper.html()).toContain('oma projekti');
  });
});
