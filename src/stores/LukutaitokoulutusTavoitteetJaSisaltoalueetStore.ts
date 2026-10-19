import { computed } from 'vue';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { requiredOneLang } from '@shared/validators/required';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

export class LukutaitokoulutusTavoitteetJaSisaltoalueetStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  public async load() {
    return this.fetchPerusteenOsat();
  }

  public readonly validator = computed(() => {
    return {
      nimi: {
        ...requiredOneLang(),
      },
    };
  });

  getOsanType() {
    return 'lukutaitokoulutus_tavoitteetjasisaltoalueet';
  }
}
