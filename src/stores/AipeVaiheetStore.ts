import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Aipeopetuksensisalto, LaajaalainenOsaaminenDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';

export class AipeVaiheetStore implements IEditoitava {
  constructor(
    private perusteId: number,
    private perusteStore: PerusteStore,
  ) {
  }

  async acquire() {
    return null;
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    return { vaiheet: (await Aipeopetuksensisalto.getVaiheet(this.perusteId)).data };
  }

  async save(data: any) {
    await Aipeopetuksensisalto.updateVaiheetJarjestys(this.perusteId, data.vaiheet);
    await this.perusteStore.updateNavigation();
  }
}
