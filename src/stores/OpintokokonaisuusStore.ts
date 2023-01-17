import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { minLength, required } from 'vuelidate/lib/validators';
import { allTranslations, translated } from '@shared/validators/required';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

interface OpintokokonaisuusStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class OpintokokonaisuusStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  private static config: OpintokokonaisuusStoreConfig;

  public static install(vue: typeof Vue, config: OpintokokonaisuusStoreConfig) {
    OpintokokonaisuusStore.config = config;
  }

  constructor(
    public perusteId: number,
    public opintokokonaisuusId: number,
    public versionumero?: number,
  ) {
    super(perusteId, opintokokonaisuusId, versionumero, OpintokokonaisuusStore.config);
  }

  public async load() {
    return this.fetchPerusteenOsat();
  }

  public readonly validator = computed(() => {
    const julkaisukielet = OpintokokonaisuusStore.config!.perusteStore.julkaisukielet.value;
    return {
      nimiKoodi: {
        nimi: required,
      },
      kuvaus: allTranslations(julkaisukielet),
      opetuksenTavoiteOtsikko: translated(julkaisukielet),
      opetuksenTavoitteet: {
        'min-length': minLength(1),
        required,
      },
      arvioinnit: {
        'min-length': minLength(1),
        required,
      },
    };
  });

  getOsanType() {
    return 'opintokokonaisuus';
  }
}
