import Vue from 'vue'
import App from './App.vue'
import '@shared/config/bootstrap'
import '@shared/config/styles'
import '@shared/config/fontawesome'
import 'animate.css/animate.min.css'

import VueI18n from 'vue-i18n'
import VueCompositionApi from '@vue/composition-api'
import VueScrollTo from 'vue-scrollto'
import Loading from 'vue-loading-overlay'
import Notifications from 'vue-notification'
import PortalVue from 'portal-vue'

import Aikaleima from '@shared/plugins/aikaleima'
import Kaannos from '@shared/plugins/kaannos'
import { Notifikaatiot } from '@shared/plugins/notifikaatiot'
import { Kielet } from '@shared/stores/kieli'

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
Vue.use(Kielet, {
  messages: {
    fi: require('@/translations/locale-fi.json'),
    sv: require('@/translations/locale-sv.json')
  }
})
Vue.use(Kaannos)
Vue.use(Aikaleima)
Vue.use(Notifikaatiot)

import router from './router'

Vue.config.productionTip = false

async function main () {
  new Vue({
    router,
    i18n: Kielet.i18n,
    render: h => h(App)
  }).$mount('#app')
}

main()
