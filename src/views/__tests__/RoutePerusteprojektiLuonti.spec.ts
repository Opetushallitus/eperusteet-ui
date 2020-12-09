import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils';
import RoutePerusteprojektiLuonti from '../RoutePerusteprojektiLuonti.vue';
import BootstrapVue from 'bootstrap-vue';
import _ from 'lodash';
import { mock } from '@/utils/tests';
import { mockTyoryhmat, mockPerusteet } from './data';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteprojektiDto } from '@shared/api/eperusteet';
import { delay } from '@shared/utils/delay';
import Vuelidate from 'vuelidate';

describe('RoutePohjatLuonti component', () => {
  const localVue = createLocalVue();
  localVue.use(BootstrapVue);
  localVue.use(Vuelidate);

  const ulkopuolisetStore = mock(UlkopuolisetStore);
  ulkopuolisetStore.state.tyoryhmat = mockTyoryhmat();
  const perusteprojektiStore = mock(PerusteprojektiStore);
  perusteprojektiStore.state.pohjat = mockPerusteet();
  perusteprojektiStore.state.perusteet = mockPerusteet();
  perusteprojektiStore.addPerusteprojekti = jest.fn(async () => {
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
        localVue,
        mocks: {
          $t: x => x,
          $kaanna: x => x,
          $sdt: x => x,
          $sd: x => x,
          $router: router,
          $isAdmin: () => true,
        },
        stubs: {
          fas: '<div />',
        },
        attachToDocument: true,
      });
  }

  test('Renders first step text', async () => {
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

  test('Projektin luonti canceled', async () => {
    let currentRoute;
    const wrapper = mountWrapper({}, {
      async push(route: any) {
        currentRoute = route;
      },
    });

    wrapper.findAll('button').at(0)
      .trigger('click');

    await delay();

    expect(currentRoute.name).toBe('perusteprojektit');
  });

  test.skip('Saves new projekti and routes to perusteprojekti', async () => {
    let currentRoute;
    const wrapper = mountWrapper({}, {
      async push(route: any) {
        currentRoute = route;
      },
    });

    wrapper.findAll('input[type="radio"]').at(3)
      .trigger('click');

    wrapper.find('button.btn-primary').trigger('click');
    expect(wrapper.vm.$data.currentStep.key).toBe('tiedot');

    expect(wrapper.findAll('button.btn-primary[disabled]')).toHaveLength(1);

    wrapper.find('input[placeholder="kirjoita-projektin-nimi"]').setValue('projektinnimi1');
    wrapper.find('input[placeholder="kirjoita-projektin-diaarinumero"]').setValue('diaarinumero1');

    wrapper.findAll('.multiselect').at(0)
      .findAll('.multiselect__element')
      .at(0)
      .find('.multiselect__option')
      .trigger('click');

    wrapper.findAll('.multiselect').at(1)
      .findAll('.multiselect__element')
      .at(0)
      .find('.multiselect__option')
      .trigger('click');

    expect(wrapper.vm.$data.data.nimi).not.toBeNull();
    expect(wrapper.vm.$data.data.diaarinumero).not.toBeNull();
    expect(wrapper.vm.$data.data.koulutustyyppi).not.toBeNull();
    expect(wrapper.vm.$data.data.tyoryhma).not.toBeNull();
    expect(wrapper.vm.$data.currentStep.isValid()).toBe(true);
    await delay();

    expect(wrapper.findAll('button.btn-primary[disabled]')).toHaveLength(0);
    expect(wrapper.findAll('button.btn-primary')).toHaveLength(1);

    wrapper.findAll('button.btn-primary').trigger('click');
    expect(wrapper.vm.$data.currentStep.key).toBe('aikataulu');

    expect(wrapper.vm.$data.currentStep.isValid()).toBe(false);

    wrapper.findAll('.b-form-datepicker > button').at(0)
      .trigger('click');

    await localVue.nextTick();
    await delay();

    wrapper.findAll('.b-form-datepicker .b-calendar-grid-body .row .rounded-circle').at(0)
      .trigger('click');

    expect(wrapper.vm.$data.currentStep.isValid()).toBe(true);

    expect(wrapper.findAll('button.btn-primary[disabled]')).toHaveLength(0);
    expect(wrapper.findAll('button.btn-primary'))
      .toHaveLength(1);

    wrapper.findAll('button.btn-primary').trigger('click');
    expect(wrapper.vm.$data.currentStep.key).toBe('yhteenveto');

    wrapper.findAll('button.btn-primary').trigger('click');

    expect(perusteprojektiStore.addPerusteprojekti).toHaveBeenCalled();
    await delay();

    expect(currentRoute.name).toBe('perusteprojekti');
    expect(currentRoute.params.projektiId).toBe('1');
  });
});
