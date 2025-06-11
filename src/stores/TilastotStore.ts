import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import { Tilastot, Perusteet } from '@shared/api/eperusteet';
import { yleissivistavatKoulutustyypit } from '@shared/utils/perusteet';
import * as _ from 'lodash';

// Original class-based implementation for backward compatibility
export class TilastotStore {
  public state = reactive({
    opetussuunnitelmat: null as any[] | null,
    toteutussuunnitelmat: null as any[] | null,
    perusteet: null as any[] | null,
  });

  public readonly opetussuunnitelmat = computed(() => this.state.opetussuunnitelmat);
  public readonly toteutussuunnitelmat = computed(() => this.state.toteutussuunnitelmat);
  public readonly perusteet = computed(() => this.state.perusteet);

  public async fetch() {
    await Promise.all([this.fetchAmosaaTilastot(), this.fetchYlopsTilastot(), this.fetchPerusteet()]);
  }

  async fetchAmosaaTilastot() {
    try {
      this.state.toteutussuunnitelmat = (await Tilastot.getAmosaaTilastot()).data;
    }
    catch (e) {
      this.state.toteutussuunnitelmat = [];
    }
  }

  async fetchYlopsTilastot() {
    try {
      this.state.opetussuunnitelmat = (await Tilastot.getYlopsTilastot()).data as any;
    }
    catch (e) {
      this.state.opetussuunnitelmat = [];
    }
  }

  async fetchPerusteet() {
    try {
      const perusteet = _.get((await Perusteet.getAllPerusteetInternal(
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

      if (perusteet) {
        this.state.perusteet = perusteet;
      }
    }
    catch (e) {
      this.state.perusteet = [];
    }
  }
}

// New Pinia implementation
export const useTilastotStore = defineStore('tilastot', () => {
  const state = reactive({
    opetussuunnitelmat: null as any[] | null,
    toteutussuunnitelmat: null as any[] | null,
    perusteet: null as any[] | null,
  });

  const opetussuunnitelmat = computed(() => state.opetussuunnitelmat);
  const toteutussuunnitelmat = computed(() => state.toteutussuunnitelmat);
  const perusteet = computed(() => state.perusteet);

  async function fetch() {
    await Promise.all([fetchAmosaaTilastot(), fetchYlopsTilastot(), fetchPerusteet()]);
  }

  async function fetchAmosaaTilastot() {
    try {
      state.toteutussuunnitelmat = (await Tilastot.getAmosaaTilastot()).data;
    }
    catch (e) {
      state.toteutussuunnitelmat = [];
    }
  }

  async function fetchYlopsTilastot() {
    try {
      state.opetussuunnitelmat = (await Tilastot.getYlopsTilastot()).data as any;
    }
    catch (e) {
      state.opetussuunnitelmat = [];
    }
  }

  async function fetchPerusteet() {
    try {
      const perusteet = _.get((await Perusteet.getAllPerusteetInternal(
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

      if (perusteet) {
        state.perusteet = perusteet;
      }
    }
    catch (e) {
      state.perusteet = [];
    }
  }

  return {
    opetussuunnitelmat,
    toteutussuunnitelmat,
    perusteet,
    fetch,
    fetchAmosaaTilastot,
    fetchYlopsTilastot,
    fetchPerusteet,
  };
});
