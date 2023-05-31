import { createLocalVue, shallowMount } from '@vue/test-utils';
import EpOppiaineenTavoite from '@/views/aipe/yleiset/EpOppiaineenTavoite.vue';
import VueI18n from 'vue-i18n';
import { Kielet } from '@shared/stores/kieli';
import { mock, mocks } from '@shared/utils/jestutils';
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';

// describe('EpAipeOppiaineenTavoite', () => {
//   const localVue = createLocalVue();
//   localVue.use(VueI18n);
//   localVue.use(Kielet, {
//     messages: {
//       fi: {},
//     },
//   });

//   it('renders correctly', () => {
//     const wrapper = shallowMount(EpAipeOppiaineenTavoite, {
//       localVue,
//       mocks: {
//         ...mocks,
//       },
//       propsData: {
//         value: {
//           tavoite: 'Test goal',
//           tavoitteistaJohdetutOppimisenTavoitteet: 'Test learning goals',
//           kohdealue: {
//             id: 1,
//             nimi: 'Test target area',
//           },
//           laajaAlaisetOsaamiset: [{
//             nimi: 'Test competence',
//             kuvaus: 'Test description',
//           }],
//           arvioinninKuvaus: 'Test assessment description',
//           arvioinninOtsikko: 'Test assessment title',
//           arvioinninkohteet: [{
//             arvosana: 3,
//             osaamisenKuvaus: 'Test competence description',
//             arvionKuvaus: 'Test assessment description',
//           }],
//         },
//         supportData: {
//           kohdealueet: [
//             {
//               id: 1,
//               nimi: 'Test target area',
//             },
//           ],
//         },
//         isEditing: true,
//       },
//     });

//     expect(wrapper.find('h4').text()).toBe('tavoitteen-nimi');
//     expect(wrapper.find('ep-input-stub').props().value).toBe('Test goal');
//     expect(wrapper.findAll('h4').at(1)
//       .text()).toBe('tavoitteista-johdetut-oppimisen-tavoitteet');
//     expect(wrapper.find('ep-content-stub').props().value).toBe('Test learning goals');
//     expect(wrapper.findAll('h4').at(2)
//       .text()).toBe('tavoitealue');
//     // expect(wrapper.find('ep-select-stub').props().value).toEqual({ nimi: 'Test target area' });
//     expect(wrapper.findAll('h4').at(3)
//       .text()).toBe('laaja-alainen-osaaminen');
//     expect(wrapper.find('ep-collapse-stub').exists()).toBe(true);
//     expect(wrapper.findAll('h4').at(4)
//       .text()).toBe('arvioinnin-kohde');
//     expect(wrapper.find('ep-input-stub').props().value).toBe('Test assessment description');
//     expect(wrapper.find('h4').text()).toBe('Test assessment title');
//     expect(wrapper.findAll('.border-bottom-2 b-row').length).toBe(1);
//     expect(wrapper.findAll('.border-bottom-2 b-row b-col').at(0)
//       .find('h5')
//       .text()).toBe('osaamisen-kuvaus');
//     expect(wrapper.findAll('.border-bottom-2 b-row b-col').at(1)
//       .find('h5')
//       .text()).toBe('arvioinnin-kuvaus');
//     expect(wrapper.findAll('.border-bottom-2 b-row').at(1)
//       .find('ep-select-stub')
//       .props().value).toBe(3);
//     expect(wrapper.findAll('.border-bottom-2 b-row').at(1)
//       .findAll('div')
//       .at(1)
//       .text()).toBe('Test competence description');
//     expect(wrapper.findAll('.border-bottom-2 b-row').at(1)
//       .findAll('div')
//       .at(2)
//       .text()).toBe('Test assessment description');
//   });
// });

// describe('EpAipeOppiaineenTavoite', () => {
//   const localVue = createLocalVue();
//   localVue.use(VueI18n);
//   localVue.use(Kielet, {
//     messages: {
//       fi: {},
//     },
//   });
//   let wrapper;

//   beforeEach(() => {
//     wrapper = mount(EpAipeOppiaineenTavoite);
//   });

//   it('renders a component', () => {
//     expect(wrapper.exists()).toBe(true);
//   });

//   it('displays the correct title', () => {
//     expect(wrapper.find('h4').text()).toBe('Tavoitteen nimi');
//   });

//   it('updates the model when the input value changes', async () => {
//     const input = wrapper.find('input[type="text"]');
//     await input.setValue('New value');
//     expect(wrapper.vm.model.tavoite).toBe('New value');
//   });

//   it('displays the correct value when the model changes', async () => {
//     wrapper.setData({ model: { tavoite: 'New value' } });
//     await wrapper.vm.$nextTick();
//     expect(wrapper.find('input[type="text"]').element.value).toBe('New value');
//   });
// });

Vue.use(BootstrapVue);

describe('EpOppiaineenTavoite', () => {
  const localVue = createLocalVue();
  localVue.use(VueI18n);
  localVue.use(Kielet, {
    messages: {
      fi: {},
    },
  });
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(EpOppiaineenTavoite, {
      localVue,
      mocks: {
        ...mocks,
      },
      propsData: {
        value: {
          tavoite: '',
          tavoitteistaJohdetutOppimisenTavoitteet: '',
          kohdealue: null,
          laajaAlaisetOsaamiset: [],
          arvioinninKuvaus: '',
          arvioinninOtsikko: '',
          arvioinninkohteet: [],
        },
        supportData: {
          kohdealueet: [],
        },
        isEditing: true,
      },
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('displays the correct title for "tavoitteen-nimi" when isEditing is true', () => {
    const title = wrapper.find('.mt-4');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('tavoitteen-nimi');
  });

  it('displays "ei-asetettu" when kohdealue is null and isEditing is false', () => {
    wrapper.setProps({
      value: {
        ...wrapper.props().model,
        kohdealue: null,
      },
      isEditing: false,
    });

    const kohdealue = wrapper.find('.disabled-text');
    expect(kohdealue.exists()).toBe(true);
    expect(kohdealue.text()).toBe('ei-asetettu');
  });

  xit('displays the correct dropdown item label', () => {
    wrapper.setData({
      supportData: {
        laajaAlaisetOsaamiset: [
          {
            id: 1,
            nimi: 'Testi',
          },
        ],
      },
      isEditing: true,
    });

    const dropdownItem = wrapper.find('.dropdown-item-button');
    expect(dropdownItem.exists()).toBe(true);
    expect(dropdownItem.text()).toBe('Testi');
  });

  xit('emits the "laaja-alainen-osaaminen-lisatty" event when clicking the dropdown item button', async () => {
    wrapper.setData({
      laajaAlaisetOsaamisetValinnat: [
        {
          nimi: 'Testi',
          valittu: false,
        },
      ],
      isEditing: true,
    });

    const dropdownItem = wrapper.find('.dropdown-item-button');
    await dropdownItem.trigger('click');
    expect(wrapper.emitted('laaja-alainen-osaaminen-lisatty')).toBeTruthy();
  });
});
