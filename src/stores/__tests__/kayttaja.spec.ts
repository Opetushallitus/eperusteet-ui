import { KayttajaStore } from '../kayttaja';

describe('Kayttajat', () => {
  const kayttajaStore = new KayttajaStore();

  beforeEach(() => {
    kayttajaStore.state.oikeudet = {
      opetussuunnitelma: [],
      pohja: [],
    };
  });

  test('Tyhjät oikeudet', async () => {
    expect(await kayttajaStore.hasOikeus('luku')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('hallinta')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('hallinta', 'pohja')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('luku', 'pohja')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('tilanvaihto', 'opetussuunnitelma')).toEqual(false);
  });

  test('Hallintaoikeudet', async () => {
    kayttajaStore.state.oikeudet = {
      opetussuunnitelma: [],
      pohja: ['luonti'],
    };

    expect(await kayttajaStore.hasOikeus('hallinta', 'pohja')).toEqual(true);
    expect(await kayttajaStore.hasOikeus('luku', 'pohja')).toEqual(true);
  });

  test('Rikkinäisillä parametreilla ei oikeuksia', async () => {
    expect(await kayttajaStore.hasOikeus(null as any, 'opetussuunnitelma')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('luku', null as any)).toEqual(false);
    expect(await kayttajaStore.hasOikeus(null as any, null as any)).toEqual(false);
    expect(await kayttajaStore.hasOikeus('keksitty' as any)).toEqual(false);
  });

  test('Opetussuunnitelman lukuoikeudet', async () => {
    kayttajaStore.state.oikeudet = {
      opetussuunnitelma: ['luku'],
      pohja: [],
    };
    expect(await kayttajaStore.hasOikeus('luku', 'pohja')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('luku', 'opetussuunnitelma')).toEqual(true);
    expect(await kayttajaStore.hasOikeus('kommentointi', 'opetussuunnitelma')).toEqual(false);
  });

  test('Opetussuunnitelman muokkausoikeus', async () => {
    kayttajaStore.state.oikeudet = {
      opetussuunnitelma: ['muokkaus'],
      pohja: [],
    };

    expect(await kayttajaStore.hasOikeus('luku', 'pohja')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('luku', 'opetussuunnitelma')).toEqual(true);
    expect(await kayttajaStore.hasOikeus('kommentointi', 'opetussuunnitelma')).toEqual(true);
    expect(await kayttajaStore.hasOikeus('muokkaus', 'opetussuunnitelma')).toEqual(true);
    expect(await kayttajaStore.hasOikeus('luonti', 'opetussuunnitelma')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('poisto', 'opetussuunnitelma')).toEqual(false);
  });
});
