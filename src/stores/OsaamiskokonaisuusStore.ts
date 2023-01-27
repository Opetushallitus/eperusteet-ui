import { PerusteStore } from '@/stores/PerusteStore';
import VueRouter from 'vue-router';
import Vue from 'vue';
import VueCompositionApi, { computed, reactive } from '@vue/composition-api';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import _ from 'lodash';
import { Revision } from '@shared/tyypit';
import { requiredOneLang } from '@shared/validators/required';
import { AbstractPerusteenOsaViiteStore } from './AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

export class OsaamiskokonaisuusStore extends AbstractPerusteenOsaViiteStore {
  public async load(supportDataProvider) {
    const data = await this.fetchPerusteenOsat();
    const viiteLapsilla = (await Perusteenosat.getPerusteenOsaViiteLapsilla(this.perusteId!, this.perusteenOsaId.value!)).data;
    supportDataProvider({ paaAlueet: _.filter(viiteLapsilla.lapset, lapsi => _.get(lapsi.perusteenOsa, 'osanTyyppi') === 'osaamiskokonaisuus_paa_alue') });
    return data;
  }

  public readonly validator = computed(() => {
    return {
      nimi: {
        ...requiredOneLang(),
      },
    };
  });

  public getOsanType() {
    return 'osaamiskokonaisuus';
  }

  public async create(tekstikappaleIsa) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: 'osaamiskokonaisuus',
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        OsaamiskokonaisuusStore.config.perusteStore.perusteId.value!,
        OsaamiskokonaisuusStore.config?.perusteStore.perusteSuoritustapa.value!,
        perusteenOsa
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        OsaamiskokonaisuusStore.config.perusteStore.perusteId.value!,
        OsaamiskokonaisuusStore.config?.perusteStore.perusteSuoritustapa.value!,
        tekstikappaleIsa.id,
        perusteenOsa
      ));

      return tallennettu.data;
    }
  }
}
