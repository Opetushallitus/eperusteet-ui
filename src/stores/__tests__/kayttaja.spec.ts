import { KayttajaStore } from '../kayttaja';

describe('Kayttajat', () => {
  const kayttajaStore = new KayttajaStore();

  beforeEach(() => {
    kayttajaStore.state.oikeudet = {
      perusteprojekti: [],
      pohja: [],
    };
  });

  test('Tyhjät oikeudet', async () => {
    expect(await kayttajaStore.hasOikeus('luku')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('hallinta')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('hallinta', 'pohja')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('luku', 'pohja')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('tilanvaihto', 'perusteprojekti')).toEqual(false);
  });

  test('Hallintaoikeudet', async () => {
    kayttajaStore.state.oikeudet = {
      perusteprojekti: [],
      pohja: ['luonti'],
    };

    expect(await kayttajaStore.hasOikeus('hallinta', 'pohja')).toEqual(true);
    expect(await kayttajaStore.hasOikeus('luku', 'pohja')).toEqual(true);
  });

  test('Rikkinäisillä parametreilla ei oikeuksia', async () => {
    expect(await kayttajaStore.hasOikeus(null as any, 'perusteprojekti')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('luku', null as any)).toEqual(false);
    expect(await kayttajaStore.hasOikeus(null as any, null as any)).toEqual(false);
    expect(await kayttajaStore.hasOikeus('keksitty' as any)).toEqual(false);
  });

  test('perusteprojekti lukuoikeudet', async () => {
    kayttajaStore.state.oikeudet = {
      perusteprojekti: ['luku'],
      pohja: [],
    };
    expect(await kayttajaStore.hasOikeus('luku', 'pohja')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('luku', 'perusteprojekti')).toEqual(true);
    expect(await kayttajaStore.hasOikeus('kommentointi', 'perusteprojekti')).toEqual(false);
  });

  test('perusteprojekti muokkausoikeus', async () => {
    kayttajaStore.state.oikeudet = {
      perusteprojekti: ['muokkaus'],
      pohja: [],
    };

    expect(await kayttajaStore.hasOikeus('luku', 'pohja')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('luku', 'perusteprojekti')).toEqual(true);
    expect(await kayttajaStore.hasOikeus('kommentointi', 'perusteprojekti')).toEqual(true);
    expect(await kayttajaStore.hasOikeus('muokkaus', 'perusteprojekti')).toEqual(true);
    expect(await kayttajaStore.hasOikeus('luonti', 'perusteprojekti')).toEqual(false);
    expect(await kayttajaStore.hasOikeus('poisto', 'perusteprojekti')).toEqual(false);
  });
});
