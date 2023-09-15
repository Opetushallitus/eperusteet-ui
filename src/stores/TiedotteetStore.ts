import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { TiedoteDto, Tiedotteet } from '@shared/api/eperusteet';
import _ from 'lodash';
import { ITiedotteetProvider } from '@shared/stores/types';
import { TiedoteQuery } from '@shared/api/types';
import { Debounced } from '@shared/utils/delay';
import { Page } from '@shared/tyypit';

Vue.use(VueCompositionApi);

export class TiedotteetStore implements ITiedotteetProvider {
  private state = reactive({
    tiedotteetPage: null as Page<TiedoteDto> | null,
    query: {} as TiedoteQuery,
    isLoading: false,
    kokonaismaara: 0,
  })

  public readonly tiedotteet = computed(() => this.state.tiedotteetPage?.data || null);
  public readonly tiedotteetPage = computed(() => this.state.tiedotteetPage);
  public readonly perusteId = computed(() => this.state.query.perusteId);
  public readonly kokonaismaara = computed(() => this.state.tiedotteetPage?.kokonaismäärä);
  public readonly isLoading = computed(() => this.state.isLoading);
  public readonly options = computed(() => this.state.query);

  clear() {
    this.state.tiedotteetPage = null;
  }

  async init(query: TiedoteQuery) {
    this.state.query = query;
    this.state.tiedotteetPage = null;
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
      q.jarjestys,
      q.jarjestysNouseva,
    )).data as any;
    return res;
  }

  @Debounced(300)
  public async fetch() {
    this.state.tiedotteetPage = null;
    this.state.tiedotteetPage = await this.fetchImpl(this.options.value);
  }

  public async save(tiedote: TiedoteDto) {
    if (_.isNil(tiedote.id)) {
      const tallennettu = (await Tiedotteet.addTiedote(tiedote) as any).data;
      this.state.tiedotteetPage!.data = [tallennettu, ...this.state.tiedotteetPage!.data || []];
    }
    else {
      await Tiedotteet.updateTiedote((tiedote as any).id, tiedote);
      const tallennettu = (await Tiedotteet.getTiedote((tiedote as any).id, tiedote) as any).data;
      this.state.tiedotteetPage!.data = _.map(this.state.tiedotteetPage!.data, (listaTiedote) => listaTiedote.id === tallennettu.id ? tallennettu : listaTiedote);
    }
  }

  public async delete(tiedote: TiedoteDto) {
    if (tiedote.id) {
      await Tiedotteet.deleteTiedote(tiedote.id);
      this.state.tiedotteetPage!.data = _.filter(this.state.tiedotteetPage!.data, (listaTiedote) => listaTiedote.id !== tiedote.id);
    }
  }
}
