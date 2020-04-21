import Vue from 'vue';
import VueCompositionApi, { watch, reactive, computed } from '@vue/composition-api';
import { NavigationNodeDto, PerusteprojektiDto, PerusteDto, Ulkopuoliset, Perusteprojektit, Perusteet, TilaUpdateStatus } from '@shared/api/eperusteet';
import { Kieli } from '@shared/tyypit';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';

Vue.use(VueCompositionApi);

export class PerusteStore implements IEditoitava {
  private blocklist = [] as (() => void)[];

  private state = reactive({
    projekti: null as PerusteprojektiDto | null,
    peruste: null as PerusteDto | null,
    navigation: null as NavigationNodeDto | null,
    perusteId: null as number | null,
    isInitialized: false,
    initializing: false,
    projektiStatus: null as TilaUpdateStatus | null,
  });

  public readonly projekti = computed(() => this.state.projekti);
  public readonly peruste = computed(() => this.state.peruste);
  public readonly navigation = computed(() => this.state.navigation);
  public readonly suoritustavat = computed(() => _.map(this.state.peruste?.suoritustavat, suoritustapa => _.toString(suoritustapa.suoritustapakoodi)) as string[]);
  public readonly perusteId = computed(() => this.state.perusteId);
  public readonly projektiId = computed(() => this.state.projekti?.id);
  public readonly tutkinnonOsat = computed(() => this.state.perusteId);
  public readonly julkaisukielet = computed(() => (this.state.peruste?.kielet || []) as unknown as Kieli[]);
  public readonly projektiStatus = computed(() => this.state.projektiStatus);

  public async updateValidointi(projektiId: number) {
    const res = await Perusteprojektit.getPerusteprojektiValidointi(projektiId);
    this.state.projektiStatus = res.data;
  }

  async init(projektiId: number) {
    if (this.state.initializing || (this.state.isInitialized && projektiId === this.projektiId.value)) {
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
      ] = _.map(await Promise.all([
        Perusteet.getPerusteenTiedot(perusteId),
        Perusteet.getNavigation(perusteId),
      ]), 'data');
      this.updateValidointi(this.state.projekti.id!);
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

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false;
  }

  async history() {
  }

  async load() {
  }

  async preview() {
    return null;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async remove() {
  }

  async restore() {
  }

  async revisions() {
    return [];
  }

  async save() {
  }

  async start() {
  }

  public readonly validator = computed(() => {
    return {
    };
  });
}
