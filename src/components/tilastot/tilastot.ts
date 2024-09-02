import { Koulutustyyppi } from '@shared/tyypit';
import { AmmatillisetKoulutustyypit, koulutustyyppiRyhmaSort, koulutustyyppiSort, themes, VapaasivistystyoKoulutustyypit } from '@shared/utils/perusteet';
import * as _ from 'lodash';

export function suunnitelmatTilastoksi(suunnitelmat, alkupvm, loppupvm) {
  return _.chain(suunnitelmat)
    .reduce((tulos, suunnitelma) => {
      const koulutustyyppi = maaritteleKoulutustyyppi(suunnitelma);

      if (!tulos[koulutustyyppi]) {
        tulos[koulutustyyppi] = {
          koulutustyyppi: koulutustyyppi,
          ryhma: tilastoRyhmat[koulutustyyppi] ?? 'maarittelematon',
          julkaistut: 0,
          luonnokset: 0,
          arkistoidut: 0,
          yhteensa: 0,
          uusia: 0,
          tyyppi: 'suunnitelma',
        };
      }

      if (suunnitelma.tila === 'luonnos' && suunnitelma.luotu <= loppupvm) {
        tulos[koulutustyyppi].luonnokset++;
      }
      else if (suunnitelma.tila === 'julkaistu' && (suunnitelma.ensijulkaisu <= loppupvm || suunnitelma.viimeisinTilaMuutosAika <= loppupvm)) {
        tulos[koulutustyyppi].julkaistut++;
      }
      else if (suunnitelma.tila === 'poistettu' && suunnitelma.viimeisinTilaMuutosAika <= loppupvm) {
        tulos[koulutustyyppi].arkistoidut++;
      }

      if (suunnitelma.luotu >= alkupvm && suunnitelma.luotu <= loppupvm) {
        tulos[koulutustyyppi].uusia++;
      }

      tulos[koulutustyyppi].yhteensa = tulos[koulutustyyppi].julkaistut + tulos[koulutustyyppi].luonnokset + tulos[koulutustyyppi].arkistoidut;

      return tulos;
    }, {})
    .toArray()
    .value();
}

function maaritteleKoulutustyyppi(suunnitelma) {
  if (suunnitelma.jotpatyyppi) {
    return 'koulutustyyppi_muu';
  }

  if (_.includes(VapaasivistystyoKoulutustyypit, suunnitelma.koulutustyyppi)) {
    if (!suunnitelma.perusteId) {
      return 'vapaatavoitteiset_ei_jotpa';
    }
    else {
      return 'kops';
    }
  }

  if (!suunnitelma.koulutustyyppi) {
    return 'maarittelematon';
  }

  if (_.includes(AmmatillisetKoulutustyypit, suunnitelma.koulutustyyppi) && suunnitelma.tyyppi === 'yhteinen') {
    return 'osaamisen_arvioinnin_toteutussuunnitelma';
  }

  return suunnitelma.koulutustyyppi;
}

const tilastoRyhmat = {
  ...themes,
  vapaatavoitteiset_ei_jotpa: 'vapaasivistystyo',
  kops: 'vapaasivistystyo',
  osaamisen_arvioinnin_toteutussuunnitelma: 'ammatillinen',
};

export const koulutustyyppiTilastoSort = {
  ...koulutustyyppiSort,
  osaamisen_arvioinnin_toteutussuunnitelma: 66,
  kops: 74,
  vapaatavoitteiset_ei_jotpa: 75,
};
