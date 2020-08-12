import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { watch, reactive, computed } from '@vue/composition-api';
import { TutkinnonOsaViiteDto, OsaAlueet } from '@shared/api/eperusteet';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from './PerusteStore';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class OsaalueStore implements IEditoitava {
  constructor(
    private tovId: number,
    private osaalueId: number | string,
    private router: VueRouter,
  ) { }

  public async load() {
    if (this.osaalueId === 'uusi') {
      return {
        piilotaValinnaiset: false,
        nimi: null,
        koodi: null,
        tyyppi: 'osaalue2020',
        pakollisetOsaamistavoitteet: null,
        valinnaisetOsaamistavoitteet: null,
        arviointi: {
          id: null,
        },
      };
    }
    else {
      const res = (await OsaAlueet.getOsaAlueV2(this.tovId, Number(this.osaalueId))).data;
      return {
        ...res,
        piilotaValinnaiset: res.valinnaisetOsaamistavoitteet,
      };
    }
  }

  async lock() {
    try {
      const res = await OsaAlueet.getOsaAlueLock(this.tovId, Number(this.osaalueId));
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  async acquire() {
    if (this.osaalueId !== 'uusi') {
      return (await OsaAlueet.lockOsaAlue(this.tovId, Number(this.osaalueId))).data;
    }
    return null;
  }

  async release() {
    try {
      if (this.osaalueId !== 'uusi') {
        await OsaAlueet.unlockOsaAlue(this.tovId, Number(this.osaalueId));
      }
    }
    catch (err) {
    }
  }

  public async save(data: any) {
    if (data.piilotaValinnaiset) {
      data.valinnaisetOsaamistavoitteet = null;
    }

    if (this.osaalueId === 'uusi') {
      const res = await OsaAlueet.addOsaAlueV2(this.tovId, data);
      this.router.replace({
        params: {
          osaalueId: '' + res.data.id!,
        },
      });
      return res.data;
    }
    else {
      return (await OsaAlueet.updateOsaAlueV2(this.tovId, Number(this.osaalueId), data)).data;
    }
  }

  public async editAfterLoad() {
    return this.osaalueId === 'uusi';
  }

  public async preview() {
    return null;
  }

  // acquire?: () => Promise<ILukko | null>;

}
