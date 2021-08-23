import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { MaaraysDto, Maaraykset } from '@shared/api/eperusteet';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class MaarayksetStore {
  private state = reactive({
    maaraykset: null as MaaraysDto[] | null,

  })

  public readonly maaraykset = computed(() => this.state.maaraykset);

  async fetch() {
    this.state.maaraykset = (await Maaraykset.getMaaraykset()).data;
  }

  async tallenna(tallennettava: MaaraysDto) {
    if (tallennettava.id) {
      const tallennettu = (await Maaraykset.updateMaarays(tallennettava.id, tallennettava)).data;
      this.state.maaraykset = _.map(this.state.maaraykset, maarays => maarays.id === tallennettu.id ? tallennettu : maarays);
    }
    else {
      const tallennettu = (await Maaraykset.addMaarays(tallennettava)).data;
      this.state.maaraykset = [
        ...this.state.maaraykset as MaaraysDto[],
        tallennettu,
      ];
    }
  }

  async poista(poistettava: MaaraysDto) {
    await Maaraykset.deleteMaarays(poistettava.id!);
    this.state.maaraykset = _.filter(this.state.maaraykset, maarays => maarays.id !== poistettava.id);
  }
}
