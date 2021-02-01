export const geneerinen = Object.freeze({
  nimi: {
    fi: 'Geneerinen arviointi asteikko 1.',
  } as any,
  kohde: {
    fi: 'Opiskelija',
  } as any,
  _arviointiAsteikko: 3,
  julkaistu: false,
  osaamistasonKriteerit: [{
    _osaamistaso: 5,
    kriteerit: [{
      fi: 'Kriteeri 1',
    } as any],
  }, {
    _osaamistaso: 6,
    kriteerit: [{
      fi: 'Kriteeri 2',
    } as any],
  }, {
    _osaamistaso: 7,
    kriteerit: [{
      fi: 'Kriteeri 3',
    } as any],
  }, {
    _osaamistaso: 8,
    kriteerit: [{
      fi: 'Kriteeri 4',
    } as any],
  }, {
    _osaamistaso: 9,
    kriteerit: [{
      fi: 'Kriteeri 5',
    } as any],
  }] as any[],
});

export function getMockGeneeriset() {
  return {
    geneeriset: [{
      ...geneerinen,
      id: 43,
      nimi: { fi: 'Ensimmäinen geneerinen' } as any,
      julkaistu: false,
    } as any, {
      ...geneerinen,
      id: 43,
      nimi: { fi: 'Toinen geneerinen' } as any,
      julkaistu: true,
    } as any],
    arviointiasteikot: [{
      id: 3,
      osaamistasot: [{
        id: 5,
        otsikko: {
          fi: 'Tyydyttävä T1',
        },
      }, {
        id: 6,
        otsikko: {
          fi: 'Tyydyttävä T2',
        },
      }, {
        id: 7,
        otsikko: {
          fi: 'Hyvä H3',
        },
      }, {
        id: 8,
        otsikko: {
          fi: 'Hyvä H4',
        },
      }, {
        id: 9,
        otsikko: {
          fi: 'Kiitettävä K5',
        },
      }],
    } as any],
  };
}

export function mockPerusteet() {
  return {
    'data': [
      {
        'id': 9960,
        'globalVersion': {
          'aikaleima': 1579608259200,
        },
        'nimi': {
          '_tunniste': '9a6652b7-8b3a-4b25-ad16-fb47a62d3395',
          'fi': 'hevosia',
          'sv': 'hevosia',
          '_id': '9915',
        },
        'koulutustyyppi': 'koulutustyyppi_1',
        'toteutus': 'ammatillinen',
        'koulutukset': [],
        'kielet': [
          'sv',
          'fi',
        ],
        'kuvaus': null,
        'maarayskirje': {
          'id': 10020,
          'url': {},
          'liitteet': {},
        },
        'muutosmaaraykset': [],
        'diaarinumero': null,
        'voimassaoloAlkaa': null,
        'siirtymaPaattyy': null,
        'voimassaoloLoppuu': null,
        'paatospvm': null,
        'luotu': 1579608176289,
        'muokattu': 1579608262842,
        'tila': 'valmis',
        'tyyppi': 'pohja',
        'koulutusvienti': false,
        'korvattavatDiaarinumerot': [],
        'osaamisalat': [],
        'tyotehtavatJoissaVoiToimia': null,
        'suorittaneenOsaaminen': null,
        'perusteenAikataulut': [],
        'suoritustavat': [
          {
            'suoritustapakoodi': 'reformi',
            'laajuusYksikko': 'OSAAMISPISTE',
          },
        ],
        'kvliite': {
          'id': 9990,
          'suorittaneenOsaaminen': null,
          'tyotehtavatJoissaVoiToimia': null,
          'tutkintotodistuksenAntaja': null,
          '_arvosanaAsteikko': null,
          'jatkoopintoKelpoisuus': null,
          'kansainvalisetSopimukset': null,
          'saadosPerusta': null,
          'pohjakoulutusvaatimukset': null,
          'lisatietoja': null,
          'tutkintotodistuksenSaaminen': null,
          'tutkinnostaPaattavaViranomainen': null,
        },
        'perusteprojekti': {
          'id': 9980,
          'nimi': 'hevosia',
          '_peruste': '9960',
          'diaarinumero': null,
          'paatosPvm': null,
          'toimikausiAlku': null,
          'toimikausiLoppu': null,
          'tehtavaluokka': null,
          'tehtava': null,
          'yhteistyotaho': null,
          'tila': 'valmis',
          'ryhmaOid': '1.2.246.562.28.34270220873',
          'esikatseltavissa': false,
          'tavoitepaivamaarat': [],
        },
      } as any,
    ],
    'sivukoko': 100,
    'sivu': 0,
    'sivuja': 1,
    'kokonaismäärä': 1,
  };
}

export function mockPohjaPerusteet() {
  return {
    'data': [
      {
        'id': 9980,
        'nimi': 'hevosia',
        'tila': 'valmis',
        'perusteendiaarinumero': '123/1234',
        'diaarinumero': '123/1234',
        'koulutustyyppi': 'koulutustyyppi_1',
        'toteutus': 'ammatillinen',
        'tyyppi': 'pohja',
        'suoritustavat': [
          'reformi',
        ],
        'luotu': 1579608176592,
        'globalVersion': {
          'aikaleima': 1579608259200,
        },
        'peruste': {
          'id': 9960,
          'globalVersion': {
            'aikaleima': 1579608259200,
          },
          'nimi': {
            '_tunniste': '9a6652b7-8b3a-4b25-ad16-fb47a62d3395',
            'fi': 'hevosia',
            'sv': 'hevosia',
            '_id': '9915',
          },
          'koulutustyyppi': 'koulutustyyppi_1',
          'toteutus': 'ammatillinen',
          'koulutukset': [],
          'kielet': [
            'sv',
            'fi',
          ],
          'kuvaus': null,
          'maarayskirje': {
            'id': 10020,
            'url': {},
            'liitteet': {},
          },
          'muutosmaaraykset': [],
          'diaarinumero': null,
          'voimassaoloAlkaa': null,
          'siirtymaPaattyy': null,
          'voimassaoloLoppuu': null,
          'paatospvm': null,
          'luotu': 1579608176289,
          'muokattu': 1579608262842,
          'tila': 'valmis',
          'tyyppi': 'pohja',
          'koulutusvienti': false,
          'korvattavatDiaarinumerot': [],
          'osaamisalat': [],
          'tyotehtavatJoissaVoiToimia': null,
          'suorittaneenOsaaminen': null,
          'suoritustavat': [
            {
              'suoritustapakoodi': 'reformi',
              'laajuusYksikko': 'OSAAMISPISTE',
            },
          ],
          'kvliite': {
            'id': 9990,
            'suorittaneenOsaaminen': null,
            'tyotehtavatJoissaVoiToimia': null,
            'tutkintotodistuksenAntaja': null,
            '_arvosanaAsteikko': null,
            'jatkoopintoKelpoisuus': null,
            'kansainvalisetSopimukset': null,
            'saadosPerusta': null,
            'pohjakoulutusvaatimukset': null,
            'lisatietoja': null,
            'tutkintotodistuksenSaaminen': null,
            'tutkinnostaPaattavaViranomainen': null,
          },
        },
      } as any,
    ],
    'sivukoko': 20,
    'sivu': 0,
    'sivuja': 1,
    'kokonaismäärä': 5,
  };
}

export function mockTyoryhmat() {
  return [
    {
      'nimi': {
        'fi': 'ePerusteet_johtamisen ja yritysjohtamisen eat',
      },
      'oid': '1.2.246.562.28.17660042445',
      'parentOid': '1.2.246.562.10.00000000001',
      'kuvaus2': {
        'kieli_fi#1': 'ePerusteet_johtamisen ja yritysjohtamisen eat',
      },
      'tyypit': [
        'Ryhma',
      ],
      'yhteystietoArvos': [],
      'yhteystiedot': [],
      'nimet': [],
      'postiosoite': {},
      'ryhmatyypit': [
        'perustetyoryhma',
      ],
      'kayttoryhmat': [
        'perusteiden_laadinta',
      ],
      'vuosiluokat': [],
      'parentOidPath': '|1.2.246.562.10.00000000001|',
      'toimipistekoodi': '',
      'kieletUris': [],
      'kayntiosoite': {},
      'version': 0,
      'status': 'AKTIIVINEN',
    },
    {
      'nimi': {
        'fi': 'ePerusteet Rakennusalan työmaajohdon eat, perusteryhmä',
      },
      'oid': '1.2.246.562.28.17899043958',
      'parentOid': '1.2.246.562.10.00000000001',
      'kuvaus2': {},
      'tyypit': [
        'Ryhma',
      ],
      'yhteystietoArvos': [],
      'yhteystiedot': [],
      'nimet': [],
      'postiosoite': {},
      'ryhmatyypit': [
        'perustetyoryhma',
      ],
      'kayttoryhmat': [
        'perusteiden_laadinta',
      ],
      'vuosiluokat': [],
      'parentOidPath': '|1.2.246.562.10.00000000001|',
      'toimipistekoodi': '',
      'kieletUris': [],
      'kayntiosoite': {},
      'version': 0,
      'status': 'AKTIIVINEN',
    },
  ];
}

export const toteutussuunnitelmaTilastotMocks = [
  {
    'nimi': {
      'fi': 'test1',
    },
    'tila': 'luonnos',
    'paatospaivamaara': 1586034000000,
    'voimaantulo': null,
    'koulutustoimija': {
      'id': 10,
      'nimi': {
        'fi': 'Kaarinan kaupunki',
      },
    },
    'julkaisukielet': [],
    'koulutustyyppi': 'koulutustyyppi_1',
    'perusteNimi': {
      'fi': 'Ajoneuvoalan ammattitutkinto',
    },
    'perusteId': 4804100,
  }, {
    'nimi': {
      'fi': 'test2',
    },
    'tila': 'julkaistu',
    'paatospaivamaara': null,
    'voimaantulo': 1586034000000,
    'koulutustoimija': {
      'id': 10,
      'nimi': {
        'fi': 'Kaarinan kaupunki',
      },
    },
    'julkaisukielet': ['fi'],
    'koulutustyyppi': 'koulutustyyppi_2',
    'perusteNimi': {
      'fi': 'Ajoneuvoalan ammattitutkinto',
    },
    'perusteId': 4804100,
  }, {
    'nimi': {
      'fi': 'test3',
    },
    'tila': 'julkaistu',
    'paatospaivamaara': null,
    'voimaantulo': null,
    'koulutustoimija': {
      'id': 22,
      'nimi': {
        'fi': 'Hesa kaupunki',
      },
    },
    'julkaisukielet': ['fi'],
    'koulutustyyppi': 'koulutustyyppi_3',
    'perusteNimi': {
      'fi': 'Ajoneuvoalan ammattitutkinto',
    },
    'perusteId': 4804101,
  },

];
