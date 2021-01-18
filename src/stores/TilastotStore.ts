import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Tilastot, getAllPerusteet } from '@shared/api/eperusteet';
import { yleissivistavatKoulutustyypit } from '@shared/utils/perusteet';

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
    this.state.toteutussuunnitelmat = (await Tilastot.getAmosaaTilastot()).data as any;
    this.state.opetussuunnitelmat = (await Tilastot.getYlopsTilastot()).data as any;
    this.state.perusteet = ((await getAllPerusteet({ koulutustyyppi: yleissivistavatKoulutustyypit })).data as any).data as any;
  }
}
