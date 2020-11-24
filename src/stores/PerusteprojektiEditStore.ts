import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Perusteprojektit } from '@shared/api/eperusteet';
import { required } from 'vuelidate/lib/validators';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { Kielet } from '@shared/stores/kieli';
import { PerusteStore } from './PerusteStore';
import * as _ from 'lodash';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';

export class PerusteprojektiEditStore implements IEditoitava {
  constructor(private projektiId: number, private perusteStore: PerusteStore) {
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

    return {
      ...res.data,
      esikatseluUrl: buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/${koulutustyyppiTheme(this.perusteStore.peruste.value!.koulutustyyppi!)}/${_.get(res.data, '_peruste')}`),
    };
  }

  async save(data: any) {
    const res = await Perusteprojektit.updatePerusteprojekti(this.projektiId, data);
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
