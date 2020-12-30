import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Api, UpdateDtoRakenneModuuliDto, RakenneModuuliDto, TutkinnonRakenne, Perusteet } from '@shared/api/eperusteet';
import { Revision, Page } from '@shared/tyypit';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { config } from 'vue/types/umd';
import { perusteenSuoritustapa } from '@shared/utils/perusteet';
// import { NotifikaatiotStore } from '@shared/stores/NotifikaatiotStore';

Vue.use(VueCompositionApi);

interface MuodostuminenStoreConfig {
  // notifikaatiotStore: NotifikaatiotStore;
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class MuodostuminenStore implements IEditoitava {
  private state = reactive({ });

  private static config: MuodostuminenStoreConfig;

  public static install(vue: typeof Vue, config: MuodostuminenStoreConfig) {
    MuodostuminenStore.config = config;
  }

  constructor(private readonly perusteId: number) {
    // if (!MuodostuminenStore.config?.notifikaatiotStore) {
    //   throw new Error('NotifikaatiotStore missing');
    // }
    if (!MuodostuminenStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!MuodostuminenStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async load() {
    const res = await TutkinnonRakenne.getRakenne(this.perusteId, MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!);
    return {
      rakenne: {
        ...res.data,
        muodostumisSaanto: res.data.muodostumisSaanto || {
          laajuus: {
            minimi: 0,
          },
        },
      },
      osaamisalat: MuodostuminenStore.config?.perusteStore.peruste.value?.osaamisalat || [],
      tutkintonimikkeet: MuodostuminenStore.config?.perusteStore.peruste.value?.tutkintonimikkeet || [],
    };
  }

  public async save(data) {
    const rakenne = data.rakenne;
    await TutkinnonRakenne.updatePerusteenRakenne(this.perusteId, MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!, rakenne as any);
    await Perusteet.updateOsaamisalat(this.perusteId, data.osaamisalat);
    await Perusteet.updateTutkintonimikkeet(this.perusteId, data.tutkintonimikkeet);
    await MuodostuminenStore.config?.perusteStore.updateCurrent();
  }

  public readonly validator = computed(() => {
    return {
    };
  });

  public async history() {
  }

  public async cancel() {
    // Noop
  }

  public async remove() {
  }

  public async lock() {
    try {
      const res = await Api.get(`/perusteet/${this.perusteId}/suoritustavat/reformi/rakenne/lukko`);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    const res = await Api.post(`/perusteet/${this.perusteId}/suoritustavat/reformi/rakenne/lukko`, {
      osanId: this.perusteId,
      suoritustapa: MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!,
    });
    return res.data;
  }

  public async release() {
    await Api.delete(`/perusteet/${this.perusteId}/suoritustavat/reformi/rakenne/lukko`);
  }

  public async preview() {
    return null;
  }

  public async editAfterLoad() {
    return false;
  }

  public async start() {
  }

  public async revisions() {
    const res = await TutkinnonRakenne.getRakenneVersiot(this.perusteId, MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!);
    return res.data as any;
  }

  public async restore(rev: number) {
    await TutkinnonRakenne.revertRakenneVersio(this.perusteId, MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!, rev);
  }

  public async validate() {
    return {
      valid: true,
    };
  }
}
