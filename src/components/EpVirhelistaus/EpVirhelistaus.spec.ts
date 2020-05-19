import { mock } from '@/utils/tests';
import { ref, computed, reactive } from '@vue/composition-api';
import { mount, Wrapper, WrapperArray, createLocalVue, RouterLinkStub } from '@vue/test-utils';

import { ArviointiAsteikkoDto, GeneerinenArviointiasteikkoDto, Arviointiasteikot, GeneerinenArviointiasteikko } from '@shared/api/eperusteet';
import EpVirhelistaus from './EpVirhelistaus.vue';
import * as _ from 'lodash';
import { Page } from '@shared/tyypit';
import '@shared/config/bootstrap';
import '@shared/config/fontawesome';

describe('EpVirhelistaus', () => {
  const localVue = createLocalVue();

  test('Mounting', async () => {
    const wrapper = mount(EpVirhelistaus, {
      propsData: {
        validation: {
          infot: [{
            viesti: "kvliite-validointi-arvosana-asteikko",
            perusteprojekti: null,
            lastCheck: null,
            validointi: null,
            nimet: null,
            suoritustapa: null,
            kielet: null,
            validointiKategoria: "MAARITTELEMATON"
          }],
        },
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

    expect(wrapper.text()).toContain('validointi-kategoria-MAARITTELEMATON');
  });
});
