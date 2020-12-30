import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Matala, Perusteenosat, Sisallot, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import { Revision, Page } from '@shared/tyypit';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
// import { NotifikaatiotStore } from '@shared/stores/NotifikaatiotStore';

Vue.use(VueCompositionApi);

interface TekstiRakenneStoreConfig {
  // notifikaatiotStore: NotifikaatiotStore;
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class TekstiRakenneStore implements IEditoitava {
  private state = reactive({
    tekstikappale: null as Matala | null,
  });

  private static config: TekstiRakenneStoreConfig;

  public static install(vue: typeof Vue, config: TekstiRakenneStoreConfig) {
    TekstiRakenneStore.config = config;
  }

  public readonly tekstikappale = computed(() => this.state.tekstikappale);
  public readonly id = computed(() => this.state.tekstikappale?.id);

  constructor(private readonly perusteId: number) {
    // if (!TekstiRakenneStore.config?.notifikaatiotStore) {
    //   throw new Error('NotifikaatiotStore missing');
    // }
    if (!TekstiRakenneStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!TekstiRakenneStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async load() {
    const res = await Sisallot.getSuoritustapaSisaltoUUSI(this.perusteId, TekstiRakenneStore.config?.perusteStore.perusteSuoritustapa.value!);
    return res.data;
  }

  public async save(data: Matala) {
    function pick(obj: Matala) {
      return {
        id: obj.id,
        lapset: _.map(obj.lapset, pick),
        perusteenOsa: null,
      };
    }

    const filtered = pick(data);
    if (data.id) {
      await Sisallot.updateSisaltoViiteWithPut(this.perusteId, TekstiRakenneStore.config?.perusteStore.perusteSuoritustapa.value!, data.id!, filtered);
      await TekstiRakenneStore.config.perusteStore.updateNavigation();
    }
  }

  public async history() {
  }

  public async cancel() {
    // Noop
  }

  public async remove() {
  }

  public async lock() {
    return null;
  }

  public async acquire() {
    return null;
  }

  public async release() {
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
    return [];
  }

  public async restore(rev: number) {
  }

  public readonly validator = computed(() => ({}));
}
