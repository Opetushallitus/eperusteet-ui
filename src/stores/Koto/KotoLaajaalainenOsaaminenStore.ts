import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

export class KotoLaajaalainenOsaaminenStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  constructor(
    public perusteId?: number,
    public kotoLaajaalainenOsaaminenId?: number,
    public versionumero?: number,
  ) {
    super(perusteId, kotoLaajaalainenOsaaminenId, versionumero);
  }

  public async load() {
    return this.fetchPerusteenOsat();
  }

  getOsanType() {
    return 'koto_laajaalainenosaaminen';
  }
}
