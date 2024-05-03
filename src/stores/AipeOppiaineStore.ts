import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Aipeopetuksensisalto, LaajaalainenOsaaminenDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';

export class AipeOppiaineStore implements IEditoitava {
  constructor(
    private perusteId: number,
    private vaiheId: number,
    private oppiaineId: number | null,
    private parentId: number | null,
    private perusteStore: PerusteStore,
    private el: any,
  ) {
  }

  async acquire() {
    return null;
  }

  async editAfterLoad() {
    return !this.oppiaineId;
  }

  async load(supportDataProvider) {
    supportDataProvider({
      kohdealueet: _.get((await Aipeopetuksensisalto.getVaihe(this.perusteId, this.vaiheId)).data, 'opetuksenKohdealueet'),
      laajaAlaisetOsaamiset: (await Aipeopetuksensisalto.getAipeOsaamiset(this.perusteId)).data,
    });

    if (this.oppiaineId) {
      const oppiaine = (await Aipeopetuksensisalto.getAipeOppiaine(this.perusteId, this.vaiheId, this.oppiaineId)).data;
      const oppimaarat = (await Aipeopetuksensisalto.getAipeOppimaarat(this.perusteId, this.vaiheId, this.oppiaineId)).data;

      return {
        ...oppiaine,
        tavoitteet: _.map(oppiaine.tavoitteet, tavoite => {
          return {
            ...tavoite,
            arvioinninkohteet: _.sortBy(tavoite.arvioinninkohteet, 'arvosana'),
          };
        }),
        oppimaarat,
      };
    }

    return {
      vapaatTekstit: [],
      tavoitteet: [],
    };
  }

  async save(data: any) {
    if (this.oppiaineId) {
      await Aipeopetuksensisalto.updateAipeOppiaine(this.perusteId, this.vaiheId, this.oppiaineId, data);
      if (_.size(data.kurssit) > 0) {
        await Aipeopetuksensisalto.updateKurssitJarjestys(this.perusteId, this.vaiheId, this.oppiaineId, data.kurssit);
      }
      if (_.size(data.oppimaarat) > 0) {
        await Aipeopetuksensisalto.updateOppimaaratJarjestys(this.perusteId, this.vaiheId, this.oppiaineId, data.oppimaarat);
      }
      await this.perusteStore.updateNavigation();
    }

    let newData;
    if (this.parentId) {
      newData = (await Aipeopetuksensisalto.addAipeOppimaara(this.perusteId, this.vaiheId, this.parentId, data)).data;
    }

    if (!this.oppiaineId && !this.parentId) {
      newData = (await Aipeopetuksensisalto.addAipeOppiaine(this.perusteId, this.vaiheId, data)).data;
    }

    if (newData) {
      await this.perusteStore.updateNavigation();
      await EditointiStore.cancelAll();
      this.el.$router.push({ name: 'aipeoppiaine', params: { oppiaineId: newData.id } });
    }
  }

  public async remove() {
    if (this.oppiaineId) {
      await Aipeopetuksensisalto.removeAipeOppiaine(this.perusteId, this.vaiheId, this.oppiaineId);
      await this.perusteStore.updateNavigation();
      this.el.$router.push({ name: 'aipevaihe', params: { vaiheId: this.vaiheId } });
    }
  }
}
