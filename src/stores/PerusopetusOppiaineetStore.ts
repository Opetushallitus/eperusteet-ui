import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import _ from 'lodash';
import { PerusopetuksenPerusteenSisalto, OppiaineSuppeaDto } from '@shared/api/eperusteet';

Vue.use(VueCompositionApi);

export class PerusopetusOppiaineetStore {
  constructor(private perusteId: number) {
    this.fetch();
  }

  public state = reactive({
    oppiaineet: null as OppiaineSuppeaDto[] | null,
  })

  public readonly oppiaineet = computed(() => this.state.oppiaineet);

  public async fetch() {
    this.state.oppiaineet = (await PerusopetuksenPerusteenSisalto.getPerusopetusOppiaineet(this.perusteId)).data;
  }
}
