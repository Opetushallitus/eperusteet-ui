import { computed } from 'vue';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';
import { required } from 'vuelidate/lib/validators';
import { requiredLokalisoituTeksti } from '@shared/validators/required';

export class TaiteenalaStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  constructor(
    public perusteId?: number,
    public taiteenalaId?: number,
    public versionumero?: number,
    public isNew?: boolean,
  ) {
    super(perusteId, taiteenalaId, versionumero);
  }

  getOsanType() {
    return 'taiteenala';
  }

  public async editAfterLoad() {
    return !!this.isNew;
  }

  public readonly validator = computed(() => {
    return {
      koodi: { required },
      teksti: {
        ...requiredLokalisoituTeksti(),
      },
    };
  });
}
