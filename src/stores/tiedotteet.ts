import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { PageTiedoteDto, TiedoteDto } from '@/tyypit';
import { Tiedotteet } from '@/api';
import _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
Vue.use(VueCompositionApi);

export class TiedotteetStore {
  private state = reactive({
    tiedotteet: [] as TiedoteDto[],
  })

  public readonly tiedotteet = computed(() => this.state.tiedotteet);

  public async fetch() {
    const res = (await Tiedotteet.findTiedotteetBy(
      0,
      99999,
      undefined, // kieli
      undefined, // nimi
      undefined, // perusteId
      undefined, // perusteeton
      undefined, // julkinen
      undefined // yleinen
    )).data as any;

    this.state.tiedotteet = res.data;
  }

  public async save(tiedote) {

    if(_.isNil(tiedote.id)) {
      const tallennettu = (await Tiedotteet.addTiedote(tiedote) as any).data;
      this.state.tiedotteet.unshift(tallennettu);
    }
    else {
      await Tiedotteet.updateTiedote((tiedote as any).id, tiedote);
      const tallennettu = (await Tiedotteet.getTiedote((tiedote as any).id, tiedote) as any).data;
      this.state.tiedotteet = _.map(this.state.tiedotteet, (listaTiedote) => listaTiedote.id === tallennettu.id ? tallennettu : listaTiedote);
    }

  }

  public async delete(tiedote) {
    await Tiedotteet.deleteTiedote(tiedote.id);
    this.state.tiedotteet = _.filter(this.state.tiedotteet, (listaTiedote) => listaTiedote.id !== tiedote.id);
  }

}

export const TiedoteStore = new TiedotteetStore();
