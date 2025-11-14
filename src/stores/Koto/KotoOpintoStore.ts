import { computed } from 'vue';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { required } from '@vuelidate/validators';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

export class KotoOpintoStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  constructor(
    public perusteId?: number,
    public kotoOpintoId?: number,
    public versionumero?: number,
  ) {
    super(perusteId, kotoOpintoId, versionumero);
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
