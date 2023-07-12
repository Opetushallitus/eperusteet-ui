import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';

import RouteArviointi from '@/views/RouteArviointi.vue';
import RouteArviointiasteikot from '@/views/RouteArviointiasteikot.vue';
import RouteGeneerinenArviointi from '@/views/RouteGeneerinenArviointi.vue';
import RouteHome from '@/views/RouteHome.vue';
import RouteJarjesta from '@/views/RouteJarjesta.vue';
import RouteJulkaise from '@/views/RouteJulkaise.vue';
import RouteKaannokset from '@/views/RouteKaannokset.vue';
import RouteKasite from '@/views/RouteKasite.vue';
import RouteKoulutuksenOsa from '@/views/RouteKoulutuksenOsa.vue';
import RouteKvliite from '@/views/RouteKvliite.vue';
import RouteLaajaalainenOsaaminen from '@/views/RouteLaajaalainenOsaaminen.vue';
import RouteMuodostuminen from '@/views/RouteMuodostuminen.vue';
import RouteOpintokokonaisuus from '@/views/RouteOpintokokonaisuus.vue';
import RouteOppaanTiedot from '@/views/RouteOppaanTiedot.vue';
import RouteOppaat from '@/views/RouteOppaat.vue';
import RouteOppaatLuonti from '@/views/RouteOppaatLuonti.vue';
import RoutePalautteet from '@/views/RoutePalautteet.vue';
import RoutePdfLuonti from '@/views/RoutePdfLuonti.vue';
import RoutePerusteenTiedot from '@/views/RoutePerusteenTiedot.vue';
import RoutePerusteprojekti from '@/views/RoutePerusteprojekti.vue';
import RoutePerusteprojektiLuonti from '@/views/RoutePerusteprojektiLuonti.vue';
import RoutePerusteprojektit from '@/views/RoutePerusteprojektit.vue';
import RoutePohjat from '@/views/RoutePohjat.vue';
import RouteDigitaalisetOsaamiset from '@/views/RouteDigitaalisetOsaamiset.vue';
import RouteDigitaalisetOsaamisetLuonti from '@/views/RouteDigitaalisetOsaamisetLuonti.vue';
import RoutePohjatLuonti from '@/views/RoutePohjatLuonti.vue';
import RouteProjektiTiedot from '@/views/RouteProjektiTiedot.vue';
import RouteRoot from '@/views/RouteRoot.vue';
import RouteTekstikappale from '@/views/RouteTekstikappale.vue';
import RouteTermisto from '@/views/RouteTermisto.vue';
import RouteTiedotteet from '@/views/RouteTiedotteet.vue';
import RouteTilastot from '@/views/RouteTilastot.vue';
import RouteYllapito from '@/views/RouteYllapito.vue';
import RouteTutkinnonOsa from '@/views/RouteTutkinnonOsa.vue';
import RouteTutkinnonOsanOsaalue from '@/views/tutkinnonosat/RouteTutkinnonOsanOsaalue.vue';
import RouteTutkinnonOsat from '@/views/RouteTutkinnonOsat.vue';
import RouteYleisnakyma from '@/views/RouteYleisnakyma.vue';
import RouteTavoitesisaltoalue from '@/views/RouteTavoitesisaltoalue.vue';
import RouteKotoKielitaitotaso from '@/views/RouteKotoKielitaitotaso.vue';
import RouteKotoOpinto from '@/views/RouteKotoOpinto.vue';
import RouteKotoLaajaalainenOsaaminen from '@/views/RouteKotoLaajaalainenOsaaminen.vue';
import RouteMaaraykset from '@/views/RouteMaaraykset.vue';
import RoutePoistetutSisallot from '@/views/RoutePoistetutSisallot.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpErrorPage from '@shared/components/EpErrorPage/EpErrorPage.vue';
import RouteOsaamiskokonaisuus from '@/views/RouteOsaamiskokonaisuus.vue';
import RouteOsaamiskokonaisuusPaaAlue from '@/views/RouteOsaamiskokonaisuusPaaAlue.vue';
import RouteAipeKurssi from '@/views/aipe/RouteAipeKurssi.vue';
import RouteAipeLaajaAlainenOsaaminen from '@/views/aipe/RouteAipeLaajaAlainenOsaaminen.vue';
import RouteAipeLaajaAlaisetOsaamiset from '@/views/aipe/RouteAipeLaajaAlaisetOsaamiset.vue';
import RouteAipeOppiaine from '@/views/aipe/RouteAipeOppiaine.vue';
import RouteAipeVaihe from '@/views/aipe/RouteAipeVaihe.vue';
import RouteTaiteenala from '@/views/tpo/RouteTaiteenala.vue';
import RouteLaajaAlaisetOsaamiset from '@/views/lukio/RouteLaajaAlaisetOsaamiset.vue';
import RouteModuuli from '@/views/lukio/RouteModuuli.vue';
import RouteOppiaine from '@/views/lukio/RouteOppiaine.vue';
import RouteOppiaineet from '@/views/lukio/RouteOppiaineet.vue';
import RouteVuosiluokkakokonaisuudet from '@/views/perusopetus/RouteVuosiluokkakokonaisuudet.vue';
import RouteVuosiluokkakokonaisuus from '@/views/perusopetus/RouteVuosiluokkakokonaisuus.vue';
import RoutePerusopetusOppiaineet from '@/views/perusopetus/RouteOppiaineet.vue';
import RoutePerusopetusLaajaAlaisetOsaamiset from '@/views/perusopetus/RouteLaajaAlaisetOsaamiset.vue';
import RoutePerusopetusLaajaAlainenOsaaminen from '@/views/perusopetus/RouteLaajaAlainenOsaaminen.vue';
import RoutePerusopetusOppiaine from '@/views/perusopetus/RouteOppiaine.vue';

import { changeLang } from '@shared/utils/router';
import { stores } from '@/stores';
import { vaihdaPerusteTilaConfirm } from '@/utils/arkistointi';
import { getCasKayttajaKieli } from '@shared/api/common';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';

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
      path: 'kaannokset',
      name: 'kaannokset',
      component: RouteKaannokset,
    }, {
      path: 'virhe',
      name: 'virhe',
      component: EpErrorPage,
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
      path: 'digitaalisetosaamiset',
      name: 'digitaalisetosaamiset',
      component: RouteDigitaalisetOsaamiset,
      props,
    }, {
      path: 'tiedotteet',
      name: 'tiedotteet',
      component: RouteTiedotteet,
      props,
    }, {
      path: 'maaraykset',
      name: 'maaraykset',
      component: RouteMaaraykset,
      props,
    }, {
      path: 'tilastot',
      name: 'tilastot',
      component: RouteTilastot,
      props,
    }, {
      path: 'yllapito',
      name: 'yllapito',
      component: RouteYllapito,
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
      path: 'digitaalisetosaamiset/uusi',
      name: 'digitaalinenOsaaminenLuonti',
      component: RouteDigitaalisetOsaamisetLuonti,
      props,
    }, {
      path: 'perusteprojekti/:projektiId',
      component: RoutePerusteprojekti,
      name: 'perusteprojekti',
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
          route: 'poistetutsisallot',
          icon: 'roskalaatikko',
          text: 'poistetut',
        }, {
          separator: true,
        }, {
          icon: ['far', 'folder'],
          text: 'arkistoi-peruste',
          click: vaihdaPerusteTilaConfirm,
          meta: {
            oikeus: () => stores.perusteStore.isJulkaistu.value ? { oikeus: 'hallinta', kohde: 'pohja' } : { oikeus: 'muokkaus' },
            title: 'arkistoi-peruste',
            confirm: 'arkistoi-peruste-vahvistus',
            reroute: () => stores.perusteStore.arkistointiReroute.value,
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
        path: 'poistetutsisallot',
        name: 'poistetutsisallot',
        component: RoutePoistetutSisallot,
        props,
      }, {
        path: 'tutkinnonosat/:tutkinnonOsaId',
        name: 'tutkinnonosa',
        component: RouteTutkinnonOsa,
        props,
      }, {
        path: 'osaalueet/:osaalueId',
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
      }, {
        path: 'laajaalainenosaaminen/:laajaalainenosaaminenId',
        name: 'laajaalainenosaaminen',
        component: RouteLaajaalainenOsaaminen,
        props,
      }, {
        path: 'tavoitesisaltoalue/:tavoitesisaltoalueId',
        name: 'tavoitesisaltoalue',
        component: RouteTavoitesisaltoalue,
        props,
      }, {
        path: 'koto/kielitaitotaso/:kotokielitaitotasoId',
        name: 'koto_kielitaitotaso',
        component: RouteKotoKielitaitotaso,
        props,
      }, {
        path: 'koto/opinto/:kotoOpintoId',
        name: 'koto_opinto',
        component: RouteKotoOpinto,
        props,
      }, {
        path: 'koto/laajaalainenosaaminen/:kotoLaajaalainenOsaaminenId',
        name: 'koto_laajaalainenosaaminen',
        component: RouteKotoLaajaalainenOsaaminen,
        props,
      }, {
        path: 'osaamiskokonaisuus/:osaamiskokonaisuusId',
        name: 'osaamiskokonaisuus',
        component: RouteOsaamiskokonaisuus,
        props,
      }, {
        path: 'osaamiskokonaisuuspaaalue/:osaamiskokonaisuusPaaAlueId',
        name: 'osaamiskokonaisuus_paa_alue',
        component: RouteOsaamiskokonaisuusPaaAlue,
        props,
      }, {
        path: 'aipe/laajaalaisetosaamiset',
        name: 'aipeLaajaAlaisetOsaamiset',
        component: RouteAipeLaajaAlaisetOsaamiset,
        props,
      }, {
        path: 'aipe/laajaalainenosaaminen/:laoId?',
        name: 'aipelaajaAlainenOsaaminen',
        component: RouteAipeLaajaAlainenOsaaminen,
        props,
      }, {
        path: 'aipe/vaihe/:vaiheId?',
        name: 'aipevaihe',
        component: RouteAipeVaihe,
        props,
      }, {
        path: 'aipe/vaihe/:vaiheId/oppiaine/:oppiaineId?',
        name: 'aipeoppiaine',
        component: RouteAipeOppiaine,
        props,
      }, {
        path: 'aipe/vaihe/:vaiheId/oppiaine/:parentId',
        name: 'aipeoppimaara',
        component: RouteAipeOppiaine,
        props,
      }, {
        path: 'aipe/vaihe/:vaiheId/oppiaine/:oppiaineId/kurssi/:kurssiId?',
        name: 'aipekurssi',
        component: RouteAipeKurssi,
        props,
      }, {
        path: 'tpo/taiteenala/:taiteenalaId?/:uusi?',
        name: 'taiteenala',
        component: RouteTaiteenala,
        props,
      }, {
        path: 'lukio/laajaalaisetosaamiset',
        name: 'lukio_laajaAlaisetOsaamiset',
        component: RouteLaajaAlaisetOsaamiset,
        props,
      }, {
        path: 'lukio/oppiaineet',
        name: 'lukio_oppiaineet',
        component: RouteOppiaineet,
        props,
      }, {
        path: 'lukio/oppiaine/:oppiaineId?',
        name: 'lukio_oppiaine',
        component: RouteOppiaine,
        props,
      }, {
        path: 'lukio/oppiaine/:oppiaineId/moduuli/:moduuliId?',
        name: 'moduuli',
        component: RouteModuuli,
        props,
      }, {
        path: 'perusopetus/laajaalaisetosaamiset',
        name: 'perusopetusLaajaAlaisetOsaamiset',
        component: RoutePerusopetusLaajaAlaisetOsaamiset,
        props,
      }, {
        path: 'perusopetus/laajaalainenosaaminen/:laoId?',
        name: 'perusopetusLaajaAlainenOsaaminen',
        component: RoutePerusopetusLaajaAlainenOsaaminen,
        props,
      }, {
        path: 'perusopetus/vuosiluokkakokonaisuudet',
        name: 'perusopetusVuosiluokkakokonaisuudet',
        component: RouteVuosiluokkakokonaisuudet,
        props,
      }, {
        path: 'perusopetus/vuosiluokkakokonaisuus/:vlkId?',
        name: 'perusopetusVuosiluokkakokonaisuus',
        component: RouteVuosiluokkakokonaisuus,
        props,
      }, {
        path: 'perusopetus/oppiaineet',
        name: 'perusopetusOppiaineet',
        component: RoutePerusopetusOppiaineet,
        props,
      }, {
        path: 'perusopetus/oppiaine/:oppiaineId/:uusi?',
        name: 'perusopetusoppiaine',
        component: RoutePerusopetusOppiaine,
        props,
      },
      ],
    }, {
      path: 'opas/:projektiId',
      component: RoutePerusteprojekti,
      name: 'opas',
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
          route: 'poistetutsisallot',
          icon: 'roskalaatikko',
          text: 'poistetut',
        }, {
          separator: true,
        }, {
          icon: ['far', 'folder'],
          text: 'arkistoi-opas',
          click: vaihdaPerusteTilaConfirm,
          meta: {
            oikeus: () => stores.perusteStore.isJulkaistu.value ? { oikeus: 'hallinta', kohde: 'pohja' } : { oikeus: 'muokkaus' },
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
    }, {
      path: '*',
      redirect: (to) => {
        console.log('Unknown route', to);
        return {
          name: 'virhe',
          query: {
            virhekoodi: '404',
          },
        };
      },
    }],
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
      if (err.response.status === 404) {
        router.push({ name: 'virhe' });
      }
      throw new Error(err);
    }
  }
});

export default router;
