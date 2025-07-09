import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Aipeopetuksensisalto, LaajaalainenOsaaminenDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';
import { Revision } from '@shared/tyypit';
import { App } from 'vue';
import { Router } from 'vue-router';

interface AipeKurssiStoreConfig {
  router: Router;
}

export class AipeKurssiStore implements IEditoitava {
  private static config: AipeKurssiStoreConfig;

  public static install(app: App, config: AipeKurssiStoreConfig) {
    AipeKurssiStore.config = config;
  }

  constructor(
    private perusteId: number,
    private vaiheId: number,
    private oppiaineId: number,
    private kurssiId: number | null,
    private perusteStore: PerusteStore,
    public versionumero?: number,
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
      if (this.versionumero) {
        const revisions = (await Aipeopetuksensisalto.getKurssiVersiot(this.perusteId, this.vaiheId!, this.oppiaineId, this.kurssiId)).data as Revision[];
        const rev = revisions[revisions.length - this.versionumero];
        return (await Aipeopetuksensisalto.getAipeKurssi(this.perusteId, this.vaiheId, this.oppiaineId, this.kurssiId, rev.numero)).data;
      }
      else {
        return (await Aipeopetuksensisalto.getAipeKurssi(this.perusteId, this.vaiheId, this.oppiaineId, this.kurssiId)).data;
      }
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
      AipeKurssiStore.config.router.push({ name: 'aipekurssi', params: { kurssiId: this.kurssiId } });
    }

    await this.perusteStore.updateNavigation();
  }

  public async remove() {
    if (this.kurssiId) {
      await Aipeopetuksensisalto.removeAipeKurssi(this.perusteId, this.vaiheId, this.oppiaineId, this.kurssiId);
      await this.perusteStore.updateNavigation();
      AipeKurssiStore.config.router.push({ name: 'aipeoppiaine', params: { oppiaineID: this.oppiaineId } });
    }
  }

  public async revisions() {
    if (this.kurssiId) {
      const res = await Aipeopetuksensisalto.getKurssiVersiot(this.perusteId, this.vaiheId!, this.oppiaineId!, this.kurssiId);
      return res.data as Revision[];
    }

    return [];
  }

  public async restore(rev: number) {
    await Aipeopetuksensisalto.revertKurssi(this.perusteId, this.vaiheId!, this.oppiaineId!, this.kurssiId!, rev);
  }
}
