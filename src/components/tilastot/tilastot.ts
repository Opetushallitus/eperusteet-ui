import { Koulutustyyppi } from '@shared/tyypit';
import { AmmatillisetKoulutustyypit, koulutustyyppiRyhmaSort, koulutustyyppiSort, themes, VapaasivistystyoKoulutustyypit } from '@shared/utils/perusteet';
import * as _ from 'lodash';
import moment from 'moment';
import * as ExcelJS from 'exceljs';

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
      else if (suunnitelma.tila === 'julkaistu' && ((suunnitelma.viimeisinTilaMuutosAika && suunnitelma.viimeisinTilaMuutosAika <= loppupvm) || (suunnitelma.ensijulkaisu && suunnitelma.ensijulkaisu <= loppupvm))) {
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

export function csvAikaleima(value) {
  return value ? moment(value).format('YYYY-MM-DD') : null;
}

export async function dataTiedostoksi(tyyppi, sisaltoTyyppi, tiedostoData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tilastot');

  // Add headers and data
  if (tiedostoData.length > 0) {
    const headers = Object.keys(tiedostoData[0]);
    worksheet.addRow(headers);

    tiedostoData.forEach(row => {
      const values = headers.map(header => row[header]);
      worksheet.addRow(values);
    });
  }

  // Generate file
  const fileName = `tilastot-${sisaltoTyyppi}-${moment(new Date()).format('YYYYMMDDHHmm')}.${tyyppi}`;

  let buffer;
  if (tyyppi === 'csv') {
    buffer = await workbook.csv.writeBuffer();
  }
  else {
    buffer = await workbook.xlsx.writeBuffer();
  }

  // Create blob and trigger download
  const blob = new Blob([buffer], {
    type: tyyppi === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}
