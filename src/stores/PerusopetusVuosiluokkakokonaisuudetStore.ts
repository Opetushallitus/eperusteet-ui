import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';

import _ from 'lodash';
import { PerusopetuksenPerusteenSisalto, VuosiluokkaKokonaisuusDto } from '@shared/api/eperusteet';

Vue.use(VueCompositionApi);

export class PerusopetusVuosiluokkakokonaisuudetStore {
  constructor(private perusteId: number) {
    this.fetch();
  }

  public state = reactive({
    vuosiluokkakokonaisuudet: null as VuosiluokkaKokonaisuusDto[] | null,
  })

  public readonly vuosiluokkakokonaisuudet = computed(() => this.state.vuosiluokkakokonaisuudet);

  public async fetch() {
    this.state.vuosiluokkakokonaisuudet = (await PerusopetuksenPerusteenSisalto.getVuosiluokkaKokonaisuudet(this.perusteId)).data;
  }
}
