import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import _ from 'lodash';

import { ArviointiAsteikkoDto, GeneerinenArviointiasteikkoDto, Arviointiasteikot, GeneerinenArviointiasteikko } from '@shared/api/eperusteet';
import { Kielet } from '@shared/stores/kieli';
import { $t, $success, $fail } from '@shared/utils/globals';


export const useArviointiStore = defineStore('arviointi', () => {
  // State
  const arviointiasteikot = ref<ArviointiAsteikkoDto[] | null>(null);
  const geneeriset = ref<GeneerinenArviointiasteikkoDto[] | null>(null);
  const closed = ref<{ [id: number]: boolean }>({});
  const filterStr = ref('');

  // Getters
  const getArviointiasteikot = computed(() => arviointiasteikot.value);
  const getGeneeriset = computed(() => geneeriset.value);
  const getFilterStr = computed(() => filterStr.value);
  const getClosed = computed(() => closed.value);

  const allClosed = computed(() =>
    _.size(geneeriset.value) === _.size(closed.value) && _.every(closed.value));

  const geneerisetSorted = computed(() =>
    _.reverse(_.sortBy(geneeriset.value, 'id')));

  const geneerisetFiltered = computed(() => {
    if (filterStr.value) {
      return _.filter(geneerisetSorted.value, Kielet.filterBy('nimi', filterStr.value));
    }
    else {
      return geneerisetSorted.value;
    }
  });

  // Actions
  async function fetchArviointiasteikot() {
    arviointiasteikot.value = null;
    const res = await Arviointiasteikot.getAll();
    arviointiasteikot.value = res.data;
  }

  async function updateArviointiasteikot(data: ArviointiAsteikkoDto[]) {
    await Arviointiasteikot.updateArviointiasteikot(data);
  }

  async function fetchGeneeriset() {
    geneeriset.value = null;
    const res = await GeneerinenArviointiasteikko.getAllGeneerisetArviointiasteikot();
    geneeriset.value = res.data;
  }

  async function toggleAll() {
    const val = !allClosed.value;
    _.forEach(geneeriset.value, value => {
      closed.value[value.id!] = val;
    });
  }

  const filterGeneeriset = _.debounce(async (value: string) => {
    filterStr.value = value;
  }, 300);

  async function toggleOpen(value: GeneerinenArviointiasteikkoDto, state?: boolean) {
    if (!value.id) {
      return;
    }

    if (state !== undefined) {
      closed.value[value.id] = !!state;
    }
    else {
      closed.value[value.id] = !closed.value[value.id];
    }
  }

  async function add(value: GeneerinenArviointiasteikkoDto) {
    try {
      const res = await GeneerinenArviointiasteikko.addGeneerinenArviointiasteikko(value);
      res.data.osaamistasonKriteerit = _.map(res.data.osaamistasonKriteerit, osaamiskriteeri => {
        return {
          ...osaamiskriteeri,
          kriteerit: [{}],
        };
      });
      geneeriset.value = [...(geneeriset.value || []), res.data];
      $success('tallennettu');
      return res.data;
    }
    catch (err) {
      $fail('virhe-palvelu-virhe');
    }
  }

  async function save(value: GeneerinenArviointiasteikkoDto) {
    try {
      const res = await GeneerinenArviointiasteikko.updateGeneerinenArviontiasteikko(value.id!, value);
      const idx = _.findIndex(geneeriset.value, g => g.id === value.id);
      if (geneeriset.value && idx !== -1) {
        geneeriset.value[idx] = res.data;
      }
      $success('tallennettu');
    }
    catch (err) {
      $fail('tallennus-epaonnistui');
    }
  }

  async function publish(value: GeneerinenArviointiasteikkoDto, julkaistu: boolean) {
    try {
      const res = await GeneerinenArviointiasteikko.updateGeneerinenArviontiasteikko(value.id!, {
        ...value,
        julkaistu,
      });
      const idx = _.findIndex(geneeriset.value, g => g.id === value.id);
      if (geneeriset.value && idx !== -1) {
        geneeriset.value[idx] = res.data;
      }
      $success('geneerinen-arviointi-julkaistu');
    }
    catch (err) {
      $fail('virhe-palvelu-virhe');
    }
  }

  async function remove(value: GeneerinenArviointiasteikkoDto) {
    try {
      await GeneerinenArviointiasteikko.removeGeneerinenArviontiasteikko(value.id!);
      const idx = _.findIndex(geneeriset.value, g => g.id === value.id);
      if (geneeriset.value && idx !== -1) {
        geneeriset.value.splice(idx, 1);
      }
      $success('geneerinen-arviointi-poistettu');
    }
    catch (err) {
      $fail('virhe-palvelu-virhe');
    }
  }

  return {
    // State
    arviointiasteikot,
    geneeriset,
    closed,
    filterStr,
    // Getters
    getArviointiasteikot,
    getGeneeriset,
    getFilterStr,
    getClosed,
    allClosed,
    geneerisetSorted,
    geneerisetFiltered,
    // Actions
    fetchArviointiasteikot,
    updateArviointiasteikot,
    fetchGeneeriset,
    toggleAll,
    filterGeneeriset,
    toggleOpen,
    add,
    save,
    publish,
    remove,
  };
});
