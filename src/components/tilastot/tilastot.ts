import { themes } from '@shared/utils/perusteet';
import * as _ from 'lodash';

export function suunnitelmatTilastoksi(suunnitelmat, alkupvm, loppupvm) {
  return _.chain(suunnitelmat)
    .reduce((tulos, suunnitelma) => {
      let koulutustyyppi = suunnitelma.koulutustyyppi; ;
      if (suunnitelma.jotpatyyppi) {
        koulutustyyppi = 'koulutustyyppi_muu';
      }

      if (!suunnitelma.koulutustyyppi) {
        koulutustyyppi = 'maarittelematon';
      }

      if (!tulos[koulutustyyppi]) {
        tulos[koulutustyyppi] = {
          koulutustyyppi: koulutustyyppi,
          ryhma: themes[koulutustyyppi] ?? 'maarittelematon',
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
