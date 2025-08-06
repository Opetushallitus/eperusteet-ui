import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { computed } from 'vue';
import { Perusteprojektit } from '@shared/api/eperusteet';
import { required } from 'vuelidate/lib/validators';
import { PerusteStore } from './PerusteStore';
import * as _ from 'lodash';

export class PerusteprojektiEditStore implements IEditoitava {
  constructor(private projektiId: number, private perusteStore: PerusteStore) {
  }

  async acquire() {
    return null;
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    const res = await Perusteprojektit.getPerusteprojekti(this.projektiId);
    return {
      ...res.data,
      peruste: this.perusteStore.peruste,
    };
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
