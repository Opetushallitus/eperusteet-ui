import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Tilastot, getAllPerusteet } from '@shared/api/eperusteet';
import { yleissivistavatKoulutustyypit } from '@shared/utils/perusteet';
import * as _ from 'lodash';

Vue.use(VueCompositionApi);

export class TilastotStore {
  public state = reactive({
    opetussuunnitelmat: null as any[] | null,
    toteutussuunnitelmat: null as any[] | null,
    perusteet: null as any[] | null,
  })

  public readonly opetussuunnitelmat = computed(() => this.state.opetussuunnitelmat);
  public readonly toteutussuunnitelmat = computed(() => this.state.toteutussuunnitelmat);
  public readonly perusteet = computed(() => this.state.perusteet);

  public async fetch() {
    const res = _.map(await Promise.all([
      Tilastot.getAmosaaTilastot(),
      Tilastot.getYlopsTilastot(),
      getAllPerusteet({ koulutustyyppi: yleissivistavatKoulutustyypit }),
    ]), 'data') as any;

    this.state.toteutussuunnitelmat = res[0];
    this.state.opetussuunnitelmat = res[1];
    this.state.perusteet = res[2].data;
  }
}
