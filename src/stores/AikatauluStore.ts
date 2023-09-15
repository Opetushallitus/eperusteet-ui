import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Tapahtuma } from '@shared/utils/aikataulu';
import _ from 'lodash';
import { PerusteDto, Aikataulut } from '@shared/api/eperusteet';

Vue.use(VueCompositionApi);

export class AikatauluStore {
  private state = reactive({
    aikataulutapahtumat: null as Tapahtuma[] | null,
    peruste: null as PerusteDto | null,
  })

  public readonly aikataulutapahtumat = computed(() => this.state.peruste?.perusteenAikataulut);
  public readonly peruste = computed(() => this.state.peruste);

  clear() {
    this.state.aikataulutapahtumat = null;
  }

  async init(peruste) {
    this.state.peruste = peruste;
  }

  async saveAikataulut(aikataulut) {
    const tallennetut = await Aikataulut.updatePerusteenAikataulut((this.state.peruste as any).id, aikataulut);
    this.state.peruste = {
      ...(this.state.peruste as any),
      perusteenAikataulut: tallennetut.data,
    };
  }
}
