import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { TiedoteDto, Tiedotteet } from '@shared/api/eperusteet';
import _ from 'lodash';
import { ITiedotteetProvider } from '@shared/stores/types';
import { TiedoteQuery } from '@shared/api/types';

Vue.use(VueCompositionApi);

export class TiedotteetStore implements ITiedotteetProvider {
  private state = reactive({
    tiedotteet: null as TiedoteDto[] | null,
    query: {} as TiedoteQuery,
    isLoading: false,
    kokonaismaara: 0,
  })

  public readonly tiedotteet = computed(() => this.state.tiedotteet);
  public readonly perusteId = computed(() => this.state.query.perusteId);
  public readonly kokonaismaara = computed(() => this.state.kokonaismaara);
  public readonly isLoading = computed(() => this.state.isLoading);
  public readonly options = computed(() => this.state.query);

  async init(query: TiedoteQuery) {
    this.state.query = query;
    await this.fetch();
  }

  private async fetchImpl(q: TiedoteQuery) {
    const res = (await Tiedotteet.findTiedotteetBy(
      q.sivu,
      q.sivukoko,
      q.kieli,
      q.nimi,
      q.perusteId,
      q.perusteeton,
      q.julkinen,
      q.yleinen,
      q.tiedoteJulkaisuPaikka,
      q.perusteIds,
      q.koulutusTyyppi,
    )).data as any;
    return res.data;
  }

  public async fetch() {
    this.state.tiedotteet = await this.fetchImpl(this.options.value);
  }

  public async save(tiedote: TiedoteDto) {
    if (_.isNil(tiedote.id)) {
      const tallennettu = (await Tiedotteet.addTiedote(tiedote) as any).data;
      this.state.tiedotteet = [tallennettu, ...this.state.tiedotteet || []];
    }
    else {
      await Tiedotteet.updateTiedote((tiedote as any).id, tiedote);
      const tallennettu = (await Tiedotteet.getTiedote((tiedote as any).id, tiedote) as any).data;
      this.state.tiedotteet = _.map(this.state.tiedotteet, (listaTiedote) => listaTiedote.id === tallennettu.id ? tallennettu : listaTiedote);
    }
  }

  public async delete(tiedote: TiedoteDto) {
    if (tiedote.id) {
      await Tiedotteet.deleteTiedote(tiedote.id);
      this.state.tiedotteet = _.filter(this.state.tiedotteet, (listaTiedote) => listaTiedote.id !== tiedote.id);
    }
  }
}
