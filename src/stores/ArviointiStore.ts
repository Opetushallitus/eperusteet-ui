import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';

import _ from 'lodash';

import { ArviointiAsteikkoDto, GeneerinenArviointiasteikkoDto, Arviointiasteikot, GeneerinenArviointiasteikko } from '@shared/api/eperusteet';
import { KieliStore } from '@shared/stores/kieli';
import { Debounced } from '@shared/utils/delay';
import { fail, success } from '@shared/utils/notifications';

Vue.use(VueCompositionApi);

export class ArviointiStore {
  constructor(
    private kieliStore: KieliStore,
  ) {
  }

  public state = reactive({
    arviointiasteikot: null as ArviointiAsteikkoDto[] | null,
    geneeriset: null as GeneerinenArviointiasteikkoDto[] | null,
    closed: {} as { [id: number]: boolean },
    filterStr: '',
  });

  public readonly arviointiasteikot = computed(() => this.state.arviointiasteikot);
  public readonly geneeriset = computed(() => this.state.geneeriset);
  public readonly filterStr = computed(() => this.state.filterStr);
  public readonly closed = computed(() => this.state.closed);

  public readonly allClosed = computed(() =>
    _.size(this.state.geneeriset) === _.size(this.state.closed) && _.every(this.state.closed));

  public readonly geneerisetSorted = computed(() =>
    _.reverse(_.sortBy(this.state.geneeriset, 'id')));

  public readonly geneerisetFiltered = computed(() => {
    if (this.state.filterStr) {
      return _.filter(this.geneerisetSorted.value, this.kieliStore.filterBy('nimi', this.state.filterStr));
    }
    else {
      return this.geneerisetSorted.value;
    }
  });

  public async fetchArviointiasteikot() {
    this.state.arviointiasteikot = null;
    const res = await Arviointiasteikot.getAll();
    this.state.arviointiasteikot = res.data;
  }

  public async updateArviointiasteikot(data: ArviointiAsteikkoDto[]) {
    await Arviointiasteikot.updateArviointiasteikot(data);
  }

  public async fetchGeneeriset() {
    this.state.geneeriset = null;
    const res = await GeneerinenArviointiasteikko.getAllGeneerisetArviointiasteikot();
    this.state.geneeriset = res.data;
  }

  public async toggleAll() {
    const val = !this.allClosed.value;
    _.forEach(this.geneeriset.value, value => {
      Vue.set(this.state.closed, value.id!, val);
    });
  }

  @Debounced(300)
  public async filterGeneeriset(value: string) {
    this.state.filterStr = value;
  }

  public async toggleOpen(value: GeneerinenArviointiasteikkoDto, state?: boolean) {
    if (!value.id) {
      return;
    }

    if (state !== undefined) {
      Vue.set(this.state.closed, value.id, !!state);
    }
    else {
      Vue.set(this.state.closed, value.id, !this.state.closed[value.id]);
    }
  }

  public async add(value: GeneerinenArviointiasteikkoDto) {
    try {
      const res = await GeneerinenArviointiasteikko.addGeneerinenArviointiasteikko(value);
      res.data.osaamistasonKriteerit = _.map(res.data.osaamistasonKriteerit, osaamiskriteeri => {
        return {
          ...osaamiskriteeri,
          kriteerit: [{}],
        };
      });
      this.state.geneeriset = [...(this.state.geneeriset || []), res.data];
      success('tallennettu');
      return res.data;
    }
    catch (err) {
      fail('virhe-palvelu-virhe');
    }
  }

  public async save(value: GeneerinenArviointiasteikkoDto) {
    try {
      const res = await GeneerinenArviointiasteikko.updateGeneerinenArviontiasteikko(value.id!, value);
      const idx = _.findIndex(this.state.geneeriset, g => g.id === value.id);
      Vue.set(this.state.geneeriset!, idx, res.data);
      success('tallennettu');
    }
    catch (err) {
      fail('tallennus-epaonnistui');
    }
  }

  public async publish(value: GeneerinenArviointiasteikkoDto, julkaistu: boolean) {
    try {
      const res = await GeneerinenArviointiasteikko.updateGeneerinenArviontiasteikko(value.id!, {
        ...value,
        julkaistu,
      });
      const idx = _.findIndex(this.state.geneeriset, g => g.id === value.id);
      Vue.set(this.state.geneeriset!, idx, res.data);
      success('geneerinen-arviointi-julkaistu');
    }
    catch (err) {
      fail('virhe-palvelu-virhe');
    }
  }

  public async remove(value: GeneerinenArviointiasteikkoDto) {
    try {
      await GeneerinenArviointiasteikko.removeGeneerinenArviontiasteikko(value.id!);
      const idx = _.findIndex(this.state.geneeriset, g => g.id === value.id);
      Vue.delete(this.state.geneeriset!, idx);
      success('geneerinen-arviointi-poistettu');
    }
    catch (err) {
      fail('virhe-palvelu-virhe');
    }
  }
}
