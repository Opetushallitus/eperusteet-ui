import { PerusopetuksenPerusteenSisalto, PerusopetusOppiaineLukko, PerusopetusOppiaineVlkLukko } from '@shared/api/eperusteet';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { computed } from '@vue/composition-api';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';
import { required } from 'vuelidate/lib/validators';

export class PerusopetusOppiaineStore implements IEditoitava {
  constructor(
    private perusteId: number,
    private oppiaineId: number,
    private perusteStore: PerusteStore,
    private uusi: boolean,
    private el: any,
  ) {
  }

  async editAfterLoad() {
    return this.uusi;
  }

  async load(supportDataProvider) {
    const perusteenVuosiluokkakokonaisuudet = (await PerusopetuksenPerusteenSisalto.getVuosiluokkaKokonaisuudet(this.perusteId)).data;
    const laajaAlaisetOsaamiset = (await PerusopetuksenPerusteenSisalto.getOsaamiset(this.perusteId)).data;
    const tavoitealueet = (await PerusopetuksenPerusteenSisalto.getKohdealueet(this.perusteId, this.oppiaineId!)).data;
    let oppiaine = (await PerusopetuksenPerusteenSisalto.getPerusopetusOppiaine(this.perusteId, this.oppiaineId)).data;
    oppiaine = {
      ...oppiaine,
      vuosiluokkakokonaisuudet: _.sortBy(oppiaine.vuosiluokkakokonaisuudet, vlk => {
        const perusteenVuosiluokkakokonaisuus = _.find(perusteenVuosiluokkakokonaisuudet, pvlk => pvlk.id === _.toNumber(_.get(vlk, '_vuosiluokkaKokonaisuus')));
        return _.first(_.sortBy(perusteenVuosiluokkakokonaisuus?.vuosiluokat));
      }),
      kohdealueet: _.sortBy(oppiaine.kohdealueet, 'id'),
    };

    supportDataProvider({ perusteenVuosiluokkakokonaisuudet, tavoitealueet, laajaAlaisetOsaamiset });
    return {
      ...oppiaine,
    };
  }

  async save(data: any) {
    await PerusopetuksenPerusteenSisalto.updatePerusopetusOppiaine(this.perusteId, this.oppiaineId, data);
    await this.perusteStore.updateNavigation();
  }

  public async remove() {
    if (this.oppiaineId) {
      await PerusopetuksenPerusteenSisalto.deletePerusopetusOppiaine(this.perusteId, this.oppiaineId);
      await this.perusteStore.updateNavigation();
      this.el.$router.push({ name: 'perusopetusOppiaineet' });
    }
  }

  public async lock() {
    try {
      const res = await PerusopetusOppiaineLukko.checkLockPerusopetusOppiaine(this.perusteId, this.oppiaineId!);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    if (this.oppiaineId) {
      const res = await PerusopetusOppiaineLukko.lockPerusopetusOppiaine(this.perusteId, this.oppiaineId!);
      return res.data;
    }
    return null;
  }

  public async release() {
    if (this.oppiaineId) {
      await PerusopetusOppiaineLukko.unlockPerusopetusOppiaine(this.perusteId, this.oppiaineId!);
    }
  }

  public readonly validator = computed(() => {
    return {
      koodi: {
        required,
      },
    };
  });

  public static async create(perusteId, parentId?) {
    return (await PerusopetuksenPerusteenSisalto.addPerusopetusOppiaine(
      perusteId,
      {
        vapaatTekstit: [],
        kohdealueet: [],
        vuosiluokkakokonaisuudet: [],
        ...(parentId && { _oppiaine: _.toNumber(parentId) }),
      }
    )).data;
  }

  public static async saveTavoitealueet(perusteId, oppiaineId, kohdealueet) {
    return (await PerusopetuksenPerusteenSisalto.updateKohdealueet(perusteId, oppiaineId, kohdealueet)).data;
  }

  public static async createOppiaineenVuosiluokkakokonaisuus(perusteId, oppiaineId, vlk) {
    return (await PerusopetuksenPerusteenSisalto.addOppiaineenVuosiluokkakokonaisuus(perusteId, oppiaineId, vlk)).data;
  }

  public static async deleteOppiaineenVuosiluokkakokonaisuus(perusteId, oppiaineId, vlkId) {
    return (await PerusopetuksenPerusteenSisalto.deleteOppiaineenVuosiluokkakokonaisuus(perusteId, oppiaineId, vlkId.id)).data;
  }

  public static async updateOppiaineenVuosiluokkakokonaisuus(perusteId, oppiaineId, vlk) {
    await PerusopetusOppiaineVlkLukko.lockPerusopetusOppiaineVlk(perusteId, oppiaineId, vlk.id);
    const oppiaineenVlk = (await PerusopetuksenPerusteenSisalto.updateOppiaineenVuosiluokkakokonaisuus(perusteId, oppiaineId, vlk.id, vlk)).data;
    await PerusopetusOppiaineVlkLukko.unlockPerusopetusOppiaineVlk(perusteId, oppiaineId, vlk.id);
    return oppiaineenVlk;
  }

  public static async setOppiaineKoosteinen(perusteId, oppiaineId) {
    let oppiaine = (await PerusopetuksenPerusteenSisalto.getPerusopetusOppiaine(perusteId, oppiaineId)).data;
    oppiaine.koosteinen = true;
    await PerusopetusOppiaineLukko.lockPerusopetusOppiaine(perusteId, oppiaineId);
    await PerusopetuksenPerusteenSisalto.updatePerusopetusOppiaine(perusteId, oppiaineId, oppiaine);
    await PerusopetusOppiaineLukko.unlockPerusopetusOppiaine(perusteId, oppiaineId);
  }
}
