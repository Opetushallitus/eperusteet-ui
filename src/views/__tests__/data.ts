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
          fi: "Tyydyttävä T1",
        }
      }, {
        id: 6,
        otsikko: {
          fi: "Tyydyttävä T2",
        }
      }, {
        id: 7,
        otsikko: {
          fi: "Hyvä H3",
        }
      }, {
        id: 8,
        otsikko: {
          fi: "Hyvä H4",
        }
      }, {
        id: 9,
        otsikko: {
          fi: "Kiitettävä K5",
        }
      }]
    } as any],
  };
}

