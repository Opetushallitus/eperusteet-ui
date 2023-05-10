import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Lops2019 } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';

export class LukioOppiaineetStore implements IEditoitava {
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
    return { oppiaineet: (await Lops2019.getOppiaineet(this.perusteId)).data };
  }

  async save(data: any) {
    await Lops2019.sortOppiaineet(this.perusteId, data.oppiaineet);
  }
}
