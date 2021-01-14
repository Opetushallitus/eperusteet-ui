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

  public readonly aikataulutapahtumat = computed(() => {
    return _.map(this.state.peruste?.perusteenAikataulut, tapahtuma => {
      return {
        id: tapahtuma.id,
        tapahtuma: tapahtuma.tapahtuma?.toLowerCase().toString(),
        tapahtumapaiva: tapahtuma.tapahtumapaiva,
        tavoite: tapahtuma.tavoite,
      } as Tapahtuma;
    });
  });
  public readonly peruste = computed(() => this.state.peruste);

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
