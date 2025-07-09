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
    wrapper.find('#koulutustyyppiFilter').find('.multiselect__option')
      .trigger('click');

    await nextTick();

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    // expect(wrapper.text()).toContain('test1'); // bootstrap rikki
  });

  test('filtered by tila', async () => {
    const wrapper = createWrapper();
    wrapper.find('#tilaFilter').find('.multiselect__option')
      .trigger('click');

    await nextTick();

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    // expect(wrapper.text()).toContain('test1'); // bootstrap rikki
  });

  test('filtered by voimassaolo', async () => {
    const wrapper = createWrapper();
    wrapper.find('#voimassaoloFilter').find('.multiselect__option')
      .trigger('click');

    await nextTick();

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    // expect(wrapper.text()).toContain('Kaarinan kaupunki'); // bootstrap rikki
  });

  test('filtered by peruste', async () => {
    const wrapper = createWrapper();
    wrapper.find('#perusteFilter').find('.multiselect__option')
      .trigger('click');

    await nextTick();

    expect(wrapper.text()).toContain('toteutussuunnitelmat 2 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    // expect(wrapper.text()).toContain('test1'); // bootstrap rikki
    // expect(wrapper.text()).toContain('test2'); // bootstrap rikki
  });

  test('filtered by koulutustoimija', async () => {
    const wrapper = createWrapper();
    wrapper.find('#koulutustoimijaFilter').findAll('.multiselect__element')
      .at(1)
      .find('.multiselect__option')
      .trigger('click');

    await nextTick();

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    // expect(wrapper.text()).toContain('test3'); // bootstrap rikki
    // expect(wrapper.text()).toContain('Hesa kaupunki'); // bootstrap rikki
  });
});
