import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { NavigationNodeDto, PerusteprojektiDto, PerusteDto, Perusteprojektit, Perusteet } from '@shared/api/eperusteet';
import _ from 'lodash';

Vue.use(VueCompositionApi);


export class PerusteStore {

  private state = reactive({
    projekti: null as PerusteprojektiDto | null,
    peruste: null as PerusteDto | null,
    navigation: null as NavigationNodeDto | null,
  });

  public readonly projekti = computed(() => this.state.projekti);
  public readonly peruste = computed(() => this.state.peruste);
  public readonly navigation = computed(() => this.state.navigation);

  async init(projektiId: number) {
    const projekti = (await Perusteprojektit.getPerusteprojekti(projektiId)).data;
    const perusteId = Number((projekti as any)._peruste);
    const peruste = (await Perusteet.getPerusteenTiedot(perusteId)).data;
    const navigation = (await Perusteet.getNavigation(perusteId)).data;
    this.state.projekti = projekti;
    this.state.peruste = peruste;
    this.state.navigation = navigation;
  }

}
