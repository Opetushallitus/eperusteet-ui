import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import _ from 'lodash';
import { PerusopetuksenPerusteenSisalto, OppiaineSuppeaDto } from '@shared/api/eperusteet';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from './PerusteStore';

Vue.use(VueCompositionApi);

export class PerusopetusOppiaineetStore implements IEditoitava {
  constructor(
    private perusteId: number,
    private perusteStore: PerusteStore) {
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    return { oppiaineet: (await PerusopetuksenPerusteenSisalto.getPerusopetusOppiaineet(this.perusteId)).data };
  }

  async save(data: any) {
    await PerusopetuksenPerusteenSisalto.updateOppiaineJarjestys(this.perusteId, data.oppiaineet);
    await this.perusteStore.updateNavigation();
  }
}
