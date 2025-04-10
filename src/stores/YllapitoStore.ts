import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Maintenance, PerusteDto, Perusteet, PerusteKevytDto, YllapitoDto } from '@shared/api/eperusteet';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class YllapitoStore {
  private state = reactive({
    julkisivunPerusteet: null as PerusteKevytDto[] | null,
  });

  public readonly julkisivunPerusteet = computed(() => this.state.julkisivunPerusteet);

  public async fetchJulkisivunPerusteet() {
    this.state.julkisivunPerusteet = null;
    this.state.julkisivunPerusteet = (await Perusteet.getJulkaistutKoostePerusteet()).data;
  }

  public async tallennaJulkisivunPerusteet(perusteet: PerusteKevytDto[]) {
    await Perusteet.updateJulkaistutKoostePerusteet(perusteet);
    this.state.julkisivunPerusteet = perusteet;
  }

  public async fetch() {
    return _.sortBy((await Maintenance.getYllapidot()).data, 'key');
  }

  public async save(data: YllapitoDto[]) {
    await Maintenance.updateYllapito(data);
  }
}
