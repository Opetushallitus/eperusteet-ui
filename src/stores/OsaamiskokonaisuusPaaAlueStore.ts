import { PerusteStore } from '@/stores/PerusteStore';
import VueRouter from 'vue-router';
import { computed, reactive } from 'vue';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import { requiredOneLang } from '@shared/validators/required';
import { AbstractPerusteenOsaViiteStore } from './AbstractPerusteenOsaViiteStore';

export class OsaamiskokonaisuusPaaAlueStore extends AbstractPerusteenOsaViiteStore {
  public readonly validator = computed(() => {
    return {
      nimi: {
        ...requiredOneLang(),
      },
      osaAlueet: {
        $each: {
          nimi: {
            ...requiredOneLang(),
          },
          tasokuvaukset: {
            $each: {
              kuvaukset: {
                $each: {
                  ...requiredOneLang(),
                },
              },
            },
          },
        },
      },
    };
  });

  public getOsanType() {
    return 'osaamiskokonaisuus_paa_alue';
  }

  public static async create(osaamiskokonaisuusId) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: 'osaamiskokonaisuus_paa_alue',
      } as any,
    };

    const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        OsaamiskokonaisuusPaaAlueStore.config.perusteStore.perusteId.value!,
        OsaamiskokonaisuusPaaAlueStore.config?.perusteStore.perusteSuoritustapa.value!,
        osaamiskokonaisuusId,
        perusteenOsa,
    ));

    return tallennettu.data;
  }
}
