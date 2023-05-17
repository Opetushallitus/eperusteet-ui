import { EperusteetKoulutustyypit } from '@shared/utils/perusteet';
import _ from 'lodash';

enum KoulutusTyyppi {
  AMMATILLINEN_PERUSTUTKINTO = 'koulutustyyppi_1',
  LUKIOKOULUTUS = 'koulutustyyppi_2',
  TELMA = 'koulutustyyppi_5',
  LISAOPETUS = 'koulutustyyppi_6',
  AMMATTITUTKINTO = 'koulutustyyppi_11',
  ERIKOISAMMATTITUTKINTO = 'koulutustyyppi_12',
  AIKUISLUKIOKOULUTUS = 'koulutustyyppi_14',
  ESIOPETUS = 'koulutustyyppi_15',
  PERUSOPETUS = 'koulutustyyppi_16',
  AIKUISTEN_PERUSOPETUS = 'koulutustyyppi_17',
  VALMA = 'koulutustyyppi_18',
  VARHAISKASVATUS = 'koulutustyyppi_20',
  PERUSOPETUKSEEN_VALMISTAVA = 'koulutustyyppi_22',
  LUKIOVALMISTAVAKOULUTUS = 'koulutustyyppi_23',
  TAITEEN_PERUSOPETUS = 'koulutustyyppi_999907',
  MUU = 'koulutustyyppi_muu',
}

const LUKIOKOULUTUS = [
  KoulutusTyyppi.LUKIOKOULUTUS,
  KoulutusTyyppi.AIKUISLUKIOKOULUTUS,
  KoulutusTyyppi.LUKIOVALMISTAVAKOULUTUS,
];

export const EiTuetutKoulutustyypit = [
  KoulutusTyyppi.PERUSOPETUS,
  KoulutusTyyppi.LUKIOVALMISTAVAKOULUTUS,
  KoulutusTyyppi.LISAOPETUS,
  KoulutusTyyppi.MUU,
];

export const TuetutKoulutustyypit = _.filter(EperusteetKoulutustyypit, koulutustyyppi => !_.includes(EiTuetutKoulutustyypit, koulutustyyppi));

export const KoodistoLops2019LaajaAlaiset = 'laajaalainenosaaminenlops2021';

export const YlopsKoulutustyypit = Object.freeze([
  KoulutusTyyppi.ESIOPETUS,
  KoulutusTyyppi.LUKIOKOULUTUS,
  KoulutusTyyppi.VARHAISKASVATUS,
  KoulutusTyyppi.LISAOPETUS,
  KoulutusTyyppi.AIKUISLUKIOKOULUTUS,
  KoulutusTyyppi.LUKIOVALMISTAVAKOULUTUS,
  // 'koulutustyyppi_999907', // TPO
  // 'koulutustyyppi_17', // AIKUISTENPERUSOPETUS
  // 'koulutustyyppi_16', // PERUSOPETUS
  // 'koulutustyyppi_22', // PERUSOPETUSVALMISTAVA
]);

const Perusoppilaitokset = [11, 19, 64, 21];
const koulutustyyppiToOppilaitos = {
  [KoulutusTyyppi.ESIOPETUS]: Perusoppilaitokset,
  [KoulutusTyyppi.LUKIOKOULUTUS]: [...Perusoppilaitokset, 15],
  [KoulutusTyyppi.AIKUISLUKIOKOULUTUS]: [...Perusoppilaitokset, 15],
  [KoulutusTyyppi.LUKIOVALMISTAVAKOULUTUS]: [...Perusoppilaitokset, 15],
  [KoulutusTyyppi.VARHAISKASVATUS]: [...Perusoppilaitokset],
  [KoulutusTyyppi.LISAOPETUS]: Perusoppilaitokset,
};

export function koulutustyypinOppilaitokset(koulutustyyppi: string | undefined | null) {
  if (koulutustyyppi) {
    return koulutustyyppiToOppilaitos[koulutustyyppi] || Perusoppilaitokset;
  }
  return Perusoppilaitokset;
}

export function isPerusteSupported(peruste: any) {
  const { toteutus, koulutustyyppi } = peruste;
  if (koulutustyyppi === KoulutusTyyppi.LUKIOKOULUTUS
    || koulutustyyppi === KoulutusTyyppi.AIKUISLUKIOKOULUTUS
    || koulutustyyppi === KoulutusTyyppi.LUKIOVALMISTAVAKOULUTUS) {
    return toteutus === 'lops2019';
  }
  return _.includes(YlopsKoulutustyypit, koulutustyyppi);
}

export function isKoulutustyyppiSupported(koulutustyyppi: string | undefined) {
  return !_.includes(EiTuetutKoulutustyypit, koulutustyyppi);
}

export function isLukiokoulutus(koulutustyyppi: KoulutusTyyppi): boolean {
  return LUKIOKOULUTUS.includes(koulutustyyppi);
}

export function paikallisestiSallitutLaajennokset() {
  return [
    'oppiaineetjaoppimaaratlops2021_ai12',
    'oppiaineetjaoppimaaratlops2021_ux',
    'oppiaineetjaoppimaaratlops2021_vka',
    'oppiaineetjaoppimaaratlops2021_vkb',
  ];
}

const splitKoodi = _.memoize((arvo: string) => {
  if (_.isString(arvo) && !_.isEmpty(arvo)) {
    const splitattu = arvo.match(/^([^0-9]*?)(\d+$)/);

    if (splitattu && splitattu.length > 2) {
      return [splitattu[1], Number(splitattu[2])];
    }
  }
  return [arvo, 0];
});

export function getArvo(koodillinen: any) {
  return _.get(koodillinen, 'koodi.arvo')
    || _.get(koodillinen, 'arvo')
    || _.get(koodillinen, 'koodi.uri')
    || _.get(koodillinen, 'uri')
    || koodillinen;
}

export function getUri(koodillinen: any) {
  return _.get(koodillinen, 'koodi.uri', _.get(koodillinen, 'uri', koodillinen));
}

export function koodiAlku(koodillinen: object | string) {
  return splitKoodi(getArvo(koodillinen))[0];
}

export function koodiNumero(koodillinen: object | string) {
  return splitKoodi(getArvo(koodillinen))[1];
}

export function koodiSorters(): any[] {
  return [koodiAlku, koodiNumero];
}
