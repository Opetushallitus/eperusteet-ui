import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { watch, reactive, computed } from '@vue/composition-api';
import { TutkinnonOsaViiteDto, Perusteenosat } from '@shared/api/eperusteet';
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
    if (_.isNumber(this.osaalueId)) {
      const res = await Perusteenosat.getTutkinnonOsaOsaAlue(this.tovId, Number(this.osaalueId));
      return res.data;
    }
    else {
      return {
        nimi: null,
        koodi: null,
        tyyppi: 'osaalue2020',
        pakollisetOsaamistavoitteet: null,
        valinnaisetOsaamistavoitteet: null,
        arviointi: {},
      };
    }
  }

  public async save(data) {
    const res = await Perusteenosat.addTutkinnonOsaOsaAlue(this.tovId, data);
    if (this.osaalueId === 'uusi') {
      this.router.replace({
        params: {
          osaalueId: '' + res.data.id!,
        },
      });
    }
    return res.data;
  }

  public async editAfterLoad() {
    return this.osaalueId === 'uusi';
  }

  public async preview() {
    return null;
  }
}
