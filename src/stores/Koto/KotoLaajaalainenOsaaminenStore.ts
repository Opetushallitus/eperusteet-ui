import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

export class KotoLaajaalainenOsaaminenStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  constructor(
    public perusteId?: number,
    public kotoLaajaalainenOsaaminenId?: number,
    public versionumero?: number,
  ) {
    super(perusteId, kotoLaajaalainenOsaaminenId, versionumero);
  }

  public async load() {
    return this.fetchPerusteenOsat();
  }

  getOsanType() {
    return 'koto_laajaalainenosaaminen';
  }
}
