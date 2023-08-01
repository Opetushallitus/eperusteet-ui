import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Maintenance, YllapitoDto } from '@shared/api/eperusteet';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class YllapitoStore {
  public async fetch() {
    return _.sortBy((await Maintenance.getYllapidot()).data, 'key');
  }

  public async save(data: YllapitoDto[]) {
    await Maintenance.updateYllapito(data);
  }
}
