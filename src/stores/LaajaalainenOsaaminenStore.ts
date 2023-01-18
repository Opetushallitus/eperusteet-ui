import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { required } from 'vuelidate/lib/validators';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

export class LaajaalainenOsaaminenStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  constructor(
    public perusteId: number,
    public laajaalainenosaaminenId: number,
    public versionumero?: number,
  ) {
    super(perusteId, laajaalainenosaaminenId, versionumero);
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
