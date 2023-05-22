import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Perusteprojektit } from '@shared/api/eperusteet';
import { required } from 'vuelidate/lib/validators';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { Kielet } from '@shared/stores/kieli';
import { PerusteStore } from './PerusteStore';
import * as _ from 'lodash';
import { koulutustyyppiTheme, tyyppiTheme } from '@shared/utils/perusteet';

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
      esikatseluUrl: buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/${this.perusteTheme(this.perusteStore.peruste.value)}/${_.get(res.data, '_peruste')}`),
    };
  }

  perusteTheme(peruste) {
    if (peruste?.koulutustyyppi) {
      return koulutustyyppiTheme(this.perusteStore.peruste.value!.koulutustyyppi!);
    }

    return tyyppiTheme(peruste.tyyppi);
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
