import { reactive, computed, ref, watch } from 'vue';
import { Termit, TermiDto } from '@shared/api/eperusteet';
import _ from 'lodash';
import { ITermiStore, ITermi } from '@shared/components/EpContent/KasiteHandler';

export class TermitStore implements ITermiStore {
  public state = reactive({
    termit: null as TermiDto[] | null,
    perusteId: null as number | null,
  });

  public readonly termit = computed(() => this.state.termit);

  public async init(perusteId) {
    this.state.perusteId = perusteId;
    this.state.termit = null;
    this.state.termit = (await Termit.getAllTermit(perusteId)).data;

    return this;
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

    return muokattuTermi;
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
    return _.find(this.termit.value, termi => termi.avain === avain);
  }

  getAllTermit() {
    return this.state.termit || [];
  }

  async updateOrAddTermi(termi: ITermi) {
    return await this.save(this.state.perusteId!, termi);
  }
}
