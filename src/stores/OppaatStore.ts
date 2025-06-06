import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Oppaat, OpasLuontiDto, PerusteHakuDto } from '@shared/api/eperusteet';
import _ from 'lodash';
import debounce from 'lodash/debounce';

export const useOppaatStore = defineStore('oppaat', () => {
  // State
  const oppaat = ref<PerusteHakuDto[] | null>(null);

  // Actions
  async function saveOpas(opas: OpasLuontiDto) {
    const res = await Oppaat.addOpas(opas);
    oppaat.value = [
      (res.data as any),
      ...(oppaat.value || []),
    ];

    return res.data;
  }

  const updateQuery = debounce(async () => {
    const res = (await Oppaat.getAllOppaatKevyt(1000)).data;
    oppaat.value = (res as any).data as any;
  }, 300);

  return {
    // State
    oppaat,

    // Actions
    saveOpas,
    updateQuery,
  };
});

