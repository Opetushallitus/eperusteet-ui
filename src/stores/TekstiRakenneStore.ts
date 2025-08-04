import Vue from 'vue';
import { reactive, computed } from 'vue';
import { Matala, Sisallot } from '@shared/api/eperusteet';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { App } from 'vue';

interface TekstiRakenneStoreConfig {
  perusteStore: PerusteStore;
  router: any;
}

export class TekstiRakenneStore implements IEditoitava {
  private state = reactive({
    tekstikappale: null as Matala | null,
  });

  private static config: TekstiRakenneStoreConfig;

  public static install(app: App, config: TekstiRakenneStoreConfig) {
    TekstiRakenneStore.config = config;
  }

  public readonly tekstikappale = computed(() => this.state.tekstikappale);
  public readonly id = computed(() => this.state.tekstikappale?.id);

  constructor(private readonly perusteId: number) {
    if (!TekstiRakenneStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!TekstiRakenneStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async load() {
    const res = await Sisallot.getSuoritustapaSisaltoUUSI(this.perusteId, TekstiRakenneStore.config.perusteStore.perusteSuoritustapa.value!, 'laaja');
    return res.data;
  }

  public async save(data: Matala) {
    function pick(obj: Matala) {
      return {
        id: obj.id,
        lapset: _.map(sortPerusteenOsat(obj.lapset), pick),
        perusteenOsa: null,
      };
    }

    function sortPerusteenOsat(lapset) {
      // Sortataan, että tutkinnon muodostuminen on ensimmäisenä
      const sortedByRakenne = _.sortBy(lapset, lapsi => {
        return lapsi.perusteenOsa.tunniste !== 'rakenne';
      });
      // Liitteet perälle
      return _.sortBy(sortedByRakenne, 'perusteenOsa.liite');
    }

    const filtered = pick(data);
    if (data.id) {
      await Sisallot.updateSisaltoViiteWithPut(this.perusteId, TekstiRakenneStore.config.perusteStore.perusteSuoritustapa.value!, data.id!, filtered);
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
