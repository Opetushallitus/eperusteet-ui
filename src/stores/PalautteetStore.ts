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
    const origin = window.location.origin;

    if (_.includes(origin, 'localhost')) {
      this.state.palautteet = (((await Palautteet.palautteet()).data as unknown) as PalauteDto[]); ;
    }
    else {
      const request = Api.request({
        method: 'GET',
        url: `${window.location.origin}/palaute/api/palaute?q=eperusteet`,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const palautteetObject = ((await request).data as unknown) as any[][];
      this.state.palautteet = _.map(palautteetObject, row => {
        return {
          'created-at': row[0],
          stars: row[1],
          feedback: row[3],
        } as PalauteDto;
      });
    }
  }
}
