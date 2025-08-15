import { mock, mocks } from '@shared/utils/jestutils';
import { mount} from '@vue/test-utils';
import { mockPerusteet, toteutussuunnitelmaTilastotMocks } from './data';
import RouteTilastot from '../RouteTilastot.vue';
import { TilastotStore } from '@/stores/TilastotStore';
import { globalStubs } from '@shared/utils/__tests__/stubs';
import { nextTick } from 'vue';

describe('RouteTilastot', () => {

  const createWrapper = () => {
    const tilastotStore = mock(TilastotStore);
    tilastotStore.state.toteutussuunnitelmat = toteutussuunnitelmaTilastotMocks as any;
    tilastotStore.state.opetussuunnitelmat = [] as any;
    tilastotStore.state.perusteet = mockPerusteet() as any;

    return mount(RouteTilastot, {
      propsData: {
        tilastotStore,
      },
      global: {
        ...globalStubs,
      },
      stubs: {
        apexchart: '<div />',
      },
    });
  };

  // Helper function to switch to amosaa-tyokalu tab
  const switchToAmosaaTab = async (wrapper: any) => {
    const amosaaTabs = wrapper.findAll('.nav-tabs .nav-link');
    const amosaaTab = amosaaTabs.find((tab: any) => tab.text().includes('amosaa-tyokalu'));

    if (amosaaTab) {
      await amosaaTab.trigger('click');
      await nextTick();
    }
  };

  test('Mounting', async () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('toteutussuunnitelmat 3 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 2 kpl');
  });

  test('filtered by name', async () => {
    const wrapper = createWrapper();

    wrapper.find('input[type="search"]').setValue('test2');

    await nextTick();

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
  });

  test('filtered by koulutustyyppi', async () => {
    const wrapper = createWrapper();
    await nextTick();
    await switchToAmosaaTab(wrapper);

    await clickMultiselectOption(wrapper.find('#koulutustyyppiFilter'));

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    // expect(wrapper.text()).toContain('test1'); // bootstrap rikki
  });

  test('filtered by tila', async () => {
    const wrapper = createWrapper();
    await clickMultiselectOption(wrapper.find('#tilaFilter'));

    await nextTick();

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    // expect(wrapper.text()).toContain('test1'); // bootstrap rikki
  });

  test('filtered by voimassaolo', async () => {
    const wrapper = createWrapper();
    await clickMultiselectOption(wrapper.find('#voimassaoloFilter'));

    await nextTick();

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    // expect(wrapper.text()).toContain('Kaarinan kaupunki'); // bootstrap rikki
  });

  test('filtered by peruste', async () => {
    const wrapper = createWrapper();
    await clickMultiselectOption(wrapper.find('#perusteFilter'));

    await nextTick();

    expect(wrapper.text()).toContain('toteutussuunnitelmat 2 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    // expect(wrapper.text()).toContain('test1'); // bootstrap rikki
    // expect(wrapper.text()).toContain('test2'); // bootstrap rikki
  });

  test.skip('filtered by koulutustoimija', async () => {
    const wrapper = createWrapper();
    await clickMultiselectOption(wrapper.find('#koulutustoimijaFilter'));

    await nextTick();

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    // expect(wrapper.text()).toContain('test3'); // bootstrap rikki
    // expect(wrapper.text()).toContain('Hesa kaupunki'); // bootstrap rikki
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
