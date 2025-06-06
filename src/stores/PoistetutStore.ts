import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { PoistettuSisalto, PoistettuSisaltoDto } from '@shared/api/eperusteet';

export const usePoistetutStore = defineStore('poistetut', () => {
  // State
  const poistetut = ref<PoistettuSisaltoDto[] | null>(null);

  // Getters
  const getPoistetut = computed(() => poistetut.value);

  // Actions
  async function init(perusteId: number) {
    poistetut.value = null;
    poistetut.value = (await PoistettuSisalto.getPoistetutSisallot(perusteId)).data;
  }

  async function palauta(perusteId: number, poistettuSisalto: PoistettuSisaltoDto) {
    await PoistettuSisalto.palauta(perusteId, poistettuSisalto.id!);
  }

  return {
    // State
    poistetut,
    // Getters
    getPoistetut,
    // Actions
    init,
    palauta,
  };
});
