import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Ulkopuoliset } from '@shared/api/eperusteet';
import _ from 'lodash';

export const useUlkopuolisetStore = defineStore('ulkopuoliset', () => {
  // State
  const tyoryhmat = ref<any[] | null>(null);

  // Actions
  const fetchTyoryhmat = _.debounce(async () => {
    const res = await Ulkopuoliset.getOrganisaatioRyhmat();
    tyoryhmat.value = res.data as any;
  }, 100);

  return {
    // State
    tyoryhmat,

    // Actions
    fetchTyoryhmat,
  };
});
