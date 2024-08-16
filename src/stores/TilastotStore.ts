import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Tilastot, getAllPerusteet, Perusteet } from '@shared/api/eperusteet';
import { yleissivistavatKoulutustyypit } from '@shared/utils/perusteet';
import * as _ from 'lodash';

Vue.use(VueCompositionApi);

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
