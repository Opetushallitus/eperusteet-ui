import { Kielet } from '@shared/stores/kieli';
import { Kieli } from '@shared/tyypit';
import { v4 as genUuid } from 'uuid';
import { $t } from '@shared/utils/globals';

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

export function getNimi(key: string) {
  return {
    fi: $t(key, {}, { locale: Kieli.fi }),
    sv: $t(key, {}, { locale: Kieli.sv }),
    en: $t(key, {}, { locale: Kieli.en }),
  };
}

export function ryhmaTemplate(kind: string) {
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
    nimi: getNimi(kind),
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

export function rakenneNodecolor(node, parentMandatory) {
  const isRyhma = !!node.rooli;

  if (isRyhma) {
    const mapped = RooliToTheme[node.rooli];
    if (mapped) {
      return ColorMap[mapped];
    }
    if (node.rooli === 'määritelty') {
      if (node.nimi[Kielet.getUiKieli.value] === $t('rakenne-moduuli-pakollinen')) {
        return ColorMap.pakollinen;
      }
      else if (node.nimi[Kielet.getUiKieli.value] === $t('rakenne-moduuli-ammatilliset')) {
        return ColorMap.ammatilliset;
      }
      else if (node.nimi[Kielet.getUiKieli.value] === $t('rakenne-moduuli-yhteiset')) {
        return ColorMap.yhteiset;
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
