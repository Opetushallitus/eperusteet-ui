import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Maintenance, PerusteKevytDto, Perusteet, YllapitoDto } from '@shared/api/eperusteet';
import _ from 'lodash';

export const useYllapitoStore = defineStore('yllapis', () => {
  // State
  const julkisivunPerusteet = ref<PerusteKevytDto[] | null>(null);

  // Getters
  const getJulkisivunPerusteet = computed(() => julkisivunPerusteet.value);

  // Actions
  async function fetchJulkisivunPerusteet() {
    julkisivunPerusteet.value = null;
    julkisivunPerusteet.value = (await Perusteet.getJulkaistutKoostePerusteet()).data;
  }

  async function tallennaJulkisivunPerusteet(perusteet: PerusteKevytDto[]) {
    await Perusteet.updateJulkaistutKoostePerusteet(perusteet);
    julkisivunPerusteet.value = perusteet;
  }

  async function fetch() {
    return _.sortBy((await Maintenance.getYllapidot()).data, 'key');
  }

  async function save(data: YllapitoDto[]) {
    await Maintenance.updateYllapito(data);
  }

  return {
    // State
    julkisivunPerusteet,
    // Getters
    getJulkisivunPerusteet,
    // Actions
    fetchJulkisivunPerusteet,
    tallennaJulkisivunPerusteet,
    fetch,
    save,
  };
});
