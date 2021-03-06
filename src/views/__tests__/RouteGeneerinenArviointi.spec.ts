import { mock } from '@/utils/tests';
import { ref, computed, reactive } from '@vue/composition-api';
import { mount, Wrapper, WrapperArray, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import { getMockGeneeriset } from './data';

import { ArviointiAsteikkoDto, GeneerinenArviointiasteikkoDto, Arviointiasteikot, GeneerinenArviointiasteikko } from '@shared/api/eperusteet';
import RouteGeneerinenArviointi from '../RouteGeneerinenArviointi.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';
import * as _ from 'lodash';
import { Page } from '@shared/tyypit';
import '@shared/config/bootstrap';
import '@shared/config/fontawesome';

describe('RouteGeneerinenArviointi', () => {
  const localVue = createLocalVue();

  test('Mounting', async () => {
    const arviointiStore = mock(ArviointiStore);
    const { geneeriset, arviointiasteikot } = getMockGeneeriset();
    arviointiStore.state.arviointiasteikot = arviointiasteikot;
    arviointiStore.state.geneeriset = geneeriset;

    const wrapper = mount(RouteGeneerinenArviointi, {
      propsData: {
        arviointiStore,
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
