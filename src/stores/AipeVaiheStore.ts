import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Aipeopetuksensisalto, LaajaalainenOsaaminenDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';

export class AipeVaiheStore implements IEditoitava {
  constructor(
    private perusteId: number,
    private vaiheId: number | null,
    private perusteStore: PerusteStore,
    private el: any,
  ) {
  }

  async acquire() {
    return null;
  }

  async editAfterLoad() {
    return !this.vaiheId;
  }

  async load() {
    if (this.vaiheId) {
      return (await Aipeopetuksensisalto.getVaihe(this.perusteId, this.vaiheId)).data;
    }

    return {
      vapaatTekstit: [],
      opetuksenKohdealueet: [],
    };
  }

  async save(data: any) {
    if (this.vaiheId) {
      await Aipeopetuksensisalto.updateVaihe(this.perusteId, this.vaiheId, data);
      if (_.size(data.oppiaineet) > 0) {
        await Aipeopetuksensisalto.updateOppiaineetJarjestys(this.perusteId, this.vaiheId, data.oppiaineet);
      }
      await this.perusteStore.updateNavigation();
    }
    else {
      const newData = (await Aipeopetuksensisalto.addVaihe(this.perusteId, data)).data;
      await this.perusteStore.updateNavigation();

      await EditointiStore.cancelAll();
      this.el.$router.push({ name: 'aipevaihe', params: { vaiheId: newData.id } });
    }
  }

  public async remove() {
    if (this.vaiheId) {
      await Aipeopetuksensisalto.removeVaihe(this.perusteId, this.vaiheId);
      await this.perusteStore.updateNavigation();
      this.el.$router.push({ name: 'perusteprojekti' });
    }
  }
}
