import Vue from 'vue'
import VueRouter from 'vue-router'

import RouteArviointiasteikot from '@/views/RouteArviointiasteikot.vue';
import RouteHome from '@/views/RouteHome.vue'
import RouteMuodostuminen from '@/views/RouteMuodostuminen.vue';
import RouteOppaat from '@/views/RouteOppaat.vue';
import RouteOppaatLuonti from '@/views/RouteOppaatLuonti.vue';
import RoutePerusteprojekti from '@/views/RoutePerusteprojekti.vue';
import RoutePerusteprojektiLuonti from '@/views/RoutePerusteprojektiLuonti.vue';
import RoutePerusteprojektit from '@/views/RoutePerusteprojektit.vue';
import RoutePohjat from '@/views/RoutePohjat.vue';
import RoutePohjatLuonti from '@/views/RoutePohjatLuonti.vue';
import RouteRoot from '@/views/RouteRoot.vue';
import RouteTekstikappale from '@/views/RouteTekstikappale.vue';
import RouteTermisto from '@/views/RouteTermisto.vue';
import RouteTiedot from '@/views/RouteTiedot.vue';
import RouteTiedotteet from '@/views/RouteTiedotteet.vue';
import RouteTutkinnonOsa from '@/views/RouteTutkinnonOsa.vue';
import RouteTutkinnonOsanOsaAlue from '@/views/RouteTutkinnonOsanOsaAlue.vue';
import RouteTutkinnonOsat from '@/views/RouteTutkinnonOsat.vue';
import RouteVirhe from '@/views/RouteVirhe.vue';
import RouteVirheellisetPerusteet from '@/views/RouteVirheellisetPerusteet.vue';
import RouteYleisnakyma from '@/views/RouteYleisnakyma.vue';

Vue.use(VueRouter)


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
    children: [{
      path: '',
      name: 'home',
      component: RouteHome,
    }, {
      path: 'oppaat',
      name: 'oppaat',
      component: RouteOppaat,
    }, {
      path: 'perusteprojektit',
      name: 'perusteprojektit',
      component: RoutePerusteprojektit,
    }, {
      path: 'pohjat',
      name: 'pohjat',
      component: RoutePohjat,
    }, {
      path: 'virhe',
      name: 'virhe',
      component: RouteVirhe,
    }, {
      path: 'tiedotteet',
      name: 'tiedotteet',
      component: RouteTiedotteet,
    }, {
      path: 'arviointiasteikot',
      name: 'arviointiasteikot',
      component: RouteArviointiasteikot,
    }, {
      path: 'virheelliset',
      name: 'virheellisetperusteet',
      component: RouteVirheellisetPerusteet,
    }, {
      path: 'perusteprojektit/uusi',
      name: 'perusteprojektiLuonti',
      component: RoutePerusteprojektiLuonti,
    }, {
      path: 'pohjat/uusi',
      name: 'pohjaLuonti',
      component: RoutePohjatLuonti,
    }, {
      path: 'oppaat/uusi',
      name: 'opasLuonti',
      component: RouteOppaatLuonti,
    }, {
      path: 'perusteprojekti/:projektiId',
      component: RoutePerusteprojekti,
      children: [{
        path: '',
        name: 'perusteprojekti',
        component: RouteYleisnakyma,
      }, {
        path: 'rakenne',
        name: 'muodostuminen',
        component: RouteMuodostuminen,
      }, {
        path: 'tutkinnonosat',
        name: 'tutkinnonosat',
        component: RouteTutkinnonOsat,
      }, {
        path: 'tekstikappale:tekstiKappaleId',
        name: 'tekstikappale',
        component: RouteTekstikappale,
      }, {
        path: 'termisto',
        name: 'termisto',
        component: RouteTermisto,
      }, {
        path: 'tiedot',
        name: 'tiedot',
        component: RouteTiedot,
      }, {
        path: 'tutkinnonosa/:tutkinnonOsaId',
        name: 'tutkinnonosa',
        component: RouteTutkinnonOsa,
      }, {
        path: 'tutkinnonosa/:tutkinnonOsaId/osaalue/:osaAlueId',
        name: 'tutkinnonosaOsaAlue',
        component: RouteTutkinnonOsanOsaAlue,
      }],
    }]
  }],
})

export default router
