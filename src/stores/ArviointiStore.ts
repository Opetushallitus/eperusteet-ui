import Vue from 'vue'
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api'
import { ArviointiAsteikkoDto, GeneerinenArviointiasteikkoDto, Arviointiasteikot, GeneerinenArviointiasteikko } from '@shared/api/eperusteet'
import { Page } from '@shared/tyypit'
import _ from 'lodash'

Vue.use(VueCompositionApi)


export class ArviointiStore {
  private state = reactive({
    arviointiasteikot: null as ArviointiAsteikkoDto[] | null,
    geneeriset: null as GeneerinenArviointiasteikkoDto[] | null,
  })

  public readonly arviointiasteikot = computed(() => this.state.arviointiasteikot);
  public readonly geneeriset = computed(() => this.state.geneeriset);

  public readonly fetchArviointiasteikot = async () => {
    this.state.arviointiasteikot = null;
    const res = await Arviointiasteikot.getAll();
    this.state.arviointiasteikot = res.data;
  }

  public readonly fetchGeneeriset = async () => {
    this.state.geneeriset = null;
    const res = await GeneerinenArviointiasteikko.getAllGeneerisetArviointiasteikot();
    this.state.geneeriset = res.data;
  }

}

export const arviointiStore = new ArviointiStore()
