import { mount, RouterLinkStub } from '@vue/test-utils';
import RoutePerusteprojektiLuonti from '../RoutePerusteprojektiLuonti.vue';
import _ from 'lodash';
import { mockTyoryhmat, mockPerusteet } from './data';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteprojektiDto } from '@shared/api/eperusteet';
import { delay } from '@shared/utils/delay';
import Vuelidate from 'vuelidate';
import { mock } from '@shared/utils/jestutils';
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
  const ulkopuolisetStore = mock(UlkopuolisetStore);
  ulkopuolisetStore.state.tyoryhmat = mockTyoryhmat();
  ulkopuolisetStore.fetchTyoryhmat = vi.fn(async () => {});
  const perusteprojektiStore = mock(PerusteprojektiStore);
  perusteprojektiStore.fetchPohjat = vi.fn(async () => {});
  perusteprojektiStore.fetchPohjaProjektit = vi.fn(async () => {});
  perusteprojektiStore.state.pohjat = mockPerusteet().data;
  perusteprojektiStore.state.perusteet = mockPerusteet().data;
  perusteprojektiStore.addPerusteprojekti = vi.fn(async () => {
    return {
      id: 1,
    } as PerusteprojektiDto;
  });

  // TypeError: document.createRange is not a function -ilman
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    } as any,
  } as any);

  function mountWrapper(props: any, router?) {
    return mount(RoutePerusteprojektiLuonti,
      {
        propsData: {
          ulkopuolisetStore,
          perusteprojektiStore,
          ...props,
        },
        global: {
          ...globalStubs,
        },
        attachToDocument: true,
      });
  }

  test.only('Renders first step text', async () => {
    const wrapper = mountWrapper({});

    expect(wrapper.find('.steps').text()).toContain('pohjan-valinta');
    expect(wrapper.find('.steps').text()).toContain('projektin-tiedot');
    expect(wrapper.find('.steps').text()).toContain('aikataulu');
    expect(wrapper.find('.steps').text()).toContain('tietojen-tarkistus');

    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(4);
    expect(wrapper.findAll('input[type="radio"] + label').at(0)
      .text()).toContain('perustepohjaa');
    expect(wrapper.findAll('input[type="radio"] + label').at(1)
      .text()).toContain('toista-perusteprojektia');
    expect(wrapper.findAll('input[type="radio"] + label').at(2)
      .text()).toContain('luo-uusi-ilman-pohjaa');
    expect(wrapper.findAll('input[type="radio"] + label').at(3)
      .text()).toContain('tuo-tiedostosta');
  });

  test.only('Projektin luonti canceled', async () => {
    let currentRoute;
    const wrapper = mountWrapper({}, {});

    wrapper.findAll('.b-button').at(0)
      .trigger('click');

    await nextTick();

    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'perusteprojektit',
    });
  });

});
