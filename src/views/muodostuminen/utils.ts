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
