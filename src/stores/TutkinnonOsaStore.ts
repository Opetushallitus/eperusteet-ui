import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { TutkinnonOsaViiteDto, TutkinnonRakenne } from '@shared/api/eperusteet';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import _ from 'lodash';
import { pinia } from '.';
import { usePerusteStore } from '@/stores/PerusteStore';

export const useTutkinnonOsaStore = defineStore('tutkinnonOsa', () => {
  // State
  const tutkinnonOsat = ref<TutkinnonOsaViiteDto[] | null>(null);

  // Reference to Peruste store - will be initialized in initialize method
  const perusteStore = usePerusteStore(pinia)

  // Actions
  async function fetch() {
    if (!perusteStore) return;

    const perusteId = perusteStore.perusteId;
    const st = perusteStore.suoritustavat;
    if (perusteId && st) {
      tutkinnonOsat.value = null;
      await init(perusteId, st);
    }
  }

  async function init(projektiId: number, suoritustapakoodit: readonly string[]) {
    if (!_.isEmpty(suoritustapakoodit)) {
      const tutkinnonosatData = _.chain(await Promise.all(
        _.map(suoritustapakoodit, suoritustapakoodi => TutkinnonRakenne.getPerusteenTutkinnonOsat(projektiId, (suoritustapakoodi as any)))))
        .map('data')
        .flatMap()
        .sortBy('jarjestys')
        .value();
      tutkinnonOsat.value = tutkinnonosatData;
    }
    else {
      tutkinnonOsat.value = [];
    }
  }

  async function load() {
    await fetch();
    return tutkinnonOsat.value;
  }

  async function save(data: any[]) {
    if (!perusteStore) return null;

    const perusteId = perusteStore.perusteId;
    const st = perusteStore.suoritustavat?.[0] as any;
    const payload = _.map(data, (tosa, idx) => ({
      id: tosa.id,
      jarjestys: idx,
    }));
    const res = await TutkinnonRakenne.sortPerusteenOsaViitteet(perusteId!, st, payload);
    return res.data;
  }

  async function editAfterLoad() {
    return false;
  }

  async function preview() {
    return null;
  }

  const features = computed(() => ({
    editable: false,
  }));

  return {
    // State
    tutkinnonOsat,

    // Actions
    fetch,
    init,
    load,
    save,
    editAfterLoad,
    preview,
    features,
  };
});

