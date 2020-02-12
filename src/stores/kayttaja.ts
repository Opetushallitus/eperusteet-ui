import _ from 'lodash'
import { Store, Getter, State } from '@shared/stores/store'
import { Kayttajat as KayttajatApi, KayttajanTietoDto } from '@shared/api/eperusteet'
import { createLogger } from '@shared/utils/logger'

// FIXME: tyypitä backendiin
export type Oikeus = 'luku' | 'kommentointi' | 'muokkaus' | 'luonti' | 'poisto' | 'tilanvaihto' | 'hallinta';
export type OikeusKohde = 'opetussuunnitelma' | 'pohja';
export interface Oikeudet { [kohde: string]: Oikeus[]; }

function getOikeusArvo (oikeus: Oikeus) {
  switch (oikeus) {
    case 'luku': return 1
    case 'kommentointi': return 2
    case 'muokkaus': return 3
    case 'luonti': return 4
    case 'poisto': return 5
    case 'tilanvaihto': return 6
    default: return 0
  }
}

export function parsiEsitysnimi (tiedot: any): string {
  if (tiedot.kutsumanimi && tiedot.sukunimi) {
    return tiedot.kutsumanimi + ' ' + tiedot.sukunimi
  } else {
    return tiedot.oidHenkilo as string
  }
}

const logger = createLogger('Kayttaja')

@Store
class KayttajaStore {
  @State()
  public organisaatiot: any[] = [];

  @State()
  public tiedot: KayttajanTietoDto = { };

  @State()
  public virkailijat: any[] = []; // FIXME: tyyppi puuttuu

  @State()
  public oikeudet: Oikeudet = {
    opetussuunnitelma: [],
    pohja: []
  };

  @Getter(state => parsiEsitysnimi(state.tiedot))
  public readonly nimi!: string;

  public async init () {
    try {
      logger.info('Haetaan käyttäjän tiedot')
      this.tiedot = (await KayttajatApi.getKirjautunutKayttajat()).data
      logger.info('Käyttäjän tiedot', this.tiedot)
    } catch (err) {
      logger.error('Käyttäjän tietojen lataus epäonnistui', err.message)
    }
  }

  public async hasOikeus (oikeus: Oikeus, kohde: OikeusKohde = 'opetussuunnitelma') {
    if (!oikeus) {
      return false
    } else if (oikeus === 'hallinta') {
      return this.hasHallintaoikeus(kohde)
    } else {
      return this.vertaa(oikeus, kohde)
    }
  }

  private vertaa (oikeus: Oikeus, kohde: OikeusKohde = 'opetussuunnitelma') {
    const haettu = getOikeusArvo(oikeus)
    if (haettu === 0) {
      return false
    } else {
      const korkein = _.max(_.map(this.oikeudet[kohde], getOikeusArvo)) || 0
      return korkein >= haettu
    }
  }

  private hasHallintaoikeus (kohde) {
    return _.includes(this.oikeudet[kohde], 'luonti')
  }
}

export const Kayttajat = new KayttajaStore()
