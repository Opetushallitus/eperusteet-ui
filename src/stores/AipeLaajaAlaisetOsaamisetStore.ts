import { computed } from 'vue';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Aipeopetuksensisalto } from '@shared/api/eperusteet';
import { requiredOneLang } from '@shared/validators/required';
import { PerusteStore } from './PerusteStore';

export class AipeLaajaAlaisetOsaamisetStore implements IEditoitava {
  constructor(
    private perusteId: number,
    private perusteStore: PerusteStore,
  ) {
  }

  async acquire() {
    return null;
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    return { laajaAlaisetOsaamiset: (await Aipeopetuksensisalto.getAipeOsaamiset(this.perusteId)).data };
  }

  async save(data: any) {
    await Aipeopetuksensisalto.updateLaajaalaisetJarjestys(this.perusteId, data.laajaAlaisetOsaamiset);
    await this.perusteStore.updateNavigation();
  }

  public readonly validator = computed(() => {
    return {
      laajaAlaisetOsaamiset: {
        $each: {
          nimi: requiredOneLang(),
        },
      },
    };
  });
}
