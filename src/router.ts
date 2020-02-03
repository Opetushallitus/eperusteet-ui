import Vue from 'vue';
import Router from 'vue-router';
import { RouteConfig } from 'vue-router';
import _ from 'lodash';

import Root from '@/routes/Root.vue';
import Home from '@/routes/home/RouteHome.vue';
import VirheRoute from '@/routes/virhe/VirheRoute.vue';
import RouteTiedotteet from '@/routes/tiedotteet/RouteTiedotteet.vue';

import { Virheet } from '@shared/stores/virheet';
import { EditointiKontrolli } from '@/stores/editointi';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { Kieli, SovellusVirhe } from '@shared/tyypit';
import { changeLang, resolveRouterMetaProps } from '@shared/utils/router';

import { createLogger } from '@shared/utils/logger';
import { tutoriaalistore } from '@shared/stores/tutoriaali';
import { TiedotteetStore } from '@/stores/tiedotteet';
import { VueTutorial } from './directives/tutoriaali';
import VueApexCharts from 'vue-apexcharts';

Vue.use(Router);
Vue.use(VueTutorial, {tutoriaalistore});
Vue.use(VueApexCharts);

Vue.component('apexchart', VueApexCharts);

const tiedotteetStore = new TiedotteetStore();

const logger = createLogger('Router');

export const router = new Router({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes: [{
    path: '/',
    redirect: () => '/fi',
  }, {
    path: '/:lang',
    component: Root,
    meta: {
      resolve: {
        async props(route) {
          return {
            default: {
              tutoriaalistore,
            },
          };
        },
      },
    },
    children: [{
      path: '',
      name: 'root',
      component: Home,
      props: {
        tiedotteetStore,
        tutoriaalistore,
      },
    }, {
      path: 'virhe',
      name: 'virhe',
      component: VirheRoute,
    }, {
      path: 'tiedotteet',
      name: 'tiedotteet',
      component: RouteTiedotteet,
      props: {
        tiedotteetStore,
        tutoriaalistore,
      },
    }],
  }, {
    path: '*',
    redirect: (to) => {
      logger.error('Unknown route', to);
      return {
        name: 'virhe',
        params: {
          lang: 'fi',
          ...to.params,
        },
        query: {
          viesti: 'virhe-route',
          virhe: to.path,
        },
      };
    },
  }],
});

Virheet.onError((virhe: SovellusVirhe) => {
  console.error(virhe);
  router.push({
    name: 'virhe',
    query: {
      virhe: JSON.stringify(virhe),
    },
  });
});

// Estetään ikkunan sulkeminen suoraan muokkaustilassa
window.addEventListener('beforeunload', e => {
  if (EditointiKontrolli.anyEditing()) {
    e.preventDefault();
    // Vanhemmat selainversiot vaativat erillisen varmistustekstin
    e.returnValue = Kielet.kaannaOlioTaiTeksti('poistumisen-varmistusteksti');
  }
});

// Estetään tilan vaihtaminen muokkaustilassa
router.beforeEach(async (to, from, next) => {
  if (EditointiKontrolli.anyEditing()) {
    const value = await router.app.$bvModal.msgBoxConfirm(
      Kielet.kaannaOlioTaiTeksti('poistumisen-varmistusteksti-dialogi'),
      {
        title: Kielet.kaannaOlioTaiTeksti('haluatko-poistua-tallentamatta'),
        okTitle: Kielet.kaannaOlioTaiTeksti('poistu-tallentamatta'),
        cancelTitle: Kielet.kaannaOlioTaiTeksti('peruuta'),
        size: 'lg',
      });

    if (value) {
      try {
        await EditointiKontrolli.cancelAll();
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

router.beforeEach((to, from, next) => {
  changeLang(to, from);
  next();
});

router.beforeEach(async (to, from, next) => {
  await resolveRouterMetaProps(to);
  next();
});
