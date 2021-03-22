import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import * as _ from 'lodash';
import { Api, PalauteDto, Palautteet } from '@shared/api/eperusteet';
import { ITPalauteProvider, Palaute } from '@shared/stores/types';
import { EperusteetPalautekanava } from '@shared/tyypit';

Vue.use(VueCompositionApi);
export class PalautteetStore implements ITPalauteProvider {
  public state = reactive({
    palautteet: {} as {[key: string]: PalauteDto[] | null} | null,
  })

  public readonly palautteet = computed(() => this.state.palautteet);
  public readonly tutkintorakennepalaute = computed(() => false);

  public async fetch() {
    const origin = window.location.origin;
    _.map(Object.values(EperusteetPalautekanava), palautekanava => {
      this.state.palautteet = {
        ...this.state.palautteet,
        [palautekanava]: null,
      };
    });

    await Promise.all(_.map(Object.values(EperusteetPalautekanava), async (palautekanava) => {
      if (_.includes(origin, 'localhost')) {
        this.state.palautteet![palautekanava] = (((await Palautteet.palautteet(palautekanava)).data as unknown) as PalauteDto[]);
      }
      else {
        const request = Api.request({
          method: 'GET',
          url: `${window.location.origin}/palaute/api/palaute?q=${palautekanava}`,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const palautteetObject = ((await request).data as unknown) as any[][];
        this.state.palautteet![palautekanava] = _.map(palautteetObject, row => {
          return {
            'created-at': row[0],
            stars: row[1],
            feedback: row[3],
          } as PalauteDto;
        });
      }
    }));
  }

  async sendPalaute(palaute: Palaute) {
    palaute.key = EperusteetPalautekanava.eperusteet;
    await Palautteet.sendPalaute(palaute);
  }
}
