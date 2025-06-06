import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Maintenance } from '@shared/api/eperusteet';

export const useMaintenanceStore = defineStore('maintenance', () => {
  // State
  const projektiId = ref<number | null>(null);
  const perusteId = ref<number | null>(null);

  // Actions
  function initialize(projektiIdParam: number, perusteIdParam: number) {
    projektiId.value = projektiIdParam;
    perusteId.value = perusteIdParam;
  }

  async function exportPeruste() {
    if (!perusteId.value) {
      throw new Error('perusteId not set');
    }

    const ladattuPeruste = (await Maintenance.viePeruste(perusteId.value)) as any;
    const fileURL = window.URL.createObjectURL(new Blob([ladattuPeruste]));
    const fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.setAttribute('download', 'peruste.json');
    document.body.appendChild(fileLink);
    fileLink.click();
  }

  return {
    // State
    projektiId,
    perusteId,
    // Actions
    initialize,
    exportPeruste,
  };
});
