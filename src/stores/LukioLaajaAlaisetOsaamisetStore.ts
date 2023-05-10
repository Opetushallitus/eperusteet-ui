import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Lops2019 } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';

export class LukioLaajaAlaisetOsaamisetStore implements IEditoitava {
  constructor(
    private perusteId: number,
  ) {
  }

  async acquire() {
    return null;
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    return (await Lops2019.getLaajaAlainenOsaaminenKokonaisuus(this.perusteId)).data;
  }

  async save(data: any) {
    await Lops2019.updateLaajaAlainenOsaaminenKokonaisuus(this.perusteId, data);
  }
}
