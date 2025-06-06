import { defineStore } from 'pinia';
import { ref } from 'vue';
import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Aipeopetuksensisalto, LaajaalainenOsaaminenDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { usePerusteStore } from './PerusteStore';
import { pinia } from './pinia';

export const useAipeVaiheetStore = defineStore('aipeVaiheet', () => {
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
    return { vaiheet: (await Aipeopetuksensisalto.getVaiheet(perusteId.value!)).data };
  }

  async function save(data: any) {
    const perusteStore = usePerusteStore(pinia);
    await Aipeopetuksensisalto.updateVaiheetJarjestys(perusteId.value!, data.vaiheet);
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
