import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { required, minValue } from 'vuelidate/lib/validators';
import { translated } from '@shared/validators/required';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

interface KoulutuksenOsaStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class KoulutuksenOsaStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  private static config: KoulutuksenOsaStoreConfig;

  public static install(vue: typeof Vue, config: KoulutuksenOsaStoreConfig) {
    KoulutuksenOsaStore.config = config;
  }

  constructor(
    public perusteId: number,
    public koulutuksenosaId: number,
    public versionumero?: number,
  ) {
    super(perusteId, koulutuksenosaId, versionumero, KoulutuksenOsaStore.config);
  }

  public async load() {
    return this.fetchPerusteenOsat();
  }

  public readonly validator = computed(() => {
    const julkaisukielet = KoulutuksenOsaStore.config!.perusteStore.julkaisukielet.value;
    return {
      koulutusOsanKoulutustyyppi: { required },
      koulutusOsanTyyppi: { required },
      nimi: translated(julkaisukielet),
      laajuusMinimi: {
        'min-value': minValue(0),
        required,
      },
      laajuusMaksimi: {
        'min-value': minValue(0),
        required,
      },
    };
  });

  getOsanType() {
    return 'koulutuksenosa';
  }
}
