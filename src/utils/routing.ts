import { Location } from 'vue-router';
import { NavigationNodeDto } from '@shared/tyypit';
import * as _ from 'lodash';
import { ILinkkiHandler } from '@shared/components/EpContent/LinkkiHandler';

const ignoredRouteNames = ['kasitteet', 'opasKasitteet', 'poistetut', 'opas', 'oppaanTiedot'];

export function routeToNode(route: Location): NavigationNodeDto | null {
  if (!route || _.includes(ignoredRouteNames, route.name)) {
    return null;
  }

  switch (route.name) {
  case 'tekstikappale':
    return {
      type: 'viite',
      id: Number(route.params?.tekstiKappaleId!),
    };
  case 'muodostuminen':
    return {
      type: 'muodostuminen',
    };
  case 'osaalue':
    return {
      type: 'osaalue',
      id: Number(route.params?.osaalueId!),
    };
  case 'tutkinnonosa':
    return {
      type: 'tutkinnonosaviite',
      id: Number(route.params?.tutkinnonOsaId!),
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
      id: Number(route.params?.opintokokonaisuusId!),
    };
  case 'koulutuksenosa':
    return {
      type: 'koulutuksenosa',
      id: Number(route.params?.koulutuksenosaId!),
    };
  case 'laajaalainenosaaminen':
    return {
      type: 'laajaalainenosaaminen',
      id: Number(route.params?.laajaalainenosaaminenId!),
    };
  case 'tavoitesisaltoalue':
    return {
      type: 'tavoitesisaltoalue',
      id: Number(route.params?.tavoitesisaltoalueId!),
    };
  case 'koto_kielitaitotaso':
    return {
      type: 'koto_kielitaitotaso',
      id: Number(route.params?.kotokielitaitotasoId!),
    };
  case 'koto_opinto':
    return {
      type: 'koto_opinto',
      id: Number(route.params?.kotoOpintoId!),
    };
  default:
    console.error('Unknown route', route.name, route);
    break;
  }

  return null;
};

export function nodeToRoute(node: NavigationNodeDto): Location | null {
  if (!node) {
    return null;
  }

  switch (node.type) {
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
  default:
    console.error('Unknown node', node.type);
    break;
  }
  return null;
};

export class LinkkiHandler implements ILinkkiHandler {
  nodeToRoute(node: NavigationNodeDto): Location | null {
    return nodeToRoute(node);
  }
}
