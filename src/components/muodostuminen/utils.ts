import { Kieli } from '@shared/tyypit';
import { v4 as genUuid } from 'uuid';

export const DefaultRyhma = {
  useRange: false,
  ryhma: {
    muodostumisSaanto: {
      laajuus: {
        minimi: 0,
        maksimi: null,
      },
    },
    nimi: null,
    kuvaus: null,
  } as any,
  tyyppi: null as string | null,
};

export function getNimi(key: string, el) {
  return {
    fi: el.$t(key, Kieli.fi),
    sv: el.$t(key, Kieli.sv),
    en: el.$t(key, Kieli.en),
  };
}

export function ryhmaTemplate(kind: string, el) {
  const result = {
    kuvaus: null,
    vieras: null,
    pakollinen: false,
    rooli: 'määritelty',
    tunniste: null,
    muodostumisSaanto: null,
    osaamisala: null,
    tutkintonimike: null,
    osat: [],
    nimi: getNimi(kind, el),
    uuid: genUuid(),
  };

  if (kind === 'rakenne-moduuli-yhteiset') {
    result.rooli = 'vieras';
  }
  else if (kind === 'rakenne-moduuli-paikalliset') {
    result.rooli = 'määrittelemätön';
  }
  else if (kind === 'osaamisala') {
    result.rooli = 'osaamisala';
  }
  else if (kind === 'tutkintonimike') {
    result.rooli = 'tutkintonimike';
  }
  return result;
}

export type RakenneModuuliType =
  'ammatilliset'
  | 'osaamisala'
  | 'paikalliset'
  | 'pakollinen'
  | 'tutkintonimike'
  | 'valinnainen'
  | 'yhteiset';

export interface RakenneMainType {
  kind: RakenneModuuliType;
  label: string;
  uuid: string;
  create: () => any;
}

export const RooliToTheme = Object.freeze({
  'määrittelemätön': 'paikalliset',
  'osaamisala': 'osaamisala',
  'tutkintonimike': 'tutkintonimike',
  'vieras': 'yhteiset',
});

export const ColorMap = Object.freeze({
  ammatilliset: '#b2b2b2',
  osaamisala: '#575757',
  paikalliset: '#c126b8',
  pakollinen: '#bdeaa1',
  tutkintonimike: '#99b3f1',
  valinnainen: '#e60895',
  yhteiset: '#878787',
});

export function rakenneNodecolor(node, parentMandatory, el) {
  const isRyhma = !!node.rooli;

  if (isRyhma) {
    const mapped = RooliToTheme[node.rooli];
    if (mapped) {
      return ColorMap[mapped];
    }
    if (node.rooli === 'määritelty') {
      if (el.$kaanna(node.nimi) === el.$t('rakenne-moduuli-pakollinen')) {
        return ColorMap.pakollinen;
      }
      else if (el.$kaanna(node.nimi) === el.$t('rakenne-moduuli-ammatilliset')) {
        return ColorMap.ammatilliset;
      }
    }
    return ColorMap.valinnainen;
  }
  else {
    if (parentMandatory || node.pakollinen) {
      return ColorMap.pakollinen;
    }
    else {
      return ColorMap.valinnainen;
    }
  }
}
