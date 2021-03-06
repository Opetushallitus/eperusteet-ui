import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Perusteet } from '@shared/api/eperusteet';
import { required } from 'vuelidate/lib/validators';
import { PerusteStore } from './PerusteStore';

export class PerusteEditStore implements IEditoitava {
  constructor(
    private projektiId: number,
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
    const res = await Perusteet.getPerusteenTiedot(this.perusteId);
    return res.data;
  }

  async save(data: any) {
    const res = await Perusteet.updatePeruste(this.perusteId, data);
    await this.perusteStore.updateCurrent();
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
