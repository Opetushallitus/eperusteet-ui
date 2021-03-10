import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Perusteprojektit, Perusteet } from '@shared/api/eperusteet';
import { required } from 'vuelidate/lib/validators';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { PerusteStore } from './PerusteStore';
import { requiredLokalisoituTeksti } from '@shared/validators/required';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';

export class OpasEditStore implements IEditoitava {
  constructor(
    private projektiId: number,
    private perusteId: number,
    private perusteStore: PerusteStore) {
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

    return {
      ...projekti,
      esikatseluUrl: buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/opas/${_.get(projekti, '_peruste')}`),
    };
  }

  async save(data: any) {
    await Perusteet.updatePeruste(this.perusteId, data.peruste);
    await Perusteprojektit.updatePerusteprojekti(this.projektiId, data);
    await this.perusteStore.updateCurrent();
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
      peruste: {
        nimi: {
          ...requiredLokalisoituTeksti(),
        },
      },
      ryhmaOid: {
        required,
      },
    };
  });
}
