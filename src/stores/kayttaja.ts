import _ from 'lodash';
import Vue from 'vue';
import { Kayttajat as KayttajatApi, KayttajanTietoDto, Perusteprojektit } from '@shared/api/eperusteet';
import { createLogger } from '@shared/utils/logger';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { getSovellusoikeudet, IOikeusProvider, Oikeustarkastelu } from '@shared/plugins/oikeustarkastelu';
import { getCasKayttaja } from '@shared/api/common';

Vue.use(VueCompositionApi);

// FIXME: tyypitä backendiin
export type Oikeus = 'luku' | 'kommentointi' | 'muokkaus' | 'luonti' | 'poisto' | 'tilanvaihto' | 'hallinta';
export type OikeusKohde = 'perusteprojekti' | 'peruste' | 'pohja';
export interface Oikeudet { [kohde: string]: Oikeus[]; }

function getOikeusArvo(oikeus: Oikeus) {
  switch (oikeus) {
  case 'luku': return 1;
  case 'kommentointi': return 2;
  case 'muokkaus': return 3;
  case 'luonti': return 4;
  case 'poisto': return 5;
  case 'tilanvaihto': return 6;
  default: return 0;
  }
}

const OphAdminOids = ['ROLE_APP_EPERUSTEET_ADMIN_1.2.246.562.10.00000000001'];
const OphCrudOids = ['ROLE_APP_EPERUSTEET_CRUD_1.2.246.562.10.00000000001'];

export function parsiEsitysnimi(tiedot: any): string {
  if (tiedot.kutsumanimi && tiedot.sukunimi) {
    return tiedot.kutsumanimi + ' ' + tiedot.sukunimi;
  }
  else {
    return tiedot.oidHenkilo as string;
  }
}

const logger = createLogger('Kayttaja');

export class KayttajaStore implements IOikeusProvider {
  public state = reactive({
    projektiId: null as number | null,
    organisaatiot: [] as any[],
    tiedot: {} as KayttajanTietoDto,
    virkailijat: [] as any[],
    casKayttaja: null as any,
    oikeudet: {
    } as Oikeudet,
  });

  public readonly organisaatiot = computed(() => this.state.organisaatiot);
  public readonly tiedot = computed(() => this.state.tiedot);
  public readonly userOid = computed(() => this.state.tiedot.oidHenkilo);
  public readonly virkailijat = computed(() => this.state.virkailijat);
  public readonly oikeudet = computed(() => this.state.oikeudet);
  public readonly nimi = computed(() => parsiEsitysnimi(this.state.tiedot));
  public readonly isAdmin = computed(() => _.some(this.state.tiedot?.oikeudet || [], oikeus => _.includes(OphAdminOids, oikeus)));
  public readonly hasOphCrud = computed(() => _.some(this.state.tiedot?.oikeudet || [], oikeus => _.includes(OphCrudOids, oikeus)));
  public readonly casKayttaja = computed(() => this.state.casKayttaja);
  public readonly sovellusOikeudet = computed(() => getSovellusoikeudet(this.state.casKayttaja?.groups, 'APP_EPERUSTEET'));

  public async init() {
    try {
      logger.info('Haetaan käyttäjän tiedot');
      this.state.casKayttaja = await getCasKayttaja();
      this.state.tiedot = (await KayttajatApi.getKirjautunutKayttajat()).data;
      logger.info('Käyttäjän tiedot', this.tiedot.value);
    }
    catch (err) {
      logger.error('Käyttäjän tietojen lataus epäonnistui', err.message);
    }
  }

  public async clear() {
    try {
      this.state.projektiId = null;
      this.state.oikeudet = {};
    }
    catch (err) {
      logger.error('Ei oikeuksia', err.message);
    }
  }

  public async setPerusteprojekti(perusteprojektiId: number) {
    try {
      const res = await Perusteprojektit.getPerusteprojektiOikeudet(perusteprojektiId);
      this.state.projektiId = perusteprojektiId;
      this.state.oikeudet = res.data as any;
    }
    catch (err) {
      logger.error('Ei oikeuksia', err.message);
    }
  }

  public hasOikeus(oikeus: Oikeus, kohde: OikeusKohde = 'peruste') {
    if (!oikeus) {
      return false;
    }
    else if (oikeus === 'hallinta') {
      return this.hasHallintaoikeus(kohde);
    }
    else {
      return this.vertaa(oikeus, kohde);
    }
  }

  private vertaa(oikeus: Oikeus, kohde: OikeusKohde = 'peruste') {
    const haettu = getOikeusArvo(oikeus);
    if (haettu === 0) {
      return false;
    }
    else {
      const korkein = _.max(_.map(this.oikeudet.value[kohde], getOikeusArvo)) || 0;
      return korkein >= haettu;
    }
  }

  private hasHallintaoikeus(kohde) {
    if (kohde === 'pohja') {
      return this.isAdmin.value;
    }

    if (_.isEmpty(this.oikeudet.value)) {
      return this.hasOphCrud.value;
    }

    return _.includes(this.oikeudet.value[kohde], 'luonti');
  }
}

export const Kayttajat = new KayttajaStore();
