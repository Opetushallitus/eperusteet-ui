import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';

import { PalauteDto, Palautteet } from '@shared/api/eperusteet';

Vue.use(VueCompositionApi);
export class PalautteetStore {
  public state = reactive({
    palautteet: null as PalauteDto[] | null,
  })

  public readonly palautteet = computed(() => this.state.palautteet);

  public async fetch() {
    this.state.palautteet = (((await Palautteet.palautteet()).data as unknown) as PalauteDto[]);
  }
}
