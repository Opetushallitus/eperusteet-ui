import { computed } from 'vue';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { required, requiredIf } from 'vuelidate/lib/validators';
import { koodistoKoodiValidator, requiredOneLang } from '@shared/validators/required';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

export class TavoitesisaltoalueStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  constructor(
    public perusteId: number,
    public tavoitesisaltoalueId: number,
    public versionumero?: number,
  ) {
    super(perusteId, tavoitesisaltoalueId, versionumero);
  }

  public async load() {
    return this.fetchPerusteenOsat();
  }

  public readonly validator = computed(() => {
    return {
      nimiKoodi: {
        nimi: required,
      },
      tavoitealueet: {
        $each: {
          otsikko: {
            required: requiredIf((value) => {
              return value && value.tavoiteAlueTyyppi === 'OTSIKKO';
            }),
          },
          tavoitteet: {
            $each: {
              ...koodistoKoodiValidator(),
            },
          },
          keskeisetSisaltoalueet: {
            $each: {
              ...requiredOneLang(),
            },
          },
        },
      },
    };
  });

  getOsanType() {
    return 'tavoitesisaltoalue';
  }
}
