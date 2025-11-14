import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusopetuksenPerusteenSisalto, PerusopetusLaajaAlainenOsaaminenLukko } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';
import { App } from 'vue';
import { Router } from 'vue-router';

interface PerusopetusLaajaAlainenOsaaminenStoreConfig {
  router: Router;
}

export class PerusopetusLaajaAlainenOsaaminenStore implements IEditoitava {
  private static config: PerusopetusLaajaAlainenOsaaminenStoreConfig;

  public static install(app: App, config: PerusopetusLaajaAlainenOsaaminenStoreConfig) {
    PerusopetusLaajaAlainenOsaaminenStore.config = config;
  }

  constructor(
    private perusteId: number,
    private laoId: number | null,
    private perusteStore: PerusteStore,
  ) {
  }

  async editAfterLoad() {
    return !this.laoId;
  }

  async load() {
    if (this.laoId) {
      return (await PerusopetuksenPerusteenSisalto.getOsaaminen(this.perusteId, this.laoId)).data;
    }

    return {};
  }

  async save(data: any) {
    if (this.laoId) {
      await PerusopetuksenPerusteenSisalto.updateOsaaminen(this.perusteId, this.laoId, data);
      await this.perusteStore.updateNavigation();
    }
    else {
      const lao = (await PerusopetuksenPerusteenSisalto.addOsaaminen(this.perusteId, data)).data;
      this.laoId = lao.id!;
      await this.perusteStore.updateNavigation();
      await EditointiStore.cancelAll();
      PerusopetusLaajaAlainenOsaaminenStore.config.router.push({ name: 'perusopetusLaajaAlainenOsaaminen', params: { laoId: lao.id } });
    }
  }

  public async remove() {
    if (this.laoId) {
      await PerusopetuksenPerusteenSisalto.deletePerusopetusOsaaminen(this.perusteId, this.laoId);
      await this.perusteStore.updateNavigation();
      PerusopetusLaajaAlainenOsaaminenStore.config.router.push({ name: 'perusopetusLaajaAlaisetOsaamiset' });
    }
  }

  public async lock() {
    try {
      const res = await PerusopetusLaajaAlainenOsaaminenLukko.checkLockPerusopetusLao(this.perusteId, this.laoId!);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    const res = await PerusopetusLaajaAlainenOsaaminenLukko.lockPerusopetusLao(this.perusteId, this.laoId!);
    return res.data;
  }

  public async release() {
    await PerusopetusLaajaAlainenOsaaminenLukko.unlockPerusopetusLao(this.perusteId, this.laoId!);
  }
}
