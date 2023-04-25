import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Aipeopetuksensisalto, LaajaalainenOsaaminenDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';

export class AipeKurssiStore implements IEditoitava {
  constructor(
    private perusteId: number,
    private vaiheId: number,
    private oppiaineId: number,
    private kurssiId: number | null,
    private perusteStore: PerusteStore,
    private el: any,
  ) {
  }

  async acquire() {
    return null;
  }

  async editAfterLoad() {
    return !this.kurssiId;
  }

  async load(supportDataProvider) {
    const oppiaine = (await Aipeopetuksensisalto.getAipeOppiaine(this.perusteId, this.vaiheId, this.oppiaineId)).data;
    supportDataProvider({ tavoitteet: oppiaine.tavoitteet });

    if (this.kurssiId) {
      return (await Aipeopetuksensisalto.getAipeKurssi(this.perusteId, this.vaiheId, this.oppiaineId, this.kurssiId)).data;
    }

    return {};
  }

  async save(data: any) {
    if (this.kurssiId) {
      await Aipeopetuksensisalto.updateAipeKurssi(this.perusteId, this.vaiheId, this.oppiaineId, this.kurssiId, data);
    }

    if (!this.kurssiId) {
      const newData = (await Aipeopetuksensisalto.addAipeKurssi(this.perusteId, this.vaiheId, this.oppiaineId, data)).data;
      this.kurssiId = newData.id!;

      await EditointiStore.cancelAll();
      this.el.$router.push({ name: 'aipekurssi', params: { kurssiId: this.kurssiId } });
    }

    await this.perusteStore.updateNavigation();
  }

  public async remove() {
    if (this.kurssiId) {
      await Aipeopetuksensisalto.removeAipeKurssi(this.perusteId, this.vaiheId, this.oppiaineId, this.kurssiId);
      await this.perusteStore.updateNavigation();
      this.el.$router.push({ name: 'aipeoppiaine', params: { oppiaineID: this.oppiaineId } });
    }
  }
}
