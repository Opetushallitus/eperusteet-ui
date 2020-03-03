import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Tapahtuma, aikataulutapahtuma } from '@shared/utils/aikataulu';
import _ from 'lodash';
import { NavigationNodeDto, PerusteprojektiDto, PerusteDto, Perusteprojektit, Perusteet } from '@shared/api/eperusteet';
import { PerusteetApi } from '@shared/generated/eperusteet';

Vue.use(VueCompositionApi);

export class AikatauluStore {
  private state = reactive({
    aikataulutapahtumat: null as Tapahtuma[] | null,
    peruste: null as PerusteDto | null,
  })

  public readonly aikataulutapahtumat = computed(() => {
    return [
      {
        tapahtuma: aikataulutapahtuma.luominen,
        tapahtumapaiva: this.state.peruste?.luotu,
      } as Tapahtuma,
      this.state.aikataulutapahtumat ? this.state.aikataulutapahtumat : [],
    ];
  });

  async init(peruste) {
    this.state.peruste = peruste;

    // this.state.aikataulutapahtumat = await aikataulut.haeaikataulut(peruste);
  }

  async saveAikataulut(aikataulut) {
    // save;
  }
}
