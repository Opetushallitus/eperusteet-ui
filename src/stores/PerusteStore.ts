import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { NavigationNodeDto, PerusteprojektiDto, PerusteDto, Ulkopuoliset, Perusteprojektit, Perusteet } from '@shared/api/eperusteet';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class PerusteStore {
  private state = reactive({
    projekti: null as PerusteprojektiDto | null,
    peruste: null as PerusteDto | null,
    navigation: null as NavigationNodeDto | null,
    tyoryhma: null as any | null,
  });

  public readonly projekti = computed(() => this.state.projekti);
  public readonly peruste = computed(() => this.state.peruste);
  public readonly navigation = computed(() => this.state.navigation);
  public readonly tyoryhma = computed(() => this.state.tyoryhma);
  public readonly perusteId = computed(() => this.state.peruste?.id);

  async init(projektiId: number) {
    this.state.peruste = null;
    this.state.projekti = null;

    this.state.projekti = (await Perusteprojektit.getPerusteprojekti(projektiId)).data;
    const perusteId = Number((this.state.projekti as any)._peruste);

    [
      this.state.peruste,
      this.state.navigation,
      this.state.tyoryhma,
    ] = _.map(await Promise.all([
      Perusteet.getPerusteenTiedot(perusteId),
      Perusteet.getNavigation(perusteId),
      Ulkopuoliset.getOrganisaatioRyhmatByOid(this.state.projekti.ryhmaOid!),
    ]), 'data');
  }

  public removeNavigationEntry(item: { id: number, type: string }) {
    if (this.state.navigation) {
      this.state.navigation = this.removeImpl(this.state.navigation, item);
    }
  }

  removeImpl(node: NavigationNodeDto, item: { id: number, type: string }): NavigationNodeDto {
    node.children = _(node.children || [])
      .reject(child => child.id === item.id && child.type === item.type)
      .map(child => this.removeImpl(child, item))
      .value();
    return node;
  }
}
