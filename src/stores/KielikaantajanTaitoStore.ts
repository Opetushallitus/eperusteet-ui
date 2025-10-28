import { computed } from 'vue';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import _ from 'lodash';
import { requiredOneLang } from '@shared/validators/required';
import { AbstractPerusteenOsaViiteStore } from './AbstractPerusteenOsaViiteStore';

export class KielikaantajanTaitoStore extends AbstractPerusteenOsaViiteStore {
  public async load(supportDataProvider) {
    const data = await this.fetchPerusteenOsat();
    const viiteLapsilla = (await Perusteenosat.getPerusteenOsaViiteLapsilla(this.perusteId!, this.perusteenOsaViiteId!)).data;
    supportDataProvider({ paaAlueet: _.filter(viiteLapsilla.lapset, lapsi => _.get(lapsi.perusteenOsa, 'osanTyyppi') === 'kaantajataito') });
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
    return 'kaantajataito';
  }

  public async create(tekstikappaleIsa) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: 'kaantajataito',
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        KielikaantajanTaitoStore.config.perusteStore.perusteId.value as number,
        KielikaantajanTaitoStore.config.perusteStore.perusteSuoritustapa.value as any,
        perusteenOsa,
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        KielikaantajanTaitoStore.config.perusteStore.perusteId.value as number,
        KielikaantajanTaitoStore.config.perusteStore.perusteSuoritustapa.value as any,
        tekstikappaleIsa.id,
        perusteenOsa,
      ));

      return tallennettu.data;
    }
  }
}
