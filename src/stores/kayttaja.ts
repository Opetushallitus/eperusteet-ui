import _ from 'lodash';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Kayttajat as KayttajatApi, KayttajanTietoDto, Perusteprojektit } from '@shared/api/eperusteet';
import { createLogger } from '@shared/utils/logger';
import { getSovellusoikeudet, IOikeusProvider } from '@shared/plugins/oikeustarkastelu';
import { getCasKayttaja } from '@shared/api/common';

// FIXME: tyypitä backendiin
export type Oikeus = 'luku' | 'kommentointi' | 'muokkaus' | 'luonti' | 'poisto' | 'tilanvaihto' | 'hallinta';
export type OikeusKohde = 'perusteprojekti' | 'peruste' | 'pohja';
export type RoleAppOikeus = 'eperusteet' | 'eperusteet_maarays'
export interface Oikeudet { [kohde: string]: Oikeus[]; }

const oikeusArvoToRoleOikeus = {
  'luku': ['READ', 'CRUD'],
  'muokkaus': ['CRUD'],
  'poisto': ['CRUD'],
};

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

export const useKayttajaStore = defineStore('kayttaja', () => {
  // State
  const projektiId = ref<number | null>(null);
  const organisaatiot = ref<any[]>([]);
  const tiedot = ref<KayttajanTietoDto>({} as KayttajanTietoDto);
  const virkailijat = ref<any[]>([]);
  const casKayttaja = ref<any>(null);
  const oikeudet = ref<Oikeudet>({} as Oikeudet);

  // Computed
  const userOid = computed(() => tiedot.value.oidHenkilo);
  const nimi = computed(() => parsiEsitysnimi(tiedot.value));
  const isAdmin = computed(() => _.some(tiedot.value?.oikeudet || [], oikeus => _.includes(OphAdminOids, oikeus)));
  const hasOphCrud = computed(() => _.some(tiedot.value?.oikeudet || [], oikeus => _.includes(OphCrudOids, oikeus)));
  const sovellusOikeudet = computed(() => getSovellusoikeudet(casKayttaja.value?.groups, 'APP_EPERUSTEET'));

  // Actions
  async function init() {
    try {
      logger.info('Haetaan käyttäjän tiedot');
      casKayttaja.value = await getCasKayttaja();
      tiedot.value = (await KayttajatApi.getKirjautunutKayttajat()).data;
      logger.info('Käyttäjän tiedot', tiedot.value);
    }
    catch (err: any) {
      logger.error('Käyttäjän tietojen lataus epäonnistui', err.message);
    }
  }

  async function clear() {
    try {
      projektiId.value = null;
      oikeudet.value = {};
    }
    catch (err: any) {
      logger.error('Ei oikeuksia', err.message);
    }
  }

  async function setPerusteprojekti(perusteprojektiId: number) {
    try {
      const res = await Perusteprojektit.getPerusteprojektiOikeudet(perusteprojektiId);
      projektiId.value = perusteprojektiId;
      oikeudet.value = res.data as any;
    }
    catch (err: any) {
      logger.error('Ei oikeuksia', err.message);
      throw err;
    }
  }

  function hasOikeus(oikeus: Oikeus, kohde: RoleAppOikeus | OikeusKohde = 'perusteprojekti') {
    if (!oikeus) {
      return false;
    }
    else if (oikeus === 'hallinta') {
      return hasHallintaoikeus(kohde);
    }
    else if (kohde === 'eperusteet' || kohde === 'eperusteet_maarays') {
      return vertaaRoleOikeus(oikeus, kohde);
    }
    else {
      return vertaa(oikeus, kohde);
    }
  }

  function vertaaRoleOikeus(oikeus: Oikeus, kohde: RoleAppOikeus) {
    return _.some(tiedot.value.oikeudet, kayttajaoikeus => kayttajaoikeus === 'ROLE_APP_' + kohde.toUpperCase() + '_' + oikeusArvoToRoleOikeus[oikeus]);
  }

  function vertaa(oikeus: Oikeus, kohde: OikeusKohde = 'perusteprojekti') {
    const haettu = getOikeusArvo(oikeus);
    if (haettu === 0) {
      return false;
    }
    else {
      const korkein = _.max(_.map(oikeudet.value[kohde], getOikeusArvo)) || 0;
      return korkein >= haettu;
    }
  }

  function hasHallintaoikeus(kohde: any) {
    if (kohde === 'pohja') {
      return isAdmin.value;
    }

    if (_.isEmpty(oikeudet.value)) {
      return hasOphCrud.value;
    }

    return _.includes(oikeudet.value[kohde], 'luonti');
  }

  return {
    // State
    projektiId,
    organisaatiot,
    tiedot,
    virkailijat,
    casKayttaja,
    oikeudet,

    // Computed
    userOid,
    nimi,
    isAdmin,
    hasOphCrud,
    sovellusOikeudet,

    // Actions
    init,
    clear,
    setPerusteprojekti,
    hasOikeus,
  };
});
