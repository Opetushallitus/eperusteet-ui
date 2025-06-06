import { defineStore } from 'pinia';
import { ref } from 'vue';
import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Aipeopetuksensisalto, LaajaalainenOsaaminenDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { usePerusteStore } from './PerusteStore';
import { Revision } from '@shared/tyypit';
import { useRouter } from 'vue-router';

export const useAipeVaiheStore = defineStore('aipeVaihe', () => {
  // State
  const perusteId = ref<number | null>(null);
  const vaiheId = ref<number | null>(null);
  const versionumero = ref<number | undefined>(undefined);
  const router = useRouter();

  // Actions
  function initialize(perusteIdParam: number, vaiheIdParam: number | null, versionumeroParam?: number) {
    perusteId.value = perusteIdParam;
    vaiheId.value = vaiheIdParam;
    versionumero.value = versionumeroParam;
  }

  async function acquire() {
    return null;
  }

  async function editAfterLoad() {
    return !vaiheId.value;
  }

  async function load() {
    if (vaiheId.value) {
      if (versionumero.value) {
        const revisions = (await Aipeopetuksensisalto.getVaiheVersiot(perusteId.value!, vaiheId.value!)).data as Revision[];
        const rev = revisions[revisions.length - versionumero.value];
        return (await Aipeopetuksensisalto.getVaihe(perusteId.value!, vaiheId.value, rev.numero)).data;
      }
      else {
        return (await Aipeopetuksensisalto.getVaihe(perusteId.value!, vaiheId.value)).data;
      }
    }

    return {
      vapaatTekstit: [],
      opetuksenKohdealueet: [],
    };
  }

  async function save(data: any) {
    const perusteStore = usePerusteStore();

    if (vaiheId.value) {
      await Aipeopetuksensisalto.updateVaihe(perusteId.value!, vaiheId.value, data);
      if (_.size(data.oppiaineet) > 0) {
        await Aipeopetuksensisalto.updateOppiaineetJarjestys(perusteId.value!, vaiheId.value, data.oppiaineet);
      }
      await perusteStore.updateNavigation();
    }
    else {
      const newData = (await Aipeopetuksensisalto.addVaihe(perusteId.value!, data)).data;
      await perusteStore.updateNavigation();

      await EditointiStore.cancelAll();
      router.push({ name: 'aipevaihe', params: { vaiheId: newData.id } });
    }
  }

  async function remove() {
    const perusteStore = usePerusteStore();

    if (vaiheId.value) {
      await Aipeopetuksensisalto.removeVaihe(perusteId.value!, vaiheId.value);
      await perusteStore.updateNavigation();
      router.push({ name: 'perusteprojekti' });
    }
  }

  async function revisions() {
    if (vaiheId.value) {
      const res = await Aipeopetuksensisalto.getVaiheVersiot(perusteId.value!, vaiheId.value!);
      return res.data as Revision[];
    }
    return [];
  }

  async function restore(rev: number) {
    await Aipeopetuksensisalto.revertVaihe(perusteId.value!, vaiheId.value!, rev);
  }

  // Create an IEditoitava instance
  const editoitava: IEditoitava = {
    acquire,
    editAfterLoad,
    load,
    save,
    remove,
    revisions,
    restore,
  };

  return {
    // State
    perusteId,
    vaiheId,
    versionumero,

    // Actions
    initialize,
    acquire,
    editAfterLoad,
    load,
    save,
    remove,
    revisions,
    restore,

    // IEditoitava interface implementation
    editoitava,
  };
});
