import { defineStore } from 'pinia';
import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusopetuksenPerusteenSisalto, PerusopetusLaajaAlainenOsaaminenLukko } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { usePerusteStore } from './PerusteStore';
import { inject, reactive } from 'vue';

export const usePerusopetusLaajaAlainenOsaaminenStore = defineStore('perusopetusLaajaAlainenOsaaminen', () => {
  // State
  const state = reactive({
    perusteId: null as number | null,
    laoId: null as number | null,
  });

  // Router
  const router = inject('router') as any;

  // Peruste store
  const perusteStore = usePerusteStore();

  // Initialize the store
  function init(perusteId: number, laoId: number | null) {
    state.perusteId = perusteId;
    state.laoId = laoId;
  }

  async function editAfterLoad() {
    return !state.laoId;
  }

  async function load() {
    if (state.laoId) {
      return (await PerusopetuksenPerusteenSisalto.getOsaaminen(state.perusteId!, state.laoId)).data;
    }

    return {};
  }

  async function save(data: any) {
    if (state.laoId) {
      await PerusopetuksenPerusteenSisalto.updateOsaaminen(state.perusteId!, state.laoId, data);
      await perusteStore.updateNavigation();
    }
    else {
      const lao = (await PerusopetuksenPerusteenSisalto.addOsaaminen(state.perusteId!, data)).data;
      state.laoId = lao.id!;
      await perusteStore.updateNavigation();
      await EditointiStore.cancelAll();
      router.push({ name: 'perusopetusLaajaAlainenOsaaminen', params: { laoId: lao.id } });
    }
  }

  async function remove() {
    if (state.laoId) {
      await PerusopetuksenPerusteenSisalto.deletePerusopetusOsaaminen(state.perusteId!, state.laoId);
      await perusteStore.updateNavigation();
      router.push({ name: 'perusopetusLaajaAlaisetOsaamiset' });
    }
  }

  async function lock() {
    try {
      const res = await PerusopetusLaajaAlainenOsaaminenLukko.checkLockPerusopetusLao(state.perusteId!, state.laoId!);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  async function acquire() {
    const res = await PerusopetusLaajaAlainenOsaaminenLukko.lockPerusopetusLao(state.perusteId!, state.laoId!);
    return res.data;
  }

  async function release() {
    await PerusopetusLaajaAlainenOsaaminenLukko.unlockPerusopetusLao(state.perusteId!, state.laoId!);
  }

  return {
    // Actions
    init,
    editAfterLoad,
    load,
    save,
    remove,
    lock,
    acquire,
    release,
  };
});
