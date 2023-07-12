import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Maintenance } from '@shared/api/eperusteet';
import { YllapitoDto } from '@shared/generated/eperusteet';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';

Vue.use(VueCompositionApi);

export class YllapitoStore implements IEditoitava {
  public state = reactive({
    yllapito: null as YllapitoDto[] | null,
  });

  public readonly yllapito = computed(() => this.state.yllapito);

  public async fetch() {
    try {
      this.state.yllapito = (await Maintenance.getYllapidot()).data;
    }
    catch (e) {
      this.state.yllapito = [];
    }
  }

  public async load() {
    await this.fetch();
    return this.yllapito.value;
  }

  public async save(data: YllapitoDto[]) {
    const res = await Maintenance.updateYllapito(data);
    return res.data;
  }

  public async editAfterLoad() {
    return false;
  }
}
