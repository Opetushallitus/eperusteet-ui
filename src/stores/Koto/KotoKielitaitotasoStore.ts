import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { required } from 'vuelidate/lib/validators';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

interface KotoKielitaitotasoStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class KotoKielitaitotasoStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  private static config: KotoKielitaitotasoStoreConfig;

  public static install(vue: typeof Vue, config: KotoKielitaitotasoStoreConfig) {
    KotoKielitaitotasoStore.config = config;
  }

  constructor(
    public perusteId?: number,
    public kotokielitaitotasoId?: number,
    public versionumero?: number,
  ) {
    super(perusteId, kotokielitaitotasoId, versionumero, KotoKielitaitotasoStore.config);
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
    return 'koto_kielitaitotaso';
  }
}
