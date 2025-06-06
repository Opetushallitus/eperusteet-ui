import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { required } from 'vuelidate/lib/validators';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import { usePerusteStore } from '@/stores/PerusteStore';
import _ from 'lodash';
import { pinia } from './pinia';

export const useLaajaalainenOsaaminenStore = defineStore('laajaalainenOsaaminen', () => {
  // State
  const state = reactive({
    perusteenOsaId: null as number | null,
    perusteId: null as number | null,
    laajaalainenosaaminenId: null as number | null,
    versionumero: null as number | null,
  });

  // Computed
  const perusteenOsaId = computed(() => state.perusteenOsaId);
  const validator = computed(() => {
    return {
      nimiKoodi: { required },
    };
  });

  // Store
  const perusteStore = usePerusteStore(pinia);

  // Initialize the store
  function init(perusteId: number, laajaalainenosaaminenId: number, versionumero?: number) {
    state.perusteId = perusteId;
    state.laajaalainenosaaminenId = laajaalainenosaaminenId;
    state.versionumero = versionumero || null;
  }

  // Actions
  async function load() {
    return fetchPerusteenOsat();
  }

  async function fetchPerusteenOsat() {
    try {
      let perusteenOsa;
      if (state.versionumero && state.laajaalainenosaaminenId) {
        const revisions = (await Perusteenosat.getPerusteenOsaViiteVersiot(state.laajaalainenosaaminenId)).data as Revision[];
        const rev = revisions[revisions.length - state.versionumero];
        perusteenOsa = (await Perusteenosat.getPerusteenOsaVersioByViite(state.laajaalainenosaaminenId, rev.numero)).data;
        state.perusteenOsaId = perusteenOsa.id;
      }
      else {
        perusteenOsa = (await Perusteenosat.getPerusteenOsatByViite(state.laajaalainenosaaminenId!)).data;
        state.perusteenOsaId = perusteenOsa.id;
      }
      return perusteenOsa;
    }
    catch (err) {
      console.error(err);
    }
  }

  async function save(data: any) {
    if (data.nimiKoodi) {
      data.nimi = data.nimiKoodi.nimi;
    }
    const res = await Perusteenosat.updatePerusteenOsa(perusteenOsaId.value!, data);

    perusteStore.updateNavigationEntry({
      id: state.laajaalainenosaaminenId!,
      label: (res.data as any).nimi as any,
    });
    return res.data;
  }

  function getOsanType() {
    return 'laajaalainenosaaminen';
  }

  return {
    // State
    perusteenOsaId,
    validator,

    // Actions
    init,
    load,
    fetchPerusteenOsat,
    save,
    getOsanType,
  };
});
