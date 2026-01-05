import { computed } from 'vue';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import _ from 'lodash';
import { AbstractPerusteenOsaViiteStore } from './AbstractPerusteenOsaViiteStore';
import { requiredOneLang } from '@shared/validators/required';
import { helpers, required } from '@vuelidate/validators';

export class KaantajaTodistusmalliStore extends AbstractPerusteenOsaViiteStore {
  public async load(supportDataProvider) {
    const data = await this.fetchPerusteenOsat();
    const viiteLapsilla = (await Perusteenosat.getPerusteenOsaViiteLapsilla(this.perusteId!, this.perusteenOsaViiteId!)).data;
    supportDataProvider({ paaAlueet: _.filter(viiteLapsilla.lapset, lapsi => _.get(lapsi.perusteenOsa, 'osanTyyppi') === 'kaantajatodistusmalli') });
    return data;
  }

  public readonly validator = computed(() => {
    const taitotasoValidator = {
      $each: helpers.forEach({
        taitotaso: {
          required,
        },
      }),
    };

    return {
      nimi: {
        ...requiredOneLang(),
      },
      ylintaso: {
        taitotasot: taitotasoValidator,
      },
      keskitaso: {
        taitotasot: taitotasoValidator,
      },
      perustaso: {
        taitotasot: taitotasoValidator,
      },
    };
  });

  public getOsanType() {
    return 'kaantajatodistusmalli';
  }

  public async create(tekstikappaleIsa) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: 'kaantajatodistusmalli',
        ylintaso: {},
        keskitaso: {},
        perustaso: {},
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        KaantajaTodistusmalliStore.config.perusteStore.perusteId.value as number,
        KaantajaTodistusmalliStore.config.perusteStore.perusteSuoritustapa.value as any,
        perusteenOsa,
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        KaantajaTodistusmalliStore.config.perusteStore.perusteId.value as number,
        KaantajaTodistusmalliStore.config.perusteStore.perusteSuoritustapa.value as any,
        tekstikappaleIsa.id,
        perusteenOsa,
      ));

      return tallennettu.data;
    }
  }
}

