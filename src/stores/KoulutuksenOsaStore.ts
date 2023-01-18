import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { required, minValue } from 'vuelidate/lib/validators';
import { translated } from '@shared/validators/required';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

export class KoulutuksenOsaStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  constructor(
    public perusteId: number,
    public koulutuksenosaId: number,
    public versionumero?: number,
  ) {
    super(perusteId, koulutuksenosaId, versionumero);
  }

  public async load() {
    return this.fetchPerusteenOsat();
  }

  public readonly validator = computed(() => {
    const julkaisukielet = KoulutuksenOsaStore.config!.perusteStore.julkaisukielet.value;
    return {
      koulutusOsanKoulutustyyppi: { required },
      koulutusOsanTyyppi: { required },
      nimi: translated(julkaisukielet),
      laajuusMinimi: {
        'min-value': minValue(0),
        required,
      },
      laajuusMaksimi: {
        'min-value': minValue(0),
        required,
      },
    };
  });

  getOsanType() {
    return 'koulutuksenosa';
  }
}
