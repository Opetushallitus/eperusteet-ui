import RoutePohjatLuonti from '../RoutePohjatLuonti.vue';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { mockPohjaPerusteet, mockTyoryhmat } from './data';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteprojektiDto } from '@shared/api/eperusteet';
import { delay } from '@shared/utils/delay';
import { mock } from '@shared/utils/jestutils';
import { mount } from '@vue/test-utils';
import { globalStubs } from '@shared/utils/__tests__/stubs';
import { nextTick } from 'vue';

const mockRouterPush = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: {},
  })),
  useRouter: vi.fn(() => ({
    push: mockRouterPush,
  })),
}));

describe('RoutePohjatLuonti component', () => {
  afterEach(() => {
    mockRouterPush.mockClear();
  });

  const pohjatStore = mock(PerusteetStore);
  pohjatStore.updateQuery = vi.fn(async () => {});
  pohjatStore.state.projects = mockPohjaPerusteet();
  const ulkopuolisetStore = mock(UlkopuolisetStore);
  ulkopuolisetStore.fetchTyoryhmat = vi.fn(async () => {});
  ulkopuolisetStore.state.tyoryhmat = mockTyoryhmat();
  const perusteprojektiStore = mock(PerusteprojektiStore);
  perusteprojektiStore.addPerusteprojektiPohja = vi.fn(async () => {
    return {
      id: 1,
    } as PerusteprojektiDto;
  });

  function mountWrapper(props: any, router?) {
    return mount(RoutePohjatLuonti,
      {
        propsData: {
          pohjatStore,
          ulkopuolisetStore,
          perusteprojektiStore,
          ...props,
        },
        global: {
          ...globalStubs,
        },
      });
  }

  test('Renders first step text', async () => {
    const wrapper = mountWrapper({});

    expect(wrapper.text()).toContain('pohjan-valinta');
    expect(wrapper.text()).toContain('projektin-tiedot');

    expect(wrapper.text()).toContain('kayta-pohjana');
    expect(wrapper.findAll('b-form-radio')).toHaveLength(2);
    expect(wrapper.findAll('b-form-radio').at(0)
      .text()).toContain('toista-pohjaa');
    expect(wrapper.findAll('b-form-radio').at(1)
      .text()).toContain('uusi');

    expect(wrapper.text()).toContain('peruuta');
    expect(wrapper.text()).toContain('seuraava');
  });

  test('Pohjan luonti canceled', async () => {
    let currentRoute;
    const wrapper = mountWrapper({}, {
      async push(route: any) {
        currentRoute = route;
      },
    });

    wrapper.findAll('.b-button').at(0)
      .trigger('click');

    await nextTick();

    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'pohjat',
    });
  });

  test('Renders second step after press', async () => {
    const wrapper = mountWrapper({});

    expect(wrapper.text()).toContain('kayta-pohjana');
    wrapper.findAll('.b-button').at(1).trigger('click');

    await nextTick();
    expect(wrapper.text()).not.toContain('kayta-pohjana');

    expect(wrapper.html()).toContain('projektin-nimi-label');
    expect(wrapper.html()).toContain('perustetyoryhma');
    expect(wrapper.html()).toContain('koulutus-tutkintotyyppi');

    expect(wrapper.findAll('.b-button').at(2)
      .text()).toContain('luo-perustepohja');
  });

  test('Renders second step after press and goes back', async () => {
    const wrapper = mountWrapper({});

    expect(wrapper.text()).toContain('kayta-pohjana');
    wrapper.findAll('.b-button').at(1).trigger('click');

    await nextTick();
    expect(wrapper.text()).not.toContain('kayta-pohjana');
    wrapper.findAll('.b-button').at(1)
      .trigger('click');

    await nextTick();
    expect(wrapper.text()).toContain('kayta-pohjana');
  });

  test('Renders second step and uses validations', async () => {
    let currentRoute;
    const wrapper = mountWrapper({}, {
      async push(route: any) {
        currentRoute = route;
      },
    });

    wrapper.findAll('.b-button').at(1).trigger('click');

    await nextTick();
    expect(wrapper.findAll('.b-button').at(2)
      .attributes('disabled')).toBeDefined();

    wrapper.find('input[placeholder="kirjoita-projektin-nimi"]').setValue('nimi');
    wrapper.findAll('.multiselect__element').at(0)
      .find('.multiselect__option')
      .trigger('click');
    wrapper.findAll('.multiselect__element').at(5)
      .find('.multiselect__option')
      .trigger('click');

    await nextTick();

    wrapper.findAll('.b-button').at(2).trigger('click');

    await nextTick();

    expect(perusteprojektiStore.addPerusteprojektiPohja).toHaveBeenCalled();

    await nextTick();

    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'perusteprojekti',
      params: {
        projektiId: '1',
      },
    });
  });
});
