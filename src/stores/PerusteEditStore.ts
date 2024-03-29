import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { computed } from '@vue/composition-api';
import { Maaraykset, MaaraysDtoTilaEnum, MaaraysDtoTyyppiEnum, PerusteDtoTilaEnum, Perusteet } from '@shared/api/eperusteet';
import { required } from 'vuelidate/lib/validators';
import { PerusteStore } from './PerusteStore';
import { MaarayksetEditStore } from './MaarayksetEditStore';
import _ from 'lodash';

export class PerusteEditStore implements IEditoitava {
  constructor(
    private projektiId: number,
    private perusteId: number,
    private perusteStore: PerusteStore,
    private postSave: Function,
  ) {
  }

  async acquire() {
    return null;
  }

  async editAfterLoad() {
    return false;
  }

  async load(supportDataProvider) {
    const asiasanat = (await Maaraykset.getAsiasanat()).data;
    supportDataProvider({ asiasanat });

    const peruste = (await Perusteet.getPerusteenTiedot(this.perusteId)).data;
    const maarays = (await Maaraykset.getMaaraysPerusteella(this.perusteId)).data;

    return {
      ...peruste,
      maarays,
    };
  }

  async save(data: any) {
    if (data.maarays?.id) {
      await Maaraykset.updateMaarays(data.maarays.id, data.maarays);
    }

    await Perusteet.updatePeruste(this.perusteId, _.omit(data, 'maarays'));
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
