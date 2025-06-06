import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Page } from '@shared/tyypit';
import { Osaamismerkit, OsaamismerkitQuery, OsaamismerkkiDto } from '@shared/api/eperusteet';
import { OsaamismerkkiKategoriaDto } from '@shared/generated/eperusteet';
import debounce from 'lodash/debounce';

export const useOsaamismerkitStore = defineStore('osaamismerkit', () => {
  // State
  const osaamismerkkiPage = ref<Page<OsaamismerkkiDto> | null>(null);
  const query = ref<OsaamismerkitQuery>({} as OsaamismerkitQuery);
  const isLoading = ref(false);
  const kokonaismaara = ref(0);
  const kategoriat = ref<OsaamismerkkiKategoriaDto[] | null>([]);

  // Computed
  const osaamismerkit = computed(() => osaamismerkkiPage.value?.data || null);
  const kokonaismaaraComputed = computed(() => osaamismerkkiPage.value?.kokonaismäärä);
  const options = computed(() => query.value);

  // Actions
  async function init(newQuery: OsaamismerkitQuery) {
    query.value = newQuery;
    osaamismerkkiPage.value = null;
    await fetchKategoriat();
  }

  const updateOsaamismerkkiQuery = debounce(async (newQuery: OsaamismerkitQuery) => {
    osaamismerkkiPage.value = null;
    osaamismerkkiPage.value = await fetchOsaamismerkitImpl(newQuery);
  }, 300);

  async function fetchOsaamismerkitImpl(q: OsaamismerkitQuery) {
    const res = (await Osaamismerkit.findOsaamismerkitBy(
      q.sivu,
      q.sivukoko,
      q.nimi,
      q.tila,
      q.koodit,
      q.kategoria,
      q.voimassa,
      q.tuleva,
      q.poistunut,
      q.kieli,
    )).data as any;
    return res;
  }

  async function fetchKategoriat() {
    kategoriat.value = null;
    kategoriat.value = (await Osaamismerkit.getKategoriat()).data;
  }

  async function deleteOsaamismerkki(id: any) {
    await Osaamismerkit.deleteOsaamismerkki(id);
  }

  async function updateOsaamismerkki(osaamismerkki: OsaamismerkkiDto) {
    await Osaamismerkit.updateOsaamismerkki(osaamismerkki);
  }

  async function updateKategoria(kategoria: OsaamismerkkiKategoriaDto) {
    await Osaamismerkit.updateKategoria(kategoria);
  }

  async function deleteKategoria(id: any) {
    await Osaamismerkit.deleteKategoria(id);
  }

  return {
    // State
    osaamismerkkiPage,
    query,
    isLoading,
    kokonaismaara,
    kategoriat,

    // Computed
    osaamismerkit,
    kokonaismaaraComputed,
    options,

    // Actions
    init,
    updateOsaamismerkkiQuery,
    fetchKategoriat,
    deleteOsaamismerkki,
    updateOsaamismerkki,
    updateKategoria,
    deleteKategoria,
  };
});
