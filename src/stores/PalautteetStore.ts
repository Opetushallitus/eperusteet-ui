import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import * as _ from 'lodash';
import { Api, PalauteDto, Palautteet } from '@shared/api/eperusteet';

Vue.use(VueCompositionApi);
export class PalautteetStore {
  public state = reactive({
    palautteet: null as PalauteDto[] | null,
  })

  public readonly palautteet = computed(() => this.state.palautteet);

  public async fetch() {
    let request;
    const origin = window.location.origin;

    if (_.includes(origin, 'localhost')) {
      request = Palautteet.palautteet();
    }
    else {
      request = Api.request({
        method: 'GET',
        url: `${window.location.origin}/palaute/api/palaute?q=eperusteet`,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    this.state.palautteet = (((await request).data as unknown) as PalauteDto[]);
  }
}
