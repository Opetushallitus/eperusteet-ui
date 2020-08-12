import Vue from 'vue';
import VueRouter from 'vue-router';

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

import { changeLang } from '@shared/utils/router';
import { stores } from '@/stores';
import { arkistoiPeruste } from '@/utils/arkistointi';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [{
    path: '',
    redirect: () => '/fi',
  }, {
    path: '/',
    redirect: () => '/fi',
  }, {
    path: '/:lang',
    component: RouteRoot,
    props: { ...stores },
    children: [{
      path: '',
      name: 'root',
      component: RouteHome,
      props: { ...stores },
    }, {
      path: '',
      name: 'home',
      component: RouteHome,
      props: { ...stores },
    }, {
      path: 'virhe',
      name: 'virhe',
      component: RouteVirhe,
    }, {
      path: 'oppaat',
      name: 'oppaat',
      component: RouteOppaat,
      props: { ...stores },
    }, {
      path: 'perusteprojektit',
      name: 'perusteprojektit',
      component: RoutePerusteprojektit,
      props: { ...stores },
    }, {
      path: 'pohjat',
      name: 'pohjat',
      component: RoutePohjat,
      props: { ...stores },
    }, {
      path: 'tiedotteet',
      name: 'tiedotteet',
      component: RouteTiedotteet,
      props: { ...stores },
    }, {
      path: 'arviointi',
      name: 'arviointi',
      component: RouteArviointi,
      props: { ...stores },
      children: [{
        path: 'geneerinen',
        name: 'geneerinen',
        component: RouteGeneerinenArviointi,
        props: { ...stores },
      }, {
        path: 'arviointiasteikot',
        name: 'arviointiasteikot',
        component: RouteArviointiasteikot,
        props: { ...stores },
      }],
    }, {
      path: 'virheelliset',
      name: 'virheellisetperusteet',
      component: RouteVirheellisetPerusteet,
      props: { ...stores },
    }, {
      path: 'perusteprojektit/uusi',
      name: 'perusteprojektiLuonti',
      component: RoutePerusteprojektiLuonti,
      props: { ...stores },
    }, {
      path: 'pohjat/uusi',
      name: 'pohjaLuonti',
      component: RoutePohjatLuonti,
      props: { ...stores },
    }, {
      path: 'oppaat/uusi',
      name: 'opasLuonti',
      component: RouteOppaatLuonti,
      props: { ...stores },
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
          route: 'dokumentti',
          icon: ['far', 'file-pdf'],
          text: 'luo-pdf',
        }, {
          route: 'perusteenPdfLuonti',
          icon: ['far', 'file-pdf'],
          text: 'luo-pdf',
        }, {
          route: 'poistetut',
          icon: 'roskalaatikko',
          text: 'poistetut-sisallot',
        }, {
          separator: true,
        }, {
          icon: ['far', 'folder'],
          text: 'arkistoi-peruste',
          click: arkistoiPeruste,
          meta: {
            title: 'arkistoi-peruste',
            confirm: 'arkistoi-peruste-vahvistus',
            reroute: 'perusteprojektit',
          },
        }],
      },
      children: [{
        path: '',
        name: 'perusteprojekti',
        component: RouteYleisnakyma,
        props: { ...stores },
      }, {
        path: 'jarjesta',
        name: 'jarjesta',
        component: RouteJarjesta,
        props: { ...stores },
      }, {
        path: 'julkaise',
        name: 'julkaise',
        component: RouteJulkaise,
        props: { ...stores },
      }, {
        path: 'rakenne',
        name: 'muodostuminen',
        component: RouteMuodostuminen,
        props: { ...stores },
      }, {
        path: 'tutkinnonosat',
        name: 'tutkinnonosat',
        component: RouteTutkinnonOsat,
        props: { ...stores },
      }, {
        path: 'tekstikappale/:tekstiKappaleId',
        name: 'tekstikappale',
        component: RouteTekstikappale,
        props: { ...stores },
      }, {
        path: 'termisto',
        name: 'termisto',
        component: RouteTermisto,
        props: { ...stores },
      }, {
        path: 'peruste',
        name: 'perusteenTiedot',
        component: RoutePerusteenTiedot,
        props: { ...stores },
      }, {
        path: 'kvliite',
        name: 'kvliite',
        component: RouteKvliite,
        props: { ...stores },
      }, {
        path: 'projekti',
        name: 'projektinTiedot',
        component: RouteProjektiTiedot,
        props: { ...stores },
      }, {
        path: 'dokumentti',
        name: 'dokumentti',
        component: RoutePerusteenTiedot,
        props: { ...stores },
      }, {
        path: 'poistetut',
        name: 'poistetut',
        component: RoutePerusteenTiedot,
        props: { ...stores },
      }, {
        path: 'tutkinnonosat/:tutkinnonOsaId',
        name: 'tutkinnonosa',
        component: RouteTutkinnonOsa,
        props: { ...stores },
      }, {
        path: 'tutkinnonosat/:tutkinnonOsaId/osaalueet/:osaalueId',
        name: 'osaalue',
        component: RouteTutkinnonOsanOsaalue,
        props: { ...stores },
      }, {
        path: 'pdfluonti',
        name: 'perusteenPdfLuonti',
        component: RoutePdfLuonti,
        props: { ...stores },
      }],
    }, {
      path: 'opas/:projektiId',
      component: RoutePerusteprojekti,
      props: {
        ...stores,
        ratasvalinnat: [{
          route: 'oppaanTiedot',
          icon: 'info',
          text: 'oppaan-tiedot',
        }, {
          route: 'oppaanPdfLuonti',
          icon: ['far', 'file-pdf'],
          text: 'luo-pdf',
        }, {
          route: 'poistetut',
          icon: 'roskalaatikko',
          text: 'poistetut-sisallot',
        }, {
          separator: true,
        }, {
          icon: ['far', 'folder'],
          text: 'arkistoi-opas',
          click: arkistoiPeruste,
          meta: {
            title: 'arkistoi-opas',
            confirm: 'arkistoi-opas-vahvistus',
            reroute: 'oppaat',
          },
        }],
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
        path: 'tiedot',
        name: 'oppaanTiedot',
        component: RouteOppaanTiedot,
        props: { ...stores },
      }, {
        path: 'pdfluonti',
        name: 'oppaanPdfLuonti',
        component: RoutePdfLuonti,
        props: {
          ...stores,
          selitteenteksti: 'luo-opas-pdf-selite',
        },
      },
      ],
    },
    ],
  }],
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
