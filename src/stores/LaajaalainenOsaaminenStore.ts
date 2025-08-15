import { computed } from 'vue';
import { required } from '@vuelidate/validators';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

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
