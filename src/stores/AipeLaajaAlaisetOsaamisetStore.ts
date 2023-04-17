import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Aipeopetuksensisalto, LaajaalainenOsaaminenDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';

export class AipeLaajaAlaisetOsaamisetStore implements IEditoitava {
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
    return { laajaAlaisetOsaamiset: (await Aipeopetuksensisalto.getAipeOsaamiset(this.perusteId)).data };
  }

  async save(data: any) {
    await Aipeopetuksensisalto.updateLaajaalaisetJarjestys(this.perusteId, data.laajaAlaisetOsaamiset);
    await this.perusteStore.updateNavigation();
  }
}
