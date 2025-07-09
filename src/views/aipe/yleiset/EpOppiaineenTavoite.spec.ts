import { mount, shallowMount } from '@vue/test-utils';
import EpOppiaineenTavoite from '@/views/aipe/yleiset/EpOppiaineenTavoite.vue';
import VueI18n from 'vue-i18n';
import { Kielet } from '@shared/stores/kieli';
import { mock, mocks } from '@shared/utils/jestutils';
import { globalStubs } from '../../../../eperusteet-frontend-utils/vue/src/utils/__tests__/stubs';
import { nextTick } from 'vue';

describe('EpOppiaineenTavoite', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(EpOppiaineenTavoite, {
      global: {
        ...globalStubs,
      },
      propsData: {
        modelValue: {
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
          laajaAlaisetOsaamiset: [],
          sisaltoalueet: [],
        },
        isEditing: true,
      },
    });
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('displays the correct title for "tavoitteen-nimi" when isEditing is true', () => {
    const title = wrapper.find('.mt-4');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('tavoitteen-nimi');
  });

  it('displays "ei-asetettu" when kohdealue is null and isEditing is false', async () => {
    wrapper.setProps({
      modelValue: {
        ...wrapper.props().modelValue,
        kohdealue: null,
      },
      isEditing: false,
    });

    await nextTick();

    const kohdealue = wrapper.find('.disabled-text');
    expect(kohdealue.exists()).toBe(true);
    expect(kohdealue.text()).toBe('ei-asetettu');
  });

  it.skip('displays the correct dropdown item label', () => {
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

  it.skip('emits the "laaja-alainen-osaaminen-lisatty" event when clicking the dropdown item button', async () => {
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
