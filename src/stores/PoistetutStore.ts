import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import * as _ from 'lodash';
import { PoistettuSisalto, PoistettuSisaltoDto } from '@shared/api/eperusteet';

Vue.use(VueCompositionApi);

export class PoistetutStore {
  public state = reactive({
    poistetut: null as PoistettuSisaltoDto[] | null,
  });

  public readonly poistetut = computed(() => this.state.poistetut);

  public async init(perusteId) {
    this.state.poistetut = null;
    this.state.poistetut = (await PoistettuSisalto.getPoistetutSisallot(perusteId)).data;
  }

  public async palauta(perusteId, poistettuSisalto: PoistettuSisaltoDto) {
    await PoistettuSisalto.palauta(perusteId, poistettuSisalto.id!);
  }
}
