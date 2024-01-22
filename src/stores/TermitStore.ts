import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Termit, TermiDto } from '@shared/api/eperusteet';
import _ from 'lodash';
import { ITermiStore, ITermi } from '@shared/components/EpContent/KasiteHandler';

Vue.use(VueCompositionApi);

export class TermitStore implements ITermiStore {
  public state = reactive({
    termit: null as TermiDto[] | null,
  });

  constructor(private readonly perusteId?: number) {
  }

  public readonly termit = computed(() => this.state.termit);

  public async init(perusteId: number) {
    this.state.termit = null;
    this.state.termit = (await Termit.getAllTermit(perusteId)).data;
  }

  public async save(perusteId: number, muokattuTermi: TermiDto) {
    if (!muokattuTermi.avain) {
      muokattuTermi.avain = this.makeKey(muokattuTermi);
    }

    if (muokattuTermi.id) {
      muokattuTermi = (await Termit.updateTermi(perusteId, muokattuTermi.id, muokattuTermi)).data;
      this.state.termit = _.map(this.state.termit, termi => {
        if (termi.id === muokattuTermi.id) {
          return muokattuTermi;
        }
        return termi;
      });
    }
    else {
      muokattuTermi = (await Termit.addTermi(perusteId, muokattuTermi)).data;
      this.state.termit = [
        muokattuTermi,
        ...this.state.termit || [],
      ];
    }
  }

  public async delete(perusteId: number, poistettavaTermi: TermiDto) {
    await Termit.deleteTermi(perusteId, poistettavaTermi.id!);
    this.state.termit = _.filter(this.state.termit, termi => termi.id !== poistettavaTermi.id);
  }

  private makeKey(item) {
    const termi = _.first(_.compact(_.values(item.termi))) || '';
    return termi.replace(/[^a-zA-Z0-9]/g, '') + new Date().getTime();
  }

  getTermi(avain: string) {
    return Termit.getTermi(this.perusteId!, avain);
  }

  getAllTermit() {
    return Termit.getAllTermit(this.perusteId!);
  }

  updateTermi(termiId: number, termi: ITermi) {
    return Termit.updateTermi(this.perusteId!, termiId, termi);
  }

  addTermi(termi: ITermi) {
    return Termit.addTermi(this.perusteId!, {
      ...termi,
      avain: this.makeKey(termi),
    });
  }
}
