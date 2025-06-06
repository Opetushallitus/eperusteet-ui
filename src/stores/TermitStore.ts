import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Termit, TermiDto } from '@shared/api/eperusteet';
import _ from 'lodash';
import { ITermiStore, ITermi } from '@shared/components/EpContent/KasiteHandler';

export const useTermitStore = defineStore('termit', () => {
  // State
  const termit = ref<TermiDto[] | null>(null);
  const perusteId = ref<number | null>(null);

  // Getters
  const getTermit = computed(() => termit.value);

  // Actions
  function initialize(perusteIdParam?: number) {
    perusteId.value = perusteIdParam || null;
  }

  async function init(perusteIdParam: number) {
    perusteId.value = perusteIdParam || null;
    termit.value = null;
    termit.value = (await Termit.getAllTermit(perusteIdParam)).data;
  }

  async function save(perusteIdParam: number, muokattuTermi: TermiDto) {
    if (!muokattuTermi.avain) {
      muokattuTermi.avain = makeKey(muokattuTermi);
    }

    if (muokattuTermi.id) {
      muokattuTermi = (await Termit.updateTermi(perusteIdParam, muokattuTermi.id, muokattuTermi)).data;
      termit.value = _.map(termit.value, termi => {
        if (termi.id === muokattuTermi.id) {
          return muokattuTermi;
        }
        return termi;
      });
    }
    else {
      muokattuTermi = (await Termit.addTermi(perusteIdParam, muokattuTermi)).data;
      termit.value = [
        muokattuTermi,
        ...termit.value || [],
      ];
    }
  }

  async function deleteAction(perusteIdParam: number, poistettavaTermi: TermiDto) {
    await Termit.deleteTermi(perusteIdParam, poistettavaTermi.id!);
    termit.value = _.filter(termit.value, termi => termi.id !== poistettavaTermi.id);
  }

  function makeKey(item: any) {
    const termi = _.first(_.compact(_.values(item.termi))) || '';
    return termi.replace(/[^a-zA-Z0-9]/g, '') + new Date().getTime();
  }

  function getTermi(avain: string) {
    if (!perusteId.value) {
      throw new Error('perusteId not set');
    }
    return Termit.getTermi(perusteId.value, avain);
  }

  function getAllTermit() {
    if (!perusteId.value) {
      throw new Error('perusteId not set');
    }
    return Termit.getAllTermit(perusteId.value);
  }

  function updateTermi(termiId: number, termi: ITermi) {
    if (!perusteId.value) {
      throw new Error('perusteId not set');
    }
    return Termit.updateTermi(perusteId.value, termiId, termi);
  }

  function addTermi(termi: ITermi) {
    if (!perusteId.value) {
      throw new Error('perusteId not set');
    }
    return Termit.addTermi(perusteId.value, {
      ...termi,
      avain: makeKey(termi),
    });
  }

  // Create store instance that implements ITermiStore
  const storeInstance: ITermiStore = {
    termit: getTermit,
    init,
    save,
    delete: deleteAction,
    getTermi,
    getAllTermit,
    updateTermi,
    addTermi,
  };

  return {
    // State
    termit,
    perusteId,
    // Getters
    getTermit,
    // Actions
    initialize,
    init,
    save,
    delete: deleteAction,
    makeKey,
    getTermi,
    getAllTermit,
    updateTermi,
    addTermi,
    // Store instance for interface compatibility
    storeInstance,
  };
});
