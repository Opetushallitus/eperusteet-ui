import { RouteLocationNormalized, RouteLocationRaw } from 'vue-router';
import { NavigationNodeDto } from '@shared/tyypit';
import * as _ from 'lodash';
import { ILinkkiHandler } from '@shared/components/EpContent/LinkkiHandler';

const ignoredRouteNames = ['kasitteet', 'opasKasitteet', 'poistetut', 'opas', 'oppaanTiedot', 'julkaise', 'perusteprojekti', 'perusteenTiedot'];

export function routeToNode(route: RouteLocationNormalized): NavigationNodeDto | null {
  if (!route || _.includes(ignoredRouteNames, route.name)) {
    return null;
  }

  switch (route.name) {
  case 'tekstikappale':
    return {
      type: 'viite',
      id: Number(route.params.tekstiKappaleId),
    };
  case 'muodostuminen':
    return {
      type: 'muodostuminen',
    };
  case 'osaalue':
    return {
      type: 'osaalue',
      id: Number(route.params.osaalueId),
    };
  case 'tutkinnonosa':
    return {
      type: 'tutkinnonosaviite',
      id: Number(route.params.tutkinnonOsaId),
    };
  case 'kvliite':
    return {
      type: 'kvliite',
    };
  case 'tutkinnonosat':
    return {
      type: 'tutkinnonosat',
    };
  case 'opintokokonaisuus':
    return {
      type: 'opintokokonaisuus',
      id: Number(route.params.opintokokonaisuusId),
    };
  case 'koulutuksenosa':
    return {
      type: 'koulutuksenosa',
      id: Number(route.params.koulutuksenosaId),
    };
  case 'laajaalainenosaaminen':
    return {
      type: 'laajaalainenosaaminen',
      id: Number(route.params.laajaalainenosaaminenId),
    };
  case 'tavoitesisaltoalue':
    return {
      type: 'tavoitesisaltoalue',
      id: Number(route.params.tavoitesisaltoalueId),
    };
  case 'koto_kielitaitotaso':
    return {
      type: 'koto_kielitaitotaso',
      id: Number(route.params.kotokielitaitotasoId),
    };
  case 'koto_opinto':
    return {
      type: 'koto_opinto',
      id: Number(route.params.kotoOpintoId),
    };
  case 'koto_laajaalainenosaaminen':
    return {
      type: 'koto_laajaalainenosaaminen',
      id: Number(route.params.kotoLaajaalainenOsaaminenId),
    };
  case 'aipelaajaAlainenOsaaminen':
    return {
      type: 'aipe_laajaalainenosaaminen',
      id: Number(route.params.laoId),
    };
  case 'aipeLaajaAlaisetOsaamiset':
    return {
      type: 'aipe_laajaalainenosaaminen',
    };
  case 'aipevaihe':
    return {
      type: 'aipevaihe',
      id: Number(route.params.vaiheId),
    };
  case 'aipeoppiaine':
    if (route.params.oppiaineId) {
      return {
        type: 'aipeoppiaine',
        id: Number(route.params.oppiaineId),
      };
    }
    return {
      type: 'aipevaihe',
      id: Number(route.params.vaiheId),
    };
  case 'aipekurssi':
    return {
      type: 'aipekurssi',
      id: Number(route.params.kurssiId),
    };
  case 'taiteenala':
    return {
      type: 'taiteenala',
      id: Number(route.params.taiteenalaId),
    };
  case 'lukio_oppiaine':
    return {
      type: 'oppiaine',
      id: Number(route.params.oppiaineId),
    };
  case 'moduuli':
    return {
      type: 'moduuli',
      id: Number(route.params.moduuliId),
    };
  case 'lukio_oppiaineet':
    return {
      type: 'lukio_oppiaineet',
    };
  case 'lukio_laajaAlaisetOsaamiset':
    return {
      type: 'lukio_laajaAlaisetOsaamiset',
    };
  case 'osaamiskokonaisuus':
    return {
      type: 'osaamiskokonaisuus',
      id: Number(route.params.osaamiskokonaisuusId),
    };
  case 'osaamiskokonaisuus_paa_alue':
    return {
      type: 'osaamiskokonaisuus_paa_alue',
      id: Number(route.params.osaamiskokonaisuusPaaAlueId),
    };
  case 'perusopetusoppiaine':
    return {
      type: 'perusopetusoppiaine',
      id: Number(route.params.oppiaineId),
    };
  case 'perusopetusOppiaineet':
    return {
      type: 'perusopetusOppiaineet',
    };
  case 'perusopetusLaajaAlaisetOsaamiset':
    return {
      type: 'perusopetusLaajaAlaisetOsaamiset',
    };
  case 'perusopetusVuosiluokkakokonaisuudet':
    return {
      type: 'perusopetusVuosiluokkakokonaisuudet',
    };
  case 'perusopetusLaajaAlainenOsaaminen':
    return {
      type: 'perusopetuslaajaalainenosaaminen',
      id: Number(route.params.laoId),
    };
  case 'perusopetusVuosiluokkakokonaisuus':
    return {
      type: 'vuosiluokkakokonaisuus',
      id: Number(route.params.vlkId),
    };
  case 'kaantajataito':
    return {
      type: 'kaantajataito',
      id: Number(route.params.kaantajataitoId),
    };
  case 'kaantajataitotasoasteikko':
    return {
      type: 'kaantajataitotasoasteikko',
      id: Number(route.params.kaantajataitotasoasteikkoId),
    };
  case 'kaantajakielitaito':
    return {
      type: 'kaantajakielitaito',
      id: Number(route.params.kaantajakielitaitoId),
    };
  case 'kaantajataitotasokuvaus':
    return {
      type: 'kaantajataitotasokuvaus',
      id: Number(route.params.kaantajataitotasokuvausId),
    };
  case 'kaantajaaihealue':
    return {
      type: 'kaantajaaihealue',
      id: Number(route.params.kaantajaaihealueId),
    };
  case 'kaantajatodistusmalli':
    return {
      type: 'kaantajatodistusmalli',
      id: Number(route.params.kaantajatodistusmalliId),
    };
  case 'peruste-yleisnakyma':
    return null;
  default:
    console.warn('Unknown route', route.name, route);
    break;
  }

  return null;
}

export function nodeToRoute(node: NavigationNodeDto): RouteLocationRaw | null {
  if (!node) {
    return null;
  }

  switch (node.type) {
  case 'tekstikappale':
    return {
      name: 'tekstikappale',
      params: {
        tekstiKappaleId: _.toString(node.id),
      },
    };
  case 'viite':
    return {
      name: 'tekstikappale',
      params: {
        tekstiKappaleId: _.toString(node.id),
      },
    };
  case 'tutkinnonosaviite':
    return {
      name: 'tutkinnonosa',
      params: {
        tutkinnonOsaId: _.toString(node.id),
      },
    };
  case 'osaalue':
    return {
      name: 'osaalue',
      params: {
        osaalueId: _.toString(node.id),
      },
    };
  case 'liite':
    return {
      name: 'tekstikappale',
      params: {
        tekstiKappaleId: _.toString(node.id),
      },
    };
  case 'opintokokonaisuus':
    return {
      name: 'opintokokonaisuus',
      params: {
        opintokokonaisuusId: _.toString(node.id),
      },
    };
  case 'tavoitesisaltoalue':
    return {
      name: 'tavoitesisaltoalue',
      params: {
        tavoitesisaltoalueId: _.toString(node.id),
      },
    };
  case 'koulutuksenosa':
    return {
      name: 'koulutuksenosa',
      params: {
        koulutuksenosaId: _.toString(node.id),
      },
    };
  case 'laajaalainenosaaminen':
    return {
      name: 'laajaalainenosaaminen',
      params: {
        laajaalainenosaaminenId: _.toString(node.id),
      },
    };
  case 'koto_kielitaitotaso':
    return {
      name: 'koto_kielitaitotaso',
      params: {
        kotokielitaitotasoId: _.toString(node.id),
      },
    };
  case 'koto_opinto':
    return {
      name: 'koto_opinto',
      params: {
        kotoOpintoId: _.toString(node.id),
      },
    };
  case 'koto_laajaalainenosaaminen':
    return {
      name: 'koto_laajaalainenosaaminen',
      params: {
        kotoLaajaalainenOsaaminenId: _.toString(node.id),
      },
    };
  case 'osaamiskokonaisuus':
    return {
      name: 'osaamiskokonaisuus',
      params: {
        osaamiskokonaisuusId: _.toString(node.id),
      },
    };
  case 'osaamiskokonaisuus_paa_alue':
    return {
      name: 'osaamiskokonaisuus_paa_alue',
      params: {
        osaamiskokonaisuusPaaAlueId: _.toString(node.id),
      },
    };
  case 'perusopetusoppiaine':
    return {
      name: 'perusopetusoppiaine',
      params: {
        oppiaineId: _.toString(node.id),
      },
    };
  case 'aipe_laajaalainenosaaminen':
    return {
      name: 'aipelaajaAlainenOsaaminen',
      params: {
        laoId: _.toString(node.id),
      },
    };
  case 'aipevaihe':
    return {
      name: 'aipevaihe',
      params: {
        vaiheId: _.toString(node.id),
      },
    };
  case 'aipeoppiaine':
    return {
      name: 'aipeoppiaine',
      params: {
        oppiaineId: _.toString(node.id),
      },
    };
  case 'aipekurssi':
    return {
      name: 'aipekurssi',
      params: {
        kurssiId: _.toString(node.id),
      },
    };
  case 'taiteenala':
    return {
      name: 'taiteenala',
      params: {
        taiteenalaId: _.toString(node.id),
      },
    };
  case 'oppiaine':
    return {
      name: 'lukio_oppiaine',
      params: {
        oppiaineId: _.toString(node.id),
      },
    };
  case 'moduuli':
    return {
      name: 'moduuli',
      params: {
        moduuliId: _.toString(node.id),
      },
    };
  case 'lukio_oppiaineet':
    return {
      name: 'lukio_oppiaineet',
    };
  case 'lukio_laajaAlaisetOsaamiset':
    return {
      name: 'lukio_laajaAlaisetOsaamiset',
    };
  case 'perusopetusOppiaineet':
    return {
      name: 'perusopetusOppiaineet',
    };
  case 'perusopetusLaajaAlaisetOsaamiset':
    return {
      name: 'perusopetusLaajaAlaisetOsaamiset',
    };
  case 'perusopetusVuosiluokkakokonaisuudet':
    return {
      name: 'perusopetusVuosiluokkakokonaisuudet',
    };
  case 'perusopetuslaajaalainenosaaminen':
    return {
      name: 'perusopetusLaajaAlainenOsaaminen',
      params: {
        laoId: _.toString(node.id),
      },
    };
  case 'vuosiluokkakokonaisuus':
    return {
      name: 'perusopetusVuosiluokkakokonaisuus',
      params: {
        vlkId: _.toString(node.id),
      },
    };
  case 'kvliite':
    return {
      name: 'kvliite',
    };
  case 'tutkinnonosat':
    return {
      name: 'tutkinnonosat',
    };
  case 'muodostuminen':
    return {
      name: 'muodostuminen',
    };
  case 'kaantajataitotasoasteikko':
    return {
      name: 'kaantajataitotasoasteikko',
      params: {
        kaantajataitotasoasteikkoId: _.toString(node.id),
      },
    };
  case 'kaantajataito':
    return {
      name: 'kaantajataito',
      params: {
        kaantajataitoId: _.toString(node.id),
      },
    };
  case 'kaantajakielitaito':
    return {
      name: 'kaantajakielitaito',
      params: {
        kaantajakielitaitoId: _.toString(node.id),
      },
    };
  case 'kaantajataitotasokuvaus':
    return {
      name: 'kaantajataitotasokuvaus',
      params: {
        kaantajataitotasokuvausId: _.toString(node.id),
      },
    };
  case 'kaantajaaihealue':
    return {
      name: 'kaantajaaihealue',
      params: {
        kaantajaaihealueId: _.toString(node.id),
      },
    };
  case 'kaantajatodistusmalli':
    return {
      name: 'kaantajatodistusmalli',
      params: {
        kaantajatodistusmalliId: _.toString(node.id),
      },
    };
  default:
    console.warn('Unknown node', node.type);
    break;
  }
  return null;
}

export class LinkkiHandler implements ILinkkiHandler {
  nodeToRoute(node: NavigationNodeDto): RouteLocationRaw | null {
    return nodeToRoute(node);
  }
}

export function convertRouteParamsToNumbers(params: { [key: string]: string }) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
      acc[key] = Number(value);
    }
    else {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
}
