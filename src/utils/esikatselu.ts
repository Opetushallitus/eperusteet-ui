import { Kielet } from '@shared/stores/kieli';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { koulutustyyppiTheme, tyyppiTheme } from '@shared/utils/perusteet';

export function buildPerusteEsikatseluUrl(peruste) {
  return buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/${perusteTheme(peruste)}/${peruste.id}`);
}

function perusteTheme(peruste) {
  if (peruste.koulutustyyppi) {
    return koulutustyyppiTheme(peruste.koulutustyyppi);
  }

  return tyyppiTheme(peruste.tyyppi);
}
