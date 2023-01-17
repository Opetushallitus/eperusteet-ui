import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { required } from 'vuelidate/lib/validators';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

interface LaajaalainenOsaaminenStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class LaajaalainenOsaaminenStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  private static config: LaajaalainenOsaaminenStoreConfig;

  public static install(vue: typeof Vue, config: LaajaalainenOsaaminenStoreConfig) {
    LaajaalainenOsaaminenStore.config = config;
  }

  constructor(
    public perusteId: number,
    public laajaalainenosaaminenId: number,
    public versionumero?: number,
  ) {
    super(perusteId, laajaalainenosaaminenId, versionumero, LaajaalainenOsaaminenStore.config);
  }

  public async load() {
    return this.fetchPerusteenOsat();
  }

  public readonly validator = computed(() => {
    return {
      nimiKoodi: { required },
    };
  });

  getOsanType() {
    return 'laajaalainenosaaminen';
  }
}
