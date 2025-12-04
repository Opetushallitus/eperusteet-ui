import RoutePohjatLuonti from '../RoutePohjatLuonti.vue';
import { OmatPerusteetStore } from '@/stores/OmatPerusteetStore';
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

  const pohjatStore = mock(OmatPerusteetStore);
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
    expect(wrapper.findAll('.ep-radio')).toHaveLength(2);
    expect(wrapper.findAll('.ep-radio').at(0)
      .text()).toContain('toista-pohjaa');
    expect(wrapper.findAll('.ep-radio').at(1)
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
    wrapper.findAll('.b-button').at(1)
      .trigger('click');

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
    wrapper.findAll('.b-button').at(1)
      .trigger('click');

    await nextTick();
    expect(wrapper.text()).not.toContain('kayta-pohjana');
    wrapper.findAll('.b-button').at(1)
      .trigger('click');

    await nextTick();
    expect(wrapper.text()).toContain('kayta-pohjana');
  });

  //koulutustyyppiselect tyhjä(?)
  test.skip('Renders second step and uses validations', async () => {
    let currentRoute;
    const wrapper = mountWrapper({}, {
      async push(route: any) {
        currentRoute = route;
      },
    });

    wrapper.findAll('.b-button').at(1)
      .trigger('click');

    await nextTick();
    expect(wrapper.findAll('.b-button').at(2)
      .attributes('disabled')).toBeDefined();

    wrapper.find('input[placeholder="kirjoita-projektin-nimi"]').setValue('nimi');

    await clickMultiselectOption(wrapper.find('#perustetyoryhma'));
    await clickMultiselectOption(wrapper.find('#koulutustutkintotyyppi'));

    await nextTick();

    wrapper.findAll('.b-button').at(2)
      .trigger('click');

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

  const clickMultiselectOption = async (multiselectWrapper: any) => {
    const multiselectEl = multiselectWrapper.find('.multiselect');

    await multiselectEl.trigger('mousedown');
    await nextTick();

    const inputEl = multiselectWrapper.find('.multiselect__input');

    if (inputEl.exists()) {
      await inputEl.trigger('focus');
      await inputEl.trigger('click');
      await nextTick();
    }

    const options = multiselectWrapper.findAll('.multiselect__option');

    if (options.length > 0) {
      await options[0].trigger('click');
      await nextTick();
    }
  };
});
