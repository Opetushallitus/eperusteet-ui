import { computed } from 'vue';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import _ from 'lodash';
import { AbstractPerusteenOsaViiteStore } from './AbstractPerusteenOsaViiteStore';
import { requiredOneLang } from '@shared/validators/required';
import { helpers, required } from '@vuelidate/validators';

export class KaantajaTaitotasokuvausStore extends AbstractPerusteenOsaViiteStore {
  public async load(supportDataProvider) {
    const data = await this.fetchPerusteenOsat();
    const viiteLapsilla = (await Perusteenosat.getPerusteenOsaViiteLapsilla(this.perusteId!, this.perusteenOsaViiteId!)).data;
    supportDataProvider({ paaAlueet: _.filter(viiteLapsilla.lapset, lapsi => _.get(lapsi.perusteenOsa, 'osanTyyppi') === 'kaantajataitotasokuvaus') });
    return data;
  }

  public readonly validator = computed(() => {
    return {
      nimi: {
        ...requiredOneLang(),
      },
      tutkintotasot: {
        $each: helpers.forEach({
          nimi: {
            ...requiredOneLang(),
          },
          osat: {
            $each: helpers.forEach({
              suorituksenOsa: {
                required,
              },
              taitotasot: {
                $each: helpers.forEach({
                  taitotaso: {
                    required,
                  },
                }),
              },
            }),
          },
        }),
      },
    };
  });

  public getOsanType() {
    return 'kaantajataitotasokuvaus';
  }

  public async create(tekstikappaleIsa) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: 'kaantajataitotasokuvaus',
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        KaantajaTaitotasokuvausStore.config.perusteStore.perusteId.value as number,
        KaantajaTaitotasokuvausStore.config.perusteStore.perusteSuoritustapa.value as any,
        perusteenOsa,
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        KaantajaTaitotasokuvausStore.config.perusteStore.perusteId.value as number,
        KaantajaTaitotasokuvausStore.config.perusteStore.perusteSuoritustapa.value as any,
        tekstikappaleIsa.id,
        perusteenOsa,
      ));

      return tallennettu.data;
    }
  }
}

