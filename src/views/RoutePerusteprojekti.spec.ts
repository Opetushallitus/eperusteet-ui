import { mock } from '@/utils/tests';
import { mount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import { PerusteStore } from '@/stores/PerusteStore';
import RoutePerusteprojekti from './RoutePerusteprojekti.vue';
import '@shared/config/bootstrap';

window.scrollTo = jest.fn();

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
        $route: {
          params: {
            projektiId: 42,
          },
        },
      },
      stubs: {
        RouterLink: RouterLinkStub,
        Portal: '<div></div>',
      },
    });

    // expect(wrapper.text()).not.toBeFalsy();
  });
});
