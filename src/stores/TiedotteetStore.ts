import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TiedoteDto, Tiedotteet } from '@shared/api/eperusteet';
import _ from 'lodash';
import { ITiedotteetProvider } from '@shared/stores/types';
import { TiedoteQuery } from '@shared/api/types';
import { Page } from '@shared/tyypit';

export const useTiedotteetStore = defineStore('tiedotteet', () => {
  // State
  const tiedotteetPage = ref<Page<TiedoteDto> | null>(null);
  const query = ref<TiedoteQuery>({} as TiedoteQuery);
  const isLoading = ref(false);

  // Getters
  const tiedotteet = computed(() => tiedotteetPage.value?.data || null);
  const getTiedotteetPage = computed(() => tiedotteetPage.value);
  const perusteId = computed(() => query.value.perusteId);
  const kokonaismaara = computed(() => tiedotteetPage.value?.kokonaismäärä);
  const getIsLoading = computed(() => isLoading.value);
  const options = computed(() => query.value);

  // Actions
  function clear() {
    tiedotteetPage.value = null;
  }

  async function init(queryParam: TiedoteQuery) {
    query.value = queryParam;
    tiedotteetPage.value = null;
    await fetch();
  }

  async function fetchImpl(q: TiedoteQuery) {
    const res = (await Tiedotteet.findTiedotteetBy(
      q.sivu,
      q.sivukoko,
      q.kieli,
      q.nimi,
      q.perusteId,
      q.perusteeton,
      q.julkinen,
      q.yleinen,
      q.tiedoteJulkaisuPaikka,
      q.perusteIds,
      q.koulutusTyyppi,
      q.jarjestys,
      q.jarjestysNouseva,
    )).data as any;
    return res;
  }

  const fetch = _.debounce(async () => {
    tiedotteetPage.value = null;
    tiedotteetPage.value = await fetchImpl(options.value);
  }, 300);

  async function save(tiedote: TiedoteDto) {
    if (_.isNil(tiedote.id)) {
      const tallennettu = (await Tiedotteet.addTiedote(tiedote) as any).data;
      tiedotteetPage.value!.data = [tallennettu, ...tiedotteetPage.value!.data || []];
    }
    else {
      await Tiedotteet.updateTiedote((tiedote as any).id, tiedote);
      const tallennettu = (await Tiedotteet.getTiedote((tiedote as any).id, tiedote) as any).data;
      tiedotteetPage.value!.data = _.map(tiedotteetPage.value!.data, (listaTiedote) => listaTiedote.id === tallennettu.id ? tallennettu : listaTiedote);
    }
  }

  async function deleteAction(tiedote: TiedoteDto) {
    if (tiedote.id) {
      await Tiedotteet.deleteTiedote(tiedote.id);
      tiedotteetPage.value!.data = _.filter(tiedotteetPage.value!.data, (listaTiedote) => listaTiedote.id !== tiedote.id);
    }
  }

  // Create store instance that implements ITiedotteetProvider
  const storeInstance: ITiedotteetProvider = {
    tiedotteet,
    tiedotteetPage: getTiedotteetPage,
    perusteId,
    kokonaismaara,
    isLoading: getIsLoading,
    options,
    clear,
    init,
    fetch,
    save,
    delete: deleteAction,
  };

  return {
    // State
    tiedotteetPage,
    query,
    isLoading,
    // Getters
    tiedotteet,
    getTiedotteetPage,
    perusteId,
    kokonaismaara,
    getIsLoading,
    options,
    // Actions
    clear,
    init,
    fetch,
    save,
    delete: deleteAction,
    // Store instance for interface compatibility
    storeInstance,
  };
});
