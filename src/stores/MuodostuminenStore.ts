import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Api, UpdateDtoRakenneModuuliDto, RakenneModuuliDto, TutkinnonRakenne } from '@shared/api/eperusteet';
import { Revision, Page } from '@shared/tyypit';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
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
    const res = await TutkinnonRakenne.getRakenne(this.perusteId, 'REFORMI');
    return {
      ...res.data,
      muodostumisSaanto: res.data.muodostumisSaanto || {
        laajuus: {
          minimi: 0,
        },
      },
    };
  }

  public async save(data: RakenneModuuliDto) {
    await TutkinnonRakenne.updatePerusteenRakenne(this.perusteId, 'REFORMI', data as any);
  }

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
      suoritustapa: 'reformi',
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
    const res = await TutkinnonRakenne.getRakenneVersiot(this.perusteId, 'REFORMI');
    return res.data as any;
  }

  public async restore(rev: number) {
    await TutkinnonRakenne.revertRakenneVersio(this.perusteId, 'REFORMI', rev);
  }

  public async validate() {
    return {
      valid: true,
    };
  }
}

