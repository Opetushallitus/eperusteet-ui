import Vue from 'vue';
import VueCompositionApi, { watch, reactive, computed } from '@vue/composition-api';
import { NavigationNodeDto, PerusteprojektiDto, PerusteDto, Ulkopuoliset, Perusteprojektit, Perusteet } from '@shared/api/eperusteet';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class PerusteStore {
  private blocklist = [] as (() => void)[];

  private state = reactive({
    projekti: null as PerusteprojektiDto | null,
    peruste: null as PerusteDto | null,
    navigation: null as NavigationNodeDto | null,
    tyoryhma: null as any | null,
    perusteId: null as number | null,
    isInitialized: false,
    initializing: false,
  });

  public readonly projekti = computed(() => this.state.projekti);
  public readonly peruste = computed(() => this.state.peruste);
  public readonly navigation = computed(() => this.state.navigation);
  public readonly tyoryhma = computed(() => this.state.tyoryhma);
  public readonly suoritustavat = computed(() => _.map(this.state.peruste?.suoritustavat, suoritustapa => _.toString(suoritustapa.suoritustapakoodi)) as string[]);
  public readonly perusteId = computed(() => this.state.perusteId);
  public readonly projektiId = computed(() => this.state.projekti?.id);
  public readonly tutkinnonOsat = computed(() => this.state.perusteId);

  async init(projektiId: number) {
    if (this.state.initializing
        || !projektiId
        || projektiId === this.state.projekti?.id) {
      return;
    }

    try {
      this.state.initializing = true;
      this.state.isInitialized = false;
      this.state.peruste = null;
      this.state.projekti = null;
      this.state.projekti = (await Perusteprojektit.getPerusteprojekti(projektiId)).data;
      const perusteId = Number((this.state.projekti as any)._peruste);
      this.state.perusteId = perusteId;

      [
        this.state.peruste,
        this.state.navigation,
        this.state.tyoryhma,
      ] = _.map(await Promise.all([
        Perusteet.getPerusteenTiedot(perusteId),
        Perusteet.getNavigation(perusteId),
        Ulkopuoliset.getOrganisaatioRyhmatByOid(this.state.projekti.ryhmaOid!),
      ]), 'data');

      this.state.isInitialized = true;
    }
    finally {
      this.state.initializing = false;
    }
  }

  public async updateNavigation() {
    if (!this.state.perusteId) {
      return;
    }
    const res = await Perusteet.getNavigation(this.state.perusteId);
    this.state.navigation = res.data;
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

  public async blockUntilInitialized() {
    return new Promise(resolve => {
      if (this.state.isInitialized) {
        resolve();
      }
      else {
        this.blocklist.push(resolve);
      }
    });
  }

  private readonly blockResolver = watch(() => {
    if (this.state.isInitialized) {
      while (this.blocklist.length > 0) {
        const fn = this.blocklist.shift();
        if (fn) {
          fn();
        }
      }
    }
  });
}
