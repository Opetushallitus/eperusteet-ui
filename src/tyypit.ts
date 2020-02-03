// FIXME: vue-loader issue 1281
import * as GApi from '@/generated/api';

export enum OrganisaatioTyyppi {
  Muu = 'Muu organisaatio',
  Varhaiskasvatus = 'Varhaiskasvatuksen jarjestaja',
  Oppilaitos = 'Oppilaitos',
  Toimija = 'Koulutustoimija',
}

export type DiagrammiVarit = 'vaalea_sininen' | 'vihrea_sininen';

export type EditorLayout = 'minimal' | 'simplified' | 'normal';

export interface LokalisoituTekstiDto {
  // id?: number;
  // tunniste?: string;
  [key: string]: string;
}

export interface OrganisaatioDto {
  oid: string;
}

export interface SideMenuEntry {
  item: SideMenuItem,
  route?: SideMenuRoute,
  flatten?: boolean,
  children?: Array<SideMenuEntry>,
  parent?: SideMenuEntry,
}

export interface SideMenuItem {
  type: string,
  i18key?: string,
  objref?: object,
  prefix?: string,
  hideChevron?: boolean,
}

export interface SideMenuRoute {
  name: string,
  params: object,
  query?: object,
}

export interface RecursiveTreeItem {
  id: number;
}

//export interface RevisionDto extends GApi.RevisionDto {
//  nykyinen?: boolean,
//}

//export type EtusivuDto = GApi.EtusivuDto;
export type KayttajanTietoDto = GApi.KayttajanTietoDto;
export type LiiteDto = GApi.LiiteDto;
export type Lops2019ModuuliDto = GApi.Lops2019ModuuliDto;
export type Lops2019OppiaineDto = GApi.Lops2019OppiaineKaikkiDto;
export type Matala = GApi.Matala;
export type PerusteInfoDto = GApi.PerusteInfoDto;
export type TekstiKappaleDto = GApi.TekstiKappaleDto;
export type TermiDto = GApi.TermiDto;

export type PageTiedoteDto = GApi.PageTiedoteDto;
export type TiedoteDto = GApi.TiedoteDto;
export type PerusteHakuDto = GApi.PerusteHakuDto;

export default GApi;
