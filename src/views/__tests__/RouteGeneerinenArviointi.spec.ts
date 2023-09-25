import { mock } from '@/utils/tests';
import { mount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import { getMockGeneeriset } from './data';
import RouteGeneerinenArviointi from '../RouteGeneerinenArviointi.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';
import '@shared/config/bootstrap';
import { KayttajaStore } from '@/stores/kayttaja';

describe('RouteGeneerinenArviointi', () => {
  const localVue = createLocalVue();

  test('Mounting', async () => {
    const arviointiStore = mock(ArviointiStore);
    const kayttajaStore = mock(KayttajaStore);
    const { geneeriset, arviointiasteikot } = getMockGeneeriset();
    arviointiStore.state.arviointiasteikot = arviointiasteikot;
    arviointiStore.state.geneeriset = geneeriset;
    arviointiStore.fetchArviointiasteikot = jest.fn(async () => {});
    arviointiStore.fetchGeneeriset = jest.fn(async () => {});
    kayttajaStore.state.tiedot = {
      oikeudet: ['ROLE_APP_EPERUSTEET_ADMIN_1.2.246.562.10.00000000001'],
    };

    const wrapper = mount(RouteGeneerinenArviointi, {
      propsData: {
        arviointiStore,
        kayttajaStore,
      },
      localVue,
      mocks: {
        $t: x => x,
        $kaanna: x => '[' + x?.fi + ']',
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    });

    expect(wrapper.text()).toContain('Opiskelija');
    expect(wrapper.text()).toContain('Ensimmäinen geneerinen');
    expect(wrapper.text()).toContain('Kriteeri 1');
    expect(wrapper.text()).toContain('Kriteeri 2');
    expect(wrapper.text()).toContain('Kriteeri 3');
    expect(wrapper.text()).toContain('Kriteeri 4');
    expect(wrapper.text()).toContain('Kriteeri 5');
    expect(wrapper.text()).toContain('Tyydyttävä T1');
    expect(wrapper.text()).toContain('Tyydyttävä T2');
    expect(wrapper.text()).toContain('Hyvä H3');
    expect(wrapper.text()).toContain('Hyvä H4');
    expect(wrapper.text()).toContain('Kiitettävä K5');
  });
});
