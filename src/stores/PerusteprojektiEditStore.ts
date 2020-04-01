import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Perusteprojektit } from '@shared/api/eperusteet';
import { required } from 'vuelidate/lib/validators';


export class PerusteprojektiEditStore implements IEditoitava {
  constructor(private projektiId: number) {
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
    const res = await Perusteprojektit.getPerusteprojekti(this.projektiId);
    return res.data;
  }

  async save(data: any) {
    const res = await Perusteprojektit.updatePerusteprojekti(this.projektiId, data);
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
    };
  });
}
