import { mock } from '@/utils/tests';
import { ref, computed, reactive } from '@vue/composition-api';
import { mount, Wrapper, WrapperArray, createLocalVue, RouterLinkStub } from '@vue/test-utils';

import { PerusteStore } from '@/stores/PerusteStore';
import RoutePerusteprojekti from './RoutePerusteprojekti.vue';
import * as _ from 'lodash';
import { Page } from '@shared/tyypit';
import '@shared/config/bootstrap';
import '@shared/config/fontawesome';

describe('RoutePerusteprojekti', () => {
  const localVue = createLocalVue();

  test('Mounting', async () => {
    const perusteStore = mock(PerusteStore);

    const wrapper = mount(RoutePerusteprojekti, {
      propsData: {
        perusteStore,
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

    expect(wrapper.text()).not.toBeFalsy();
  });
});
