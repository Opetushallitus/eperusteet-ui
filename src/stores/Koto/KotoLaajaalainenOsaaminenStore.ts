import { PerusteStore } from '@/stores/PerusteStore';
import VueRouter from 'vue-router';
import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

interface KotoLaajaalainenOsaaminenStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class KotoLaajaalainenOsaaminenStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  private static config: KotoLaajaalainenOsaaminenStoreConfig;

  public static install(vue: typeof Vue, config: KotoLaajaalainenOsaaminenStoreConfig) {
    KotoLaajaalainenOsaaminenStore.config = config;
  }

  constructor(
    public perusteId?: number,
    public kotoLaajaalainenOsaaminenId?: number,
    public versionumero?: number,
  ) {
    super(perusteId, kotoLaajaalainenOsaaminenId, versionumero, KotoLaajaalainenOsaaminenStore.config);
  }

  public async load() {
    return this.fetchPerusteenOsat();
  }

  getOsanType() {
    return 'koto_laajaalainenosaaminen';
  }
}
