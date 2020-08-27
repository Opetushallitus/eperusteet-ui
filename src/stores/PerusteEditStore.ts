import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Perusteet } from '@shared/api/eperusteet';
import { required } from 'vuelidate/lib/validators';

export class PerusteEditStore implements IEditoitava {
  constructor(
    private projektiId: number,
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
    const res = await Perusteet.getPerusteenTiedot(this.perusteId);
    return res.data;
  }

  async save(data: any) {
    const res = await Perusteet.updatePeruste(this.perusteId, data);
    return res.data;
  }

  async preview() {
    return null;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  public readonly validator = computed(() => {
    return {
      nimi: {
        required,
      },
    };
  });
}
