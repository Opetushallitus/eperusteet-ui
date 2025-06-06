import { defineStore } from 'pinia';
import { ref } from 'vue';
import { IKuvaStore } from '@shared/components/EpContent/KuvaHandler';
import { Api, Liitetiedostot } from '@shared/api/eperusteet';

export const useKuvaStore = defineStore('kuva', () => {
  // State
  const perusteId = ref<number | null>(null);

  // Actions
  function initialize(perusteIdParam: number) {
    perusteId.value = perusteIdParam;
  }

  function getEndpoint() {
    if (!perusteId.value) {
      throw new Error('perusteId not set');
    }
    return `/api/perusteet/${perusteId.value}/kuvat`;
  }

  function getAllKuvat() {
    if (!perusteId.value) {
      throw new Error('perusteId not set');
    }
    return Liitetiedostot.getAllKuvat(perusteId.value);
  }

  function getBaseUrl() {
    return Api.defaults.baseURL + getEndpoint();
  }

  function getApi() {
    return Api;
  }

  // Create a store instance that implements IKuvaStore
  const storeInstance: IKuvaStore = {
    getEndpoint,
    getAllKuvat,
    getBaseUrl,
    getApi,
  };

  return {
    // State
    perusteId,
    // Actions
    initialize,
    getEndpoint,
    getAllKuvat,
    getBaseUrl,
    getApi,
    // Store instance for interface compatibility
    storeInstance,
  };
});
