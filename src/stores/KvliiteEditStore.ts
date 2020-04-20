import _ from 'lodash';

import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { computed } from '@vue/composition-api';
import { Perusteet, Arviointiasteikot } from '@shared/api/eperusteet';

export class KvliiteEditStore implements IEditoitava {
  constructor(
    private projektiId: number,
    private perusteId: number,
  ) {
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false;
  }

  async history() {
  }

  async load() {
    const arviointiasteikot = (await Arviointiasteikot.getAll()).data;
    const arviointiasteikotMap = _.mapKeys(arviointiasteikot, value => value.id);

    // EP-1315
    const arviointiasteikko = _.find(arviointiasteikotMap, (aa: any) => {
      return aa.osaamistasot.length === 1;
    });
    if (arviointiasteikko) {
      (arviointiasteikko as any).osaamistasot[0].otsikko = 'kvliiteen-yksiportainen-arviointiasteikko';
    }

    return {
      kvliite: (await Perusteet.getKvLiite(this.perusteId)).data,
      arviointiasteikot: arviointiasteikotMap,
    };
  }

  async save(data: any) {
    return {
      kvliite: (await Perusteet.updateKvLiite(this.perusteId, data.kvliite)).data,
      arviointiasteikot: data.arviointiasteikot,
    };
  }

  async preview() {
    return null;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async remove() {
  }

  async restore() {
  }

  async revisions() {
    return [];
  }

  async start() {
  }

  public readonly validator = computed(() => {
    return {};
  });
}
