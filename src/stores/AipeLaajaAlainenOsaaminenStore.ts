import { defineStore } from 'pinia';
import { ref } from 'vue';
import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Aipeopetuksensisalto, LaajaalainenOsaaminenDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { usePerusteStore } from './PerusteStore';
import { useRouter } from 'vue-router';

export const useAipeLaajaAlainenOsaaminenStore = defineStore('aipeLaajaAlainenOsaaminen', () => {
  // State
  const perusteId = ref<number | null>(null);
  const laoId = ref<number | null>(null);
  const router = useRouter();

  // Actions
  function initialize(perusteIdParam: number, laoIdParam: number | null) {
    perusteId.value = perusteIdParam;
    laoId.value = laoIdParam;
  }

  async function acquire() {
    return null;
  }

  async function editAfterLoad() {
    return !laoId.value;
  }

  async function load() {
    if (laoId.value) {
      return (await Aipeopetuksensisalto.getAipeOsaaminen(perusteId.value!, laoId.value)).data;
    }

    return {};
  }

  async function save(data: any) {
    const perusteStore = usePerusteStore();

    if (laoId.value) {
      await Aipeopetuksensisalto.updateAipeOsaaminen(perusteId.value!, laoId.value, data);
      await perusteStore.updateNavigation();
    }
    else {
      const lao = (await Aipeopetuksensisalto.addAipeOsaaminen(perusteId.value!, data)).data;
      laoId.value = lao.id!;
      await perusteStore.updateNavigation();
      await EditointiStore.cancelAll();
      router.push({ name: 'aipelaajaAlainenOsaaminen', params: { laoId: lao.id } });
    }
  }

  async function remove() {
    const perusteStore = usePerusteStore();

    if (laoId.value) {
      await Aipeopetuksensisalto.deleteAipeOsaaminen(perusteId.value!, laoId.value);
      await perusteStore.updateNavigation();
      router.push({ name: 'aipeLaajaAlaisetOsaamiset' });
    }
  }

  // Create an IEditoitava instance
  const editoitava: IEditoitava = {
    acquire,
    editAfterLoad,
    load,
    save,
    remove,
  };

  return {
    // State
    perusteId,
    laoId,

    // Actions
    initialize,
    acquire,
    editAfterLoad,
    load,
    save,
    remove,

    // IEditoitava interface implementation
    editoitava,
  };
});
