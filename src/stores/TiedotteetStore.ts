import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { TiedoteDto, Tiedotteet } from '@shared/api/eperusteet';
import _ from 'lodash';
import { ITiedotteetProvider } from '@shared/stores/types';

Vue.use(VueCompositionApi);

export class TiedotteetStore implements ITiedotteetProvider {
  private state = reactive({
    tiedotteet: null as TiedoteDto[] | null,
    perusteenTiedotteet: null as TiedoteDto[] | null,
    perusteId: null as number | null,
  })

  public readonly tiedotteet = computed(() => this.state.tiedotteet);
  public readonly perusteenTiedotteet = computed(() => this.state.perusteenTiedotteet);
  public readonly perusteId = computed(() => this.state.perusteId);

  async init(perusteId: number) {
    this.state.perusteId = perusteId;
    this.state.perusteenTiedotteet = null;
    const res = (await Tiedotteet.findTiedotteetBy(
      0,
      99999,
      undefined, // kieli
      undefined, // nimi
      undefined, // perusteId
      undefined, // perusteeton
      undefined, // julkinen
      undefined, // yleinen
      undefined, // julkaisupaikat
      [perusteId] // perusteet
    )).data as any;

    this.state.perusteenTiedotteet = res.data;
  }

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

  public async save(tiedote: TiedoteDto) {
    if (_.isNil(tiedote.id)) {
      const tallennettu = (await Tiedotteet.addTiedote(tiedote) as any).data;
      this.state.tiedotteet = [tallennettu, ...this.state.tiedotteet || []];

      if (_.includes(_.map(tiedote.perusteet, 'id'), this.state.perusteId)) {
        this.state.perusteenTiedotteet = [
          tallennettu,
          ...this.state.perusteenTiedotteet || [],
        ];
      }
    }
    else {
      await Tiedotteet.updateTiedote((tiedote as any).id, tiedote);
      const tallennettu = (await Tiedotteet.getTiedote((tiedote as any).id, tiedote) as any).data;
      this.state.tiedotteet = _.map(this.state.tiedotteet, (listaTiedote) => listaTiedote.id === tallennettu.id ? tallennettu : listaTiedote);

      if (_.includes(_.map(tiedote.perusteet, 'id'), this.state.perusteId)) {
        this.state.perusteenTiedotteet = _.map(this.state.perusteenTiedotteet, (listaTiedote) => listaTiedote.id === tallennettu.id ? tallennettu : listaTiedote);
      }
      else {
        this.state.perusteenTiedotteet = _.filter(this.state.perusteenTiedotteet, (listaTiedote) => listaTiedote.id !== tallennettu.id);
      }
    }
  }

  public async delete(tiedote: TiedoteDto) {
    if (tiedote.id) {
      await Tiedotteet.deleteTiedote(tiedote.id);
      this.state.tiedotteet = _.filter(this.state.tiedotteet, (listaTiedote) => listaTiedote.id !== tiedote.id);
      this.state.perusteenTiedotteet = _.filter(this.state.perusteenTiedotteet, (listaTiedote) => listaTiedote.id !== tiedote.id);
    }
  }
}
