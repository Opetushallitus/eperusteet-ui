import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Matala, Perusteenosat, Sisallot, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import { Revision, Page } from '@shared/tyypit';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
// import { NotifikaatiotStore } from '@shared/stores/NotifikaatiotStore';

Vue.use(VueCompositionApi);

interface JarjestysStoreConfig {
}

export class JarjestysStore implements IEditoitava {
  private static config: JarjestysStoreConfig;

  public static install(vue: typeof Vue, config: JarjestysStoreConfig) {
    JarjestysStore.config = config;
  }

  constructor(
    private readonly stores: { [key: string]: IEditoitava },
  ) {
  }

  public async load() {
    if (!_.isEmpty(this.stores)) {

      // const data = _.assign(...await Promise.all(_.map(this.stores, async (v, k) => ({
      //   [k]: await v.load(() => {}),
      // })) as any));
      // return data;

      return await Promise.all(_.map(this.stores, async (v, k) => ({
        [k]: await v.load(() => {}),
      })) as any);
    }
    return {};
  }

  public async save(data) {
    await Promise.all(_.map(this.stores, async (v, k) => {
      if (v && v.save) {
        const res = await v.save(data[k]);
      }
    }));
  }

  public async preview() {
    return null;
  }

  public async editAfterLoad() {
    return false;
  }

  public readonly validator = computed(() => ({}));
}
