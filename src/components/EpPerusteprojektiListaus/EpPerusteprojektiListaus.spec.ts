import { mount, RouterLinkStub } from '@vue/test-utils';
import { PerusteQuery, PerusteprojektiKevytDto, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import EpPerusteprojektiListaus from './EpPerusteprojektiListaus.vue';
import { IProjektiProvider } from './types';
import { Page } from '@shared/tyypit';
import { reactive } from 'vue';
import { computed } from 'vue';
import { globalStubs } from '@shared/utils/__tests__/stubs';
import { nextTick } from 'vue';

function map<T extends Vue, R>(wrapper: any, fn: (param: any) => R): R[] {
  const result = [] as R[];
  for (let idx = 0; idx < wrapper.length; ++idx) {
    result.push(fn(wrapper.at(idx)));
  }
  return result;
}

describe('Projektilistaus', () => {

  const data = reactive({
    projects: null as Page<PerusteprojektiKevytDto[]> | null,
    ownProjects: null as PerusteprojektiListausDto[] | null,
  });

  const store: IProjektiProvider = {
    ownProjects: computed(() => data.ownProjects),
    projects: computed(() => data.projects),
    updateQuery: vi.fn(async (query: PerusteQuery) => {
    }),
    updateOwnProjects: vi.fn(async () => {
    }),
  };

  test('Mounting', async () => {
    const wrapper = mount(EpPerusteprojektiListaus, {
      propsData: {
        provider: store,
        newRoute: { name: 'luonti' },
        editRoute: 'asia',
      },
      global: {
        ...globalStubs,
      },
    });

    expect(wrapper.findAll('.oph-spinner').length).toEqual(1);
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

    wrapper.setProps({
      provider: {
        ownProjects: computed(() => data.ownProjects),
        projects: computed(() => data.projects),
        updateQuery: vi.fn(async (query: PerusteQuery) => {
        }),
        updateOwnProjects: vi.fn(async () => {
        }),
      },
    });

    await nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('.oph-spinner').length).toEqual(0);
    expect(wrapper.html()).toContain('projekti 42');
    expect(wrapper.html()).toContain('perusteprojekti');
    expect(wrapper.html()).toContain('laadinta');
    expect(wrapper.html()).toContain('valmis');
    expect(map(wrapper.findAllComponents(RouterLinkStub), v => v.props().to)).toEqual(expect.arrayContaining([{
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
      global: {
        ...globalStubs,
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

    await nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.html()).toContain('projekti 42');
    expect(wrapper.html()).toContain('oma projekti');
  });
});
