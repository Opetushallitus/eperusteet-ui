import '@shared/config/styles'
import '@shared/config/bootstrap'
import '@shared/config/fontawesome'
import 'animate.css/animate.min.css'

import VueI18n from 'vue-i18n'
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
import VueScrollTo from 'vue-scrollto'
import Loading from 'vue-loading-overlay'
import Notifications from 'vue-notification'
import PortalVue from 'portal-vue'

Vue.use(VueI18n)
Vue.use(VueCompositionApi)
Vue.use(VueScrollTo)
Vue.use(Notifications)
Vue.use(PortalVue)

Vue.use(Loading, {
  fullPage: true,
  color: '#159ecb',
  loader: 'dots'
})
