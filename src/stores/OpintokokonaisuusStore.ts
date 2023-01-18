import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { minLength, required } from 'vuelidate/lib/validators';
import { allTranslations, translated } from '@shared/validators/required';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

export class OpintokokonaisuusStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  constructor(
    public perusteId: number,
    public opintokokonaisuusId: number,
    public versionumero?: number,
  ) {
    super(perusteId, opintokokonaisuusId, versionumero);
  }

  public async load() {
    return this.fetchPerusteenOsat();
  }

  public readonly validator = computed(() => {
    const julkaisukielet = OpintokokonaisuusStore.config!.perusteStore.julkaisukielet.value;
    return {
      nimiKoodi: {
        nimi: required,
      },
      kuvaus: allTranslations(julkaisukielet),
      opetuksenTavoiteOtsikko: translated(julkaisukielet),
      opetuksenTavoitteet: {
        'min-length': minLength(1),
        required,
      },
      arvioinnit: {
        'min-length': minLength(1),
        required,
      },
    };
  });

  getOsanType() {
    return 'opintokokonaisuus';
  }
}
