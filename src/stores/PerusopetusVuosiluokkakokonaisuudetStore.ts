import { reactive, computed } from 'vue';

import _ from 'lodash';
import { PerusopetuksenPerusteenSisalto, VuosiluokkaKokonaisuusDto } from '@shared/api/eperusteet';

export class PerusopetusVuosiluokkakokonaisuudetStore {
  constructor(private perusteId: number) {
    this.fetch();
  }

  public state = reactive({
    vuosiluokkakokonaisuudet: null as VuosiluokkaKokonaisuusDto[] | null,
  });

  public readonly vuosiluokkakokonaisuudet = computed(() => this.state.vuosiluokkakokonaisuudet);

  public async fetch() {
    this.state.vuosiluokkakokonaisuudet = (await PerusopetuksenPerusteenSisalto.getVuosiluokkaKokonaisuudet(this.perusteId)).data;
  }
}
