import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Tapahtuma } from '@shared/utils/aikataulu';
import { PerusteDto, Aikataulut } from '@shared/api/eperusteet';

export const useAikatauluStore = defineStore('aikataulu', () => {
  // State
  const aikataulutapahtumat = ref<Tapahtuma[] | null>(null);
  const peruste = ref<PerusteDto | null>(null);

  // Getters
  const getAikataulutapahtumat = computed(() => peruste.value?.perusteenAikataulut);
  const getPeruste = computed(() => peruste.value);

  // Actions
  function clear() {
    aikataulutapahtumat.value = null;
  }

  async function init(perusteParam: PerusteDto) {
    peruste.value = perusteParam;
  }

  async function saveAikataulut(aikataulut: any) {
    if (!peruste.value?.id) {
      throw new Error('Peruste not initialized');
    }

    const tallennetut = await Aikataulut.updatePerusteenAikataulut(peruste.value.id, aikataulut);
    peruste.value = {
      ...peruste.value,
      perusteenAikataulut: tallennetut.data,
    };
  }

  return {
    // State
    aikataulutapahtumat,
    peruste,
    // Getters
    getAikataulutapahtumat,
    getPeruste,
    // Actions
    clear,
    init,
    saveAikataulut,
  };
});
