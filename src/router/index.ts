import Vue from 'vue'
import VueRouter from 'vue-router'

import RouteArviointiasteikot from '@/views/RouteArviointiasteikot.vue'
import RouteHome from '@/views/RouteHome.vue'
import RouteMuodostuminen from '@/views/RouteMuodostuminen.vue'
import RouteOppaat from '@/views/RouteOppaat.vue'
import RouteOppaatLuonti from '@/views/RouteOppaatLuonti.vue'
import RoutePerusteprojekti from '@/views/RoutePerusteprojekti.vue'
import RoutePerusteprojektiLuonti from '@/views/RoutePerusteprojektiLuonti.vue'
import RoutePerusteprojektit from '@/views/RoutePerusteprojektit.vue'
import RoutePohjat from '@/views/RoutePohjat.vue'
import RoutePohjatLuonti from '@/views/RoutePohjatLuonti.vue'
import RouteRoot from '@/views/RouteRoot.vue'
import RouteTekstikappale from '@/views/RouteTekstikappale.vue'
import RouteTermisto from '@/views/RouteTermisto.vue'
import RouteTiedot from '@/views/RouteTiedot.vue'
import RouteTiedotteet from '@/views/RouteTiedotteet.vue'
import RouteTutkinnonOsa from '@/views/RouteTutkinnonOsa.vue'
import RouteTutkinnonOsanOsaAlue from '@/views/RouteTutkinnonOsanOsaAlue.vue'
import RouteTutkinnonOsat from '@/views/RouteTutkinnonOsat.vue'
import RouteVirhe from '@/views/RouteVirhe.vue'
import RouteVirheellisetPerusteet from '@/views/RouteVirheellisetPerusteet.vue'
import RouteYleisnakyma from '@/views/RouteYleisnakyma.vue'

import { Kayttajat } from '@/stores/kayttaja'
import { PerusteStore } from '@/stores/PerusteStore'
import { arviointiStore } from '@/stores/ArviointiStore'
import { tiedotteetStore } from '@/stores/tiedotteet'
import { tutoriaaliStore } from '@shared/stores/tutoriaali'
import { virheellisetPerusteetStore } from '@/stores/VirheellisetPerusteetStore'


function constructStores() {
  return {
    arviointiStore,
    oppaatStore: new PerusteStore({ tyyppi: 'OPAS' } as any),
    perusteetStore: new PerusteStore({ tyyppi: 'NORMAALI' } as any),
    pohjatStore: new PerusteStore({ tyyppi: 'POHJA' } as any),
    tiedotteetStore,
    tutoriaaliStore,
    virheellisetPerusteetStore,
  }
}

const stores = constructStores();


Vue.use(VueRouter)

const router = new VueRouter({
  routes: [{
    path: '',
    redirect: () => '/fi'
  }, {
    path: '/',
    redirect: () => '/fi'
  }, {
    path: '/:lang',
    component: RouteRoot,
    children: [{
      path: '',
      name: 'root',
      component: RouteHome,
      props: { ...stores }
    }, {
      path: '',
      name: 'home',
      component: RouteHome,
      props: { ...stores }
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
      path: 'virhe',
      name: 'virhe',
      component: RouteVirhe,
    }, {
      path: 'tiedotteet',
      name: 'tiedotteet',
      component: RouteTiedotteet,
      props: { ...stores }
    }, {
      path: 'arviointiasteikot',
      name: 'arviointiasteikot',
      component: RouteArviointiasteikot,
      props: { ...stores },
    }, {
      path: 'virheelliset',
      name: 'virheellisetperusteet',
      component: RouteVirheellisetPerusteet,
      props: { ...stores },
    }, {
      path: 'perusteprojektit/uusi',
      name: 'perusteprojektiLuonti',
      component: RoutePerusteprojektiLuonti
    }, {
      path: 'pohjat/uusi',
      name: 'pohjaLuonti',
      component: RoutePohjatLuonti
    }, {
      path: 'oppaat/uusi',
      name: 'opasLuonti',
      component: RouteOppaatLuonti
    }, {
      path: 'perusteprojekti/:projektiId',
      component: RoutePerusteprojekti,
      children: [{
        path: '',
        name: 'perusteprojekti',
        component: RouteYleisnakyma
      }, {
        path: 'rakenne',
        name: 'muodostuminen',
        component: RouteMuodostuminen
      }, {
        path: 'tutkinnonosat',
        name: 'tutkinnonosat',
        component: RouteTutkinnonOsat
      }, {
        path: 'tekstikappale:tekstiKappaleId',
        name: 'tekstikappale',
        component: RouteTekstikappale
      }, {
        path: 'termisto',
        name: 'termisto',
        component: RouteTermisto
      }, {
        path: 'tiedot',
        name: 'tiedot',
        component: RouteTiedot
      }, {
        path: 'tutkinnonosa/:tutkinnonOsaId',
        name: 'tutkinnonosa',
        component: RouteTutkinnonOsa
      }, {
        path: 'tutkinnonosa/:tutkinnonOsaId/osaalue/:osaAlueId',
        name: 'tutkinnonosaOsaAlue',
        component: RouteTutkinnonOsanOsaAlue
      }]
    }]
  }]
})

export default router
