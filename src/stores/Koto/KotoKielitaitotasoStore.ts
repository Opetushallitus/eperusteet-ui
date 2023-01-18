import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { required } from 'vuelidate/lib/validators';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

export class KotoKielitaitotasoStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  constructor(
    public perusteId?: number,
    public kotokielitaitotasoId?: number,
    public versionumero?: number,
  ) {
    super(perusteId, kotokielitaitotasoId, versionumero);
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
