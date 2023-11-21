import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { MuuMaaraysDto, MuutMaaraykset } from '@shared/api/eperusteet';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class MuutMaarayksetStore {
  private state = reactive({
    maaraykset: null as MuuMaaraysDto[] | null,

  })

  public readonly maaraykset = computed(() => this.state.maaraykset);

  async fetch() {
    this.state.maaraykset = (await MuutMaaraykset.getMuutMaaraykset()).data;
  }

  async tallenna(tallennettava: MuuMaaraysDto) {
    if (tallennettava.id) {
      const tallennettu = (await MuutMaaraykset.updateMuuMaarays(tallennettava.id, tallennettava)).data;
      this.state.maaraykset = _.map(this.state.maaraykset, maarays => maarays.id === tallennettu.id ? tallennettu : maarays);
    }
    else {
      const tallennettu = (await MuutMaaraykset.addMuuMaarays(tallennettava)).data;
      this.state.maaraykset = [
        ...this.state.maaraykset as MuuMaaraysDto[],
        tallennettu,
      ];
    }
  }

  async poista(poistettava: MuuMaaraysDto) {
    await MuutMaaraykset.deleteMuuMaarays(poistettava.id!);
    this.state.maaraykset = _.filter(this.state.maaraykset, maarays => maarays.id !== poistettava.id);
  }
}
