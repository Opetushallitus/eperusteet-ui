import Vue, { createApp } from 'vue';

import App from './App.vue';
import '@shared/config/bootstrap';
import '@shared/config/styles';
import { createI18n } from 'vue-i18n';
import VueScrollTo from 'vue-scrollto';
import { LoadingPlugin } from 'vue-loading-overlay';
import VueApexCharts from 'vue-apexcharts';
import { Oikeustarkastelu } from '@shared/plugins/oikeustarkastelu';
import Aikaleima from '@shared/plugins/aikaleima';
import { Notifikaatiot } from '@shared/plugins/notifikaatiot';
import { Kielet } from '@shared/stores/kieli';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Kayttajat } from '@/stores/kayttaja';
import { TutkinnonOsaEditStore } from '@/stores/TutkinnonOsaEditStore';
import { TekstiRakenneStore } from '@/stores/TekstiRakenneStore';
import { MuodostuminenStore } from '@/stores/MuodostuminenStore';
import { OpintokokonaisuusStore } from './stores/OpintokokonaisuusStore';
import { KoulutuksenOsaStore } from './stores/KoulutuksenOsaStore';
import { OsaalueStore } from '@/stores/OsaalueStore';
import { KotoKielitaitotasoStore } from '@/stores/Koto/KotoKielitaitotasoStore';
import { KotoOpintoStore } from '@/stores/Koto/KotoOpintoStore';
import router from './router';
import { stores } from '@/stores';
import { TavoitesisaltoalueStore } from './stores/TavoitesisaltoalueStore';
import { LaajaalainenOsaaminenStore } from './stores/LaajaalainenOsaaminenStore';
import { KotoLaajaalainenOsaaminenStore } from '@/stores/Koto/KotoLaajaalainenOsaaminenStore';
import { OsaamiskokonaisuusStore } from './stores/OsaamiskokonaisuusStore';
import { OsaamiskokonaisuusPaaAlueStore } from './stores/OsaamiskokonaisuusPaaAlueStore';
import { MaarayksetEditStore } from './stores/MaarayksetEditStore';
import { AipeKurssiStore } from './stores/AipeKurssiStore';
import { AipeLaajaAlainenOsaaminenStore } from './stores/AipeLaajaAlainenOsaaminenStore';
import { AipeOppiaineStore } from './stores/AipeOppiaineStore';
import { AipeVaiheStore } from './stores/AipeVaiheStore';
import { LukioModuuliStore } from './stores/LukioModuuliStore';
import { PerusopetusLaajaAlainenOsaaminenStore } from './stores/PerusopetusLaajaAlainenOsaaminenStore';
import { PerusopetusOppiaineStore } from './stores/PerusopetusOppiaineStore';
import { configureCompat } from '@vue/compat';
import { Kieli } from '@shared/tyypit';
import fiLocale from '@shared/translations/locale-fi.json';
import svLocale from '@shared/translations/locale-sv.json';
import enLocale from '@shared/translations/locale-en.json';
import { TekstikappaleStore } from './stores/TekstikappaleStore';
import { setAppInstance } from '@shared/utils/globals';
import { createPinia } from 'pinia';
import Kaannos from '@shared/plugins/kaannos';
import { createHead } from '@unhead/vue/client';
import Sticky from 'vue-sticky-directive';
import { TaiteenalaStore } from './stores/TaiteenalaStore';
import { LukioOppiaineStore } from './stores/LukioOppiaineStore';
import { registerIconColorSchemeChange } from '@shared/utils/icon';

const app = createApp(App);

registerIconColorSchemeChange();

configureCompat({
  COMPONENT_V_MODEL: false,
});

setAppInstance(app);

app.use(createPinia());
app.use(router);
app.use(Kaannos);

export const i18n = createI18n({
  legacy: false, // Set to false to use Composition API
  locale: Kieli.fi,
  fallbackLocale: Kieli.fi,
  messages: {
    fi: {
      ...fiLocale,
    },
    sv: {
      ...svLocale,
    },
    en: {
      ...enLocale,
    },
  },
});

app.use(i18n);
app.use(Kielet, { i18n });
app.use(Aikaleima);
app.use(LoadingPlugin);
app.use(createHead());
app.use(Oikeustarkastelu, { oikeusProvider: Kayttajat });
app.use(Notifikaatiot);

// Vue.use(Vahvistus);
Vue.use(VueScrollTo, {
  duration: 1000,
});
Vue.use(VueApexCharts);
Vue.component('Apexchart', VueApexCharts);

app.use(EditointiStore, { router, kayttajaProvider: Kayttajat });
app.use(TekstikappaleStore, {
  perusteStore: stores.perusteStore,
  router,
});
app.use(Sticky);

app.use(TekstiRakenneStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(TutkinnonOsaEditStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(MuodostuminenStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(OpintokokonaisuusStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(TavoitesisaltoalueStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(KoulutuksenOsaStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(LaajaalainenOsaaminenStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(KotoKielitaitotasoStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(KotoOpintoStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(KotoLaajaalainenOsaaminenStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(OsaamiskokonaisuusStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(OsaamiskokonaisuusPaaAlueStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(OsaalueStore, {
  perusteStore: stores.perusteStore,
});

app.use(MaarayksetEditStore, {
  router,
});

app.use(AipeKurssiStore, {
  router,
});

app.use(AipeLaajaAlainenOsaaminenStore, {
  router,
});

app.use(AipeOppiaineStore, {
  router,
});

app.use(AipeVaiheStore, {
  router,
});

app.use(LukioModuuliStore, {
  router,
});

app.use(PerusopetusLaajaAlainenOsaaminenStore, {
  router,
});

app.use(PerusopetusOppiaineStore, {
  router,
});

app.use(TaiteenalaStore, {
  perusteStore: stores.perusteStore,
  router,
});

app.use(LukioOppiaineStore, {
  router,
});

app.mount('#app');
