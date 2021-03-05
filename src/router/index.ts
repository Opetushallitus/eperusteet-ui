import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';

import RouteArviointi from '@/views/RouteArviointi.vue';
import RouteArviointiasteikot from '@/views/RouteArviointiasteikot.vue';
import RouteGeneerinenArviointi from '@/views/RouteGeneerinenArviointi.vue';
import RouteHome from '@/views/RouteHome.vue';
import RouteJarjesta from '@/views/RouteJarjesta.vue';
import RouteMuodostuminen from '@/views/RouteMuodostuminen.vue';
import RouteOppaat from '@/views/RouteOppaat.vue';
import RouteOppaatLuonti from '@/views/RouteOppaatLuonti.vue';
import RoutePerusteprojekti from '@/views/RoutePerusteprojekti.vue';
import RoutePerusteprojektiLuonti from '@/views/RoutePerusteprojektiLuonti.vue';
import RoutePerusteprojektit from '@/views/RoutePerusteprojektit.vue';
import RoutePohjat from '@/views/RoutePohjat.vue';
import RouteJulkaise from '@/views/RouteJulkaise.vue';
import RoutePohjatLuonti from '@/views/RoutePohjatLuonti.vue';
import RouteRoot from '@/views/RouteRoot.vue';
import RouteTekstikappale from '@/views/RouteTekstikappale.vue';
import RouteTermisto from '@/views/RouteTermisto.vue';
import RouteProjektiTiedot from '@/views/RouteProjektiTiedot.vue';
import RoutePerusteenTiedot from '@/views/RoutePerusteenTiedot.vue';
import RouteKvliite from '@/views/RouteKvliite.vue';
import RouteTiedotteet from '@/views/RouteTiedotteet.vue';
import RouteTutkinnonOsa from '@/views/RouteTutkinnonOsa.vue';
import RouteTutkinnonOsanOsaalue from '@/views/tutkinnonosat/RouteTutkinnonOsanOsaalue.vue';
import RouteTutkinnonOsat from '@/views/RouteTutkinnonOsat.vue';
import RouteVirhe from '@/views/RouteVirhe.vue';
import RouteVirheellisetPerusteet from '@/views/RouteVirheellisetPerusteet.vue';
import RouteYleisnakyma from '@/views/RouteYleisnakyma.vue';
import RouteOppaanTiedot from '@/views/RouteOppaanTiedot.vue';
import RoutePdfLuonti from '@/views/RoutePdfLuonti.vue';
import RouteKasite from '@/views/RouteKasite.vue';
import RouteOpintokokonaisuus from '@/views/RouteOpintokokonaisuus.vue';
import RouteKoulutuksenOsa from '@/views/RouteKoulutuksenOsa.vue';
import RouteTilastot from '@/views/RouteTilastot.vue';
import RoutePalautteet from '@/views/RoutePalautteet.vue';

import { changeLang } from '@shared/utils/router';
import { stores } from '@/stores';
import { vaihdaPerusteTilaConfirm } from '@/utils/arkistointi';
import { getCasKayttajaKieli } from '@shared/api/common';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';

Vue.use(VueRouter);
Vue.use(VueMeta, {
  refreshOnceOnNavigation: true,
});

const props = (route: any) => {
  return {
    ...route.params,
    ...stores,
  };
};

const router = new VueRouter({
  routes: [{
    path: '',
  }, {
    path: '/',
  }, {
    path: '/:lang',
    component: RouteRoot,
    props,
    children: [{
      path: '',
      name: 'root',
      component: RouteHome,
      props,
    }, {
      path: '',
      name: 'home',
      component: RouteHome,
      props,
    }, {
      path: 'virhe',
      name: 'virhe',
      component: RouteVirhe,
    }, {
      path: 'oppaat',
      name: 'oppaat',
      component: RouteOppaat,
      props,
    }, {
      path: 'perusteprojektit',
      name: 'perusteprojektit',
      component: RoutePerusteprojektit,
      props,
    }, {
      path: 'pohjat',
      name: 'pohjat',
      component: RoutePohjat,
      props,
    }, {
      path: 'tiedotteet',
      name: 'tiedotteet',
      component: RouteTiedotteet,
      props,
    }, {
      path: 'tilastot',
      name: 'tilastot',
      component: RouteTilastot,
      props,
    }, {
      path: 'palautteet',
      name: 'palautteet',
      component: RoutePalautteet,
      props,
    }, {
      path: 'arviointi',
      name: 'arviointi',
      component: RouteArviointi,
      props,
      children: [{
        path: 'geneerinen',
        name: 'geneerinen',
        component: RouteGeneerinenArviointi,
        props,
      }, {
        path: 'arviointiasteikot',
        name: 'arviointiasteikot',
        component: RouteArviointiasteikot,
        props,
      }],
    }, {
      path: 'virheelliset',
      name: 'virheellisetperusteet',
      component: RouteVirheellisetPerusteet,
      props,
    }, {
      path: 'perusteprojektit/uusi',
      name: 'perusteprojektiLuonti',
      component: RoutePerusteprojektiLuonti,
      props,
    }, {
      path: 'pohjat/uusi',
      name: 'pohjaLuonti',
      component: RoutePohjatLuonti,
      props,
    }, {
      path: 'oppaat/uusi',
      name: 'opasLuonti',
      component: RouteOppaatLuonti,
      props,
    }, {
      path: 'perusteprojekti/:projektiId',
      component: RoutePerusteprojekti,
      props: {
        ...stores,
        ratasvalinnat: [{
          route: 'projektinTiedot',
          icon: 'info',
          text: 'projektin-tiedot',
        }, {
          route: 'perusteenTiedot',
          icon: 'info',
          text: 'perusteen-tiedot',
        }, {
          route: 'perusteenPdfLuonti',
          icon: ['far', 'file-pdf'],
          text: 'luo-pdf',
          disabled: () => !stores.perusteStore.pdfEnabled.value,
        }, {
          route: 'kasitteet',
          icon: 'kasitteet',
          text: 'kasitteet',
        }, {
          separator: true,
        }, {
          icon: ['far', 'folder'],
          text: 'arkistoi-peruste',
          click: vaihdaPerusteTilaConfirm,
          meta: {
            oikeus: { oikeus: 'muokkaus' },
            title: 'arkistoi-peruste',
            confirm: 'arkistoi-peruste-vahvistus',
            reroute: () => stores.perusteStore.isPohja.value ? 'pohjat' : 'perusteprojektit',
            tila: 'poistettu',
            callback: async () => stores.perusteStore.updateCurrent(),
          },
        }],
        palautusMeta: {
          title: 'palauta-peruste',
          confirm: 'palauta-peruste-vahvistus',
          tila: 'laadinta',
          callback: async () => stores.perusteStore.updateCurrent(),
        },
      },
      children: [{
        path: '',
        name: 'perusteprojekti',
        component: RouteYleisnakyma,
        props,
      }, {
        path: 'jarjesta',
        name: 'jarjesta',
        component: RouteJarjesta,
        props,
      }, {
        path: 'julkaise',
        name: 'julkaise',
        component: RouteJulkaise,
        props: {
          ...stores,
          tiedotSivu: {
            name: 'perusteenTiedot',
          },
        },
      }, {
        path: 'rakenne',
        name: 'muodostuminen',
        component: RouteMuodostuminen,
        props,
      }, {
        path: 'tutkinnonosat',
        name: 'tutkinnonosat',
        component: RouteTutkinnonOsat,
        props,
      }, {
        path: 'tekstikappale/:tekstiKappaleId',
        name: 'tekstikappale',
        component: RouteTekstikappale,
        props,
      }, {
        path: 'termisto',
        name: 'termisto',
        component: RouteTermisto,
        props,
      }, {
        path: 'peruste',
        name: 'perusteenTiedot',
        component: RoutePerusteenTiedot,
        props,
      }, {
        path: 'kvliite',
        name: 'kvliite',
        component: RouteKvliite,
        props,
      }, {
        path: 'projekti',
        name: 'projektinTiedot',
        component: RouteProjektiTiedot,
        props,
      }, {
        path: 'poistetut',
        name: 'poistetut',
        component: RoutePerusteenTiedot,
        props,
      }, {
        path: 'tutkinnonosat/:tutkinnonOsaId',
        name: 'tutkinnonosa',
        component: RouteTutkinnonOsa,
        props,
      }, {
        path: 'tutkinnonosat/:tutkinnonOsaId/osaalueet/:osaalueId',
        name: 'osaalue',
        component: RouteTutkinnonOsanOsaalue,
        props,
      }, {
        path: 'pdfluonti',
        name: 'perusteenPdfLuonti',
        component: RoutePdfLuonti,
        props,
      }, {
        path: 'kasitteet',
        name: 'kasitteet',
        component: RouteKasite,
        props,
      }, {
        path: 'opintokokonaisuus/:opintokokonaisuusId',
        name: 'opintokokonaisuus',
        component: RouteOpintokokonaisuus,
        props,
      }, {
        path: 'koulutuksenosa/:koulutuksenosaId',
        name: 'koulutuksenosa',
        component: RouteKoulutuksenOsa,
        props,
      },
      ],
    }, {
      path: 'opas/:projektiId',
      component: RoutePerusteprojekti,
      props: {
        ...stores,
        julkaisuRoute: { name: 'julkaiseOpas' },
        jarjestaRoute: { name: 'jarjestaOpas' },
        ratasvalinnat: [{
          route: 'oppaanTiedot',
          icon: 'info',
          text: 'oppaan-tiedot',
        }, {
          route: 'oppaanPdfLuonti',
          icon: ['far', 'file-pdf'],
          text: 'luo-pdf',
        }, {
          route: 'opasKasitteet',
          icon: 'kasitteet',
          text: 'kasitteet',
        }, {
          separator: true,
        }, {
          icon: ['far', 'folder'],
          text: 'arkistoi-opas',
          click: vaihdaPerusteTilaConfirm,
          meta: {
            oikeus: { oikeus: 'muokkaus' },
            title: 'arkistoi-opas',
            confirm: 'arkistoi-opas-vahvistus',
            reroute: () => 'oppaat',
            tila: 'poistettu',
            callback: async () => stores.perusteStore.updateCurrent(),
          },
        }],
        palautusMeta: {
          title: 'palauta-opas',
          confirm: 'palauta-opas-vahvistus',
          tila: 'laadinta',
          callback: async () => stores.perusteStore.updateCurrent(),
        },
      },
      children: [{
        path: '',
        name: 'opas',
        component: RouteYleisnakyma,
        props: {
          ...stores,
          tyyppi: 'opas',
        },
      }, {
        path: 'tekstikappale/:tekstiKappaleId',
        name: 'oppaanTekstikappale',
        component: RouteTekstikappale,
        props: {
          ...stores,
          koodistoryhmat: [
            {
              ryhma: 'ammatillinen-koulutus',
              koodistot: ['tutkinnonosat', 'osaamisala'],
            },
          ],
        },
      }, {
        path: 'julkaise',
        name: 'julkaiseOpas',
        component: RouteJulkaise,
        props: {
          ...stores,
          tiedotSivu: {
            name: 'oppaanTiedot',
          },
        },
      }, {
        path: 'jarjesta',
        name: 'jarjestaOpas',
        component: RouteJarjesta,
        props,
      }, {
        path: 'tiedot',
        name: 'oppaanTiedot',
        component: RouteOppaanTiedot,
        props,
      }, {
        path: 'pdfluonti',
        name: 'oppaanPdfLuonti',
        component: RoutePdfLuonti,
        props: {
          ...stores,
          selitteenteksti: 'luo-opas-pdf-selite',
        },
      }, {
        path: 'kasitteet',
        name: 'opasKasitteet',
        component: RouteKasite,
        props,
      },
      ],
    },
    ],
  }],
});

window.addEventListener('beforeunload', e => {
  if (EditointiStore.anyEditing()) {
    e.preventDefault();
    // Vanhemmat selainversiot vaativat erillisen varmistustekstin
    e.returnValue = Kielet.kaannaOlioTaiTeksti('poistumisen-varmistusteksti');
  }
});

router.beforeEach(async (to, from, next) => {
  if (EditointiStore.anyEditing()) {
    const value = await router.app.$bvModal.msgBoxConfirm(
      Kielet.kaannaOlioTaiTeksti('poistumisen-varmistusteksti-dialogi'), {
        title: Kielet.kaannaOlioTaiTeksti('haluatko-poistua-tallentamatta'),
        okTitle: Kielet.kaannaOlioTaiTeksti('poistu-tallentamatta'),
        cancelTitle: Kielet.kaannaOlioTaiTeksti('peruuta'),
        size: 'lg',
      });

    if (value) {
      try {
        await EditointiStore.cancelAll();
      }
      finally {
        next();
      }
    }
  }
  else {
    next();
  }
});

router.beforeEach(async (to, from, next) => {
  if (!_.get(to.params, 'lang')) {
    router.push({ path: '/' + await getCasKayttajaKieli() });
  }

  next();
});

router.beforeEach((to, from, next) => {
  changeLang(to, from);
  next();
});

router.beforeEach(async (to, from, next) => {
  const perusteprojektiId = Number(to.params.projektiId);
  const oldId = Number(from.params.projektiId);
  if (!perusteprojektiId) {
    stores.kayttajaStore.clear();
    next();
  }
  else if (perusteprojektiId === oldId) {
    next();
  }
  else {
    try {
      await stores.kayttajaStore.setPerusteprojekti(perusteprojektiId);
      next();
    }
    catch (err) {
      throw new Error(err);
    }
  }
});

export default router;
