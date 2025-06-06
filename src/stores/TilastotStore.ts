import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Tilastot, Perusteet } from '@shared/api/eperusteet';
import { yleissivistavatKoulutustyypit } from '@shared/utils/perusteet';
import * as _ from 'lodash';

export const useTilastotStore = defineStore('tilastot', () => {
  // State
  const opetussuunnitelmat = ref<any[] | null>(null);
  const toteutussuunnitelmat = ref<any[] | null>(null);
  const perusteet = ref<any[] | null>(null);

  // Actions
  async function fetch() {
    await Promise.all([fetchAmosaaTilastot(), fetchYlopsTilastot(), fetchPerusteet()]);
  }

  async function fetchAmosaaTilastot() {
    try {
      toteutussuunnitelmat.value = (await Tilastot.getAmosaaTilastot()).data;
    }
    catch (e) {
      toteutussuunnitelmat.value = [];
    }
  }

  async function fetchYlopsTilastot() {
    try {
      opetussuunnitelmat.value = (await Tilastot.getYlopsTilastot()).data as any;
    }
    catch (e) {
      opetussuunnitelmat.value = [];
    }
  }

  async function fetchPerusteet() {
    try {
      const perusteData = _.get((await Perusteet.getAllPerusteetInternal(
        undefined,
        1000,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        yleissivistavatKoulutustyypit,
      )).data, 'data');

      if (perusteData) {
        perusteet.value = perusteData;
      }
    }
    catch (e) {
      perusteet.value = [];
    }
  }

  return {
    // State
    opetussuunnitelmat,
    toteutussuunnitelmat,
    perusteet,

    // Actions
    fetch,
    fetchAmosaaTilastot,
    fetchYlopsTilastot,
    fetchPerusteet,
  };
});
