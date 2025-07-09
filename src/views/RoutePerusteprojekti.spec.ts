import { mount, RouterLinkStub } from '@vue/test-utils';
import { PerusteStore } from '@/stores/PerusteStore';
import RoutePerusteprojekti from './RoutePerusteprojekti.vue';
import { globalStubs } from '@shared/utils/__tests__/stubs';
import { mock } from '@shared/utils/jestutils';
import { vi } from 'vitest';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: {
      projektiId: '123'
    }
  })),
  useRouter: vi.fn(),
}));

describe('RoutePerusteprojekti', () => {

  test('Mounting', async () => {
    const wrapper = mount(RoutePerusteprojekti, {
      props: {
        perusteStore: mock(PerusteStore),
      },
      global: {
        ...globalStubs,
      },
    });

    expect(wrapper).toBeTruthy();
  });
});
