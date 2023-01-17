import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { required } from 'vuelidate/lib/validators';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

interface KotoOpintoStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class KotoOpintoStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  private static config: KotoOpintoStoreConfig;

  public static install(vue: typeof Vue, config: KotoOpintoStoreConfig) {
    KotoOpintoStore.config = config;
  }

  constructor(
    public perusteId?: number,
    public kotoOpintoId?: number,
    public versionumero?: number,
  ) {
    super(perusteId, kotoOpintoId, versionumero, KotoOpintoStore.config);
  }

  public async load() {
    return this.fetchPerusteenOsat();
  }

  public readonly validator = computed(() => {
    return {
      nimiKoodi: {
        nimi: required,
      },
    };
  });

  getOsanType() {
    return 'koto_opinto';
  }
}
