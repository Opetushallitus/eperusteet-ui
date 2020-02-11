import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './dependencies';

import Aikaleima from '@shared/plugins/aikaleima';
import Kaannos from '@shared/plugins/kaannos';
import {Kielet} from '@shared/stores/kieli';

Vue.use(Aikaleima);
Vue.use(Kaannos);
Vue.use(Kielet, {
  messages: {
    fi: require('@/translations/locale-fi.json'),
    sv: require('@/translations/locale-sv.json'),
  },
});

Vue.config.productionTip = false


async function main() {
  new Vue({
    router,
    i18n: Kielet.i18n,
    render: h => h(App)
  }).$mount('#app')
}

main();
