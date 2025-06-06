import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Ulkopuoliset } from '@shared/api/eperusteet';

export const useTyoryhmaStore = defineStore('tyoryhma', () => {
  // State
  const perusteenTyoryhma = ref<any[] | null>(null);
  const tyoryhmanVirkailiijat = ref<any[] | null>(null);

  // Getters
  const getPerusteenTyoryhma = computed(() => perusteenTyoryhma.value);
  const getTyoryhmanVirkailiijat = computed(() => tyoryhmanVirkailiijat.value);

  // Actions
  function clear() {
    perusteenTyoryhma.value = null;
    tyoryhmanVirkailiijat.value = null;
  }

  async function init(oid: string) {
    try {
      perusteenTyoryhma.value = (await Ulkopuoliset.getOrganisaatioRyhmatByOid(oid)).data as any;
    }
    catch (e) {
      perusteenTyoryhma.value = [];
    }

    try {
      tyoryhmanVirkailiijat.value = (await Ulkopuoliset.getOrganisaatioVirkailijat(oid)).data as any;
    }
    catch (e) {
      tyoryhmanVirkailiijat.value = [];
    }
  }

  return {
    // State
    perusteenTyoryhma,
    tyoryhmanVirkailiijat,
    // Getters
    getPerusteenTyoryhma,
    getTyoryhmanVirkailiijat,
    // Actions
    clear,
    init,
  };
});
