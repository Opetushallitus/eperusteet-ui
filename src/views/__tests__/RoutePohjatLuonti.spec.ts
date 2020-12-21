import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils';
import RoutePohjatLuonti from '../RoutePohjatLuonti.vue';
import BootstrapVue from 'bootstrap-vue';
import _ from 'lodash';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { mock } from '@/utils/tests';
import { mockPohjaPerusteet, mockTyoryhmat } from './data';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteprojektiDto } from '@shared/api/eperusteet';
import { delay } from '@shared/utils/delay';
import { faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons';

describe('RoutePohjatLuonti component', () => {
  const localVue = createLocalVue();
  localVue.use(BootstrapVue);

  const pohjatStore = mock(PerusteetStore);
  pohjatStore.state.projects = mockPohjaPerusteet();
  const ulkopuolisetStore = mock(UlkopuolisetStore);
  ulkopuolisetStore.state.tyoryhmat = mockTyoryhmat();
  const perusteprojektiStore = mock(PerusteprojektiStore);
  perusteprojektiStore.addPerusteprojekti = jest.fn(async () => {
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
        localVue,
        mocks: {
          $t: x => x,
          $kaanna: x => x,
          $sdt: x => x,
          $sd: x => x,
          $router: router,
        },
        stubs: {
          fas: '<div />',
        },
      });
  }

  test('Renders first step text', async () => {
    const wrapper = mountWrapper({});

    expect(wrapper.text()).toContain('pohjan-valinta');
    expect(wrapper.text()).toContain('projektin-tiedot');

    expect(wrapper.text()).toContain('kayta-pohjana');
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(2);
    expect(wrapper.findAll('[type="radio"] + label').at(0)
      .text()).toContain('toista-pohjaa');
    expect(wrapper.findAll('[type="radio"] + label').at(1)
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

    wrapper.findAll('button').at(0)
      .trigger('click');

    await delay();

    expect(currentRoute.name).toBe('pohjat');
  });

  test('Renders second step after press', async () => {
    const wrapper = mountWrapper({});

    expect(wrapper.text()).toContain('kayta-pohjana');
    wrapper.find('button.btn-primary').trigger('click');
    expect(wrapper.text()).not.toContain('kayta-pohjana');

    expect(wrapper.text()).toContain('projektin-nimi-label');
    expect(wrapper.text()).toContain('perustetyoryhma');
    expect(wrapper.text()).toContain('koulutus-tutkintotyyppi');

    expect(wrapper.findAll('button.btn-primary div').at(0)
      .text()).toContain('luo-perustepohja');
  });

  test('Renders second step after press and goes back', async () => {
    const wrapper = mountWrapper({});

    expect(wrapper.text()).toContain('kayta-pohjana');
    wrapper.find('button.btn-primary').trigger('click');
    expect(wrapper.text()).not.toContain('kayta-pohjana');
    wrapper.findAll('button').at(1)
      .trigger('click');
    expect(wrapper.text()).toContain('kayta-pohjana');
  });

  test('Renders second step and uses validations', async () => {
    let currentRoute;
    const wrapper = mountWrapper({}, {
      async push(route: any) {
        currentRoute = route;
      },
    });

    wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.find('button.btn-primary[disabled]')).toBeDefined();

    wrapper.find('input[placeholder="kirjoita-projektin-nimi"]').setValue('nimi');
    wrapper.findAll('.multiselect__element').at(0)
      .find('.multiselect__option')
      .trigger('click');
    wrapper.findAll('.multiselect__element').at(5)
      .find('.multiselect__option')
      .trigger('click');

    expect(wrapper.findAll('button.btn-primary[disabled]')).toHaveLength(0);
    expect(wrapper.findAll('button.btn-primary')).toHaveLength(1);

    wrapper.findAll('button.btn-primary').trigger('click');

    expect(perusteprojektiStore.addPerusteprojekti).toHaveBeenCalled();
    await delay();

    expect(currentRoute.name).toBe('perusteprojekti');
    expect(currentRoute.params.projektiId).toBe('1');
  });
});
