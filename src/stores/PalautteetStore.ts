import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import * as _ from 'lodash';
import { Api, PalauteDto, Palautteet, PalauteDtoStatusEnum } from '@shared/api/eperusteet';
import { ITPalauteProvider, Palaute } from '@shared/stores/types';
import { EperusteetPalautekanava } from '@shared/tyypit';

interface PalauteUpdateDto extends PalauteDto {
  updating?: boolean;
}

Vue.use(VueCompositionApi);
export class PalautteetStore implements ITPalauteProvider {
  public state = reactive({
    palautteet: {} as {[key: string]: PalauteUpdateDto[] | null} | null,
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
      const palauteStatukset = _.keyBy((await Palautteet.palauteStatukset(palautekanava)).data, palaute => this.palauteKey(palaute));

      if (_.includes(origin, 'localhost')) {
        this.state.palautteet![palautekanava] = (((await Palautteet.palautteet(palautekanava)).data as unknown) as PalauteUpdateDto[]);
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
            key: palautekanava,
          } as PalauteUpdateDto;
        });
      }

      this.state.palautteet![palautekanava] = _.map(this.state.palautteet![palautekanava], palaute => {
        return {
          ...palaute,
          status: palauteStatukset[this.palauteKey(palaute as PalauteDto)]?.status || PalauteDtoStatusEnum.SAAPUNUT,
        };
      });
    }));
  }

  private palauteKey(palaute: PalauteDto) {
    return palaute.key! + (palaute['created_at'] || palaute['created-at']) + palaute.stars;
  }

  async sendPalaute(palaute: PalauteDto) {
    palaute.key = EperusteetPalautekanava.eperusteet;
    await Palautteet.sendPalaute(palaute);
  }

  async updatePalaute(updatePalaute: PalauteDto) {
    this.setPalaute({
      ...updatePalaute,
      updating: true,
    });
    const updated = (await Palautteet.updatePalaute(updatePalaute)).data;
    this.setPalaute({
      ...updatePalaute,
      updating: false,
    });
  }

  private setPalaute(palaute: PalauteUpdateDto) {
    this.state.palautteet![palaute.key!] = _.map(this.state.palautteet![palaute.key!], (oldPalaute: PalauteUpdateDto) => {
      if (this.palauteKey(palaute) === this.palauteKey(oldPalaute)) {
        return palaute;
      }

      return oldPalaute;
    }) as PalauteUpdateDto[];
  }
}
