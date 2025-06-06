import { defineStore } from 'pinia';
import { ref } from 'vue';
import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Aipeopetuksensisalto, LaajaalainenOsaaminenDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { usePerusteStore } from './PerusteStore';

export const useAipeLaajaAlaisetOsaamisetStore = defineStore('aipeLaajaAlaisetOsaamiset', () => {
  // State
  const perusteId = ref<number | null>(null);

  // Actions
  function initialize(perusteIdParam: number) {
    perusteId.value = perusteIdParam;
  }

  async function acquire() {
    return null;
  }

  async function editAfterLoad() {
    return false;
  }

  async function load() {
    return { laajaAlaisetOsaamiset: (await Aipeopetuksensisalto.getAipeOsaamiset(perusteId.value!)).data };
  }

  async function save(data: any) {
    const perusteStore = usePerusteStore();
    await Aipeopetuksensisalto.updateLaajaalaisetJarjestys(perusteId.value!, data.laajaAlaisetOsaamiset);
    await perusteStore.updateNavigation();
  }

  // Create an IEditoitava instance
  const editoitava: IEditoitava = {
    acquire,
    editAfterLoad,
    load,
    save,
  };

  return {
    // State
    perusteId,

    // Actions
    initialize,
    acquire,
    editAfterLoad,
    load,
    save,

    // IEditoitava interface implementation
    editoitava,
  };
});
