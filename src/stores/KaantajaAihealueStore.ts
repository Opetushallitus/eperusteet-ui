import { computed } from 'vue';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import _ from 'lodash';
import { AbstractPerusteenOsaViiteStore } from './AbstractPerusteenOsaViiteStore';
import { requiredOneLang } from '@shared/validators/required';
import { helpers } from '@vuelidate/validators';

export class KaantajaAihealueStore extends AbstractPerusteenOsaViiteStore {
  public async load(supportDataProvider) {
    const data = await this.fetchPerusteenOsat();
    const viiteLapsilla = (await Perusteenosat.getPerusteenOsaViiteLapsilla(this.perusteId!, this.perusteenOsaViiteId!)).data;
    supportDataProvider({ paaAlueet: _.filter(viiteLapsilla.lapset, lapsi => _.get(lapsi.perusteenOsa, 'osanTyyppi') === 'kaantajaaihealue') });
    return data;
  }

  public readonly validator = computed(() => {
    return {
      nimi: {
        ...requiredOneLang(),
      },
      kategoriat: {
        $each: helpers.forEach({
          nimi: {
            ...requiredOneLang(),
          },
        }),
      },
    };
  });

  public getOsanType() {
    return 'kaantajaaihealue';
  }

  public async create(tekstikappaleIsa) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: 'kaantajaaihealue',
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        KaantajaAihealueStore.config.perusteStore.perusteId.value as number,
        KaantajaAihealueStore.config.perusteStore.perusteSuoritustapa.value as any,
        perusteenOsa,
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        KaantajaAihealueStore.config.perusteStore.perusteId.value as number,
        KaantajaAihealueStore.config.perusteStore.perusteSuoritustapa.value as any,
        tekstikappaleIsa.id,
        perusteenOsa,
      ));

      return tallennettu.data;
    }
  }
}

