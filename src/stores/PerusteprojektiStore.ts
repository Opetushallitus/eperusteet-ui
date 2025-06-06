import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { Perusteet, Perusteprojektit, PerusteprojektiLuontiDto, PerusteKevytDto, Maintenance } from '@shared/api/eperusteet';

export const usePerusteprojektiStore = defineStore('perusteprojekti', () => {
  // State
  const pohjat = ref<PerusteKevytDto[] | null>(null);
  const perusteet = ref<PerusteKevytDto[] | null>(null);

  // Actions
  async function fetchPohjat() {
    pohjat.value = (await Perusteet.getPohjaperusteet('pohja')).data;
  }

  async function fetchPohjaProjektit() {
    perusteet.value = (await Perusteet.getPohjaperusteet('normaali')).data;
  }

  async function fetchPohjaDigitaalisetOsaamiset() {
    perusteet.value = (await Perusteet.getPohjaperusteet('digitaalinen_osaaminen')).data;
  }

  async function addPerusteprojekti(luontiDto: PerusteprojektiLuontiDto) {
    const res = await Perusteprojektit.addPerusteprojekti(luontiDto);
    return res.data;
  }

  async function addPerusteprojektiPohja(luontiDto: PerusteprojektiLuontiDto) {
    const res = await Perusteprojektit.addPerusteprojektiPohja(luontiDto);
    return res.data;
  }

  async function importPerusteprojekti(importDto: any) {
    const res = await Maintenance.tuoPeruste(importDto);
    return res.data;
  }

  async function getPerusteprojekti(perusteProjektiId: number) {
    const res = await Perusteprojektit.getPerusteprojekti(perusteProjektiId);
    return res.data;
  }

  async function getPerusteprojektiTyoryhma(perusteProjektiId: number) {
    const res = await Perusteprojektit.getPerusteprojektiTyoryhmat(perusteProjektiId);
    return res.data;
  }

  return {
    // State
    pohjat,
    perusteet,

    // Actions
    fetchPohjat,
    fetchPohjaProjektit,
    fetchPohjaDigitaalisetOsaamiset,
    addPerusteprojekti,
    addPerusteprojektiPohja,
    importPerusteprojekti,
    getPerusteprojekti,
    getPerusteprojektiTyoryhma,
  };
});
