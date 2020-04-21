import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Perusteprojektit, Perusteet } from '@shared/api/eperusteet';
import { required } from 'vuelidate/lib/validators';
import * as _ from 'lodash';

export class OpasEditStore implements IEditoitava {
  constructor(private projektiId: number, private perusteId: number) {
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
    const projekti = (await Perusteprojektit.getPerusteprojekti(this.projektiId)).data;
    projekti.peruste = (await Perusteet.getPerusteenTiedot(this.perusteId)).data;
    (projekti.peruste as any).oppaanPerusteet = _.map((projekti.peruste as any).oppaanPerusteet, peruste => {
      return {
        id: peruste.id,
      };
    });

    return projekti;
  }

  async save(data: any) {
    await Perusteet.updatePeruste(this.perusteId, data.peruste);
    await Perusteprojektit.updatePerusteprojekti(this.projektiId, data);

    return data;
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
    return {
      nimi: {
        required,
      },
      ryhmaOid: {
        required,
      },
    };
  });
}
