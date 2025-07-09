import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusopetuksenPerusteenSisalto, PerusopetusVuosiluokkaKokonaisuusLukko } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';
import { lastIndexOf } from 'lodash';

export class PerusopetusVuosiluokkakokonaisuusStore implements IEditoitava {
  constructor(
    private perusteId: number,
    private vlkId: number | null,
    private perusteStore: PerusteStore,
    private el: any,
  ) {
  }

  async editAfterLoad() {
    return !this.vlkId;
  }

  async load(supportDataProvider) {
    const perusteenLaajaalaisetOsaamiset = (await PerusopetuksenPerusteenSisalto.getOsaamiset(this.perusteId)).data;

    supportDataProvider(
      {
        laajaalaisetOsaamiset: _.chain(perusteenLaajaalaisetOsaamiset)
          .map(lao => ({ ...lao, id: _.toString(lao.id) }))
          .keyBy('id')
          .value(),
      });

    let data = {
      vapaatTekstit: [],
      laajaalaisetOsaamiset: [],
      paikallisestiPaatettavatAsiat: {},
    } as any;

    if (this.vlkId) {
      data = {
        ...data,
        ...(await PerusopetuksenPerusteenSisalto.getVuosiluokkaKokonaisuus(this.perusteId, this.vlkId)).data,
      };
    }

    return {
      ...data,
      laajaalaisetOsaamiset: _.chain(perusteenLaajaalaisetOsaamiset)
        .map(lao => {
          return {
            _laajaalainenOsaaminen: _.toString(lao.id),
            id: _.get(_.find(data.laajaalaisetOsaamiset, { _laajaalainenOsaaminen: _.toString(lao.id) }), 'id'),
            kuvaus: _.get(_.find(data.laajaalaisetOsaamiset, { _laajaalainenOsaaminen: _.toString(lao.id) }), 'kuvaus'),
          };
        })
        .sortBy('_laajaalainenOsaaminen')
        .value(),
    };
  }

  async save(data: any) {
    if (this.vlkId) {
      await PerusopetuksenPerusteenSisalto.updateVuosiluokkaKokonaisuus(this.perusteId, this.vlkId, data);
      await this.perusteStore.updateNavigation();
    }
    else {
      const vlkId = (await PerusopetuksenPerusteenSisalto.addVuosiluokkaKokonaisuus(this.perusteId, data)).data;
      this.vlkId = vlkId.id!;
      await this.perusteStore.updateNavigation();
      await EditointiStore.cancelAll();
      this.el.$router.push({ name: 'perusopetusVuosiluokkakokonaisuus', params: { vlkId: vlkId.id } });
    }
  }

  public async remove() {
    if (this.vlkId) {
      await PerusopetuksenPerusteenSisalto.deleteVuosiluokkaKokonaisuus(this.perusteId, this.vlkId);
      await this.perusteStore.updateNavigation();
      this.el.$router.push({ name: 'perusopetusVuosiluokkakokonaisuudet' });
    }
  }

  public async lock() {
    if (!this.vlkId) {
      return null;
    }

    try {
      const res = await PerusopetusVuosiluokkaKokonaisuusLukko.checkLockPerusopetusVlk(this.perusteId, this.vlkId!);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    if (this.vlkId) {
      const res = await PerusopetusVuosiluokkaKokonaisuusLukko.lockPerusopetusVlk(this.perusteId, this.vlkId!);
      return res.data;
    }

    return null;
  }

  public async release() {
    if (this.vlkId) {
      await PerusopetusVuosiluokkaKokonaisuusLukko.unlockPerusopetusVlk(this.perusteId, this.vlkId!);
    }
  }
}
