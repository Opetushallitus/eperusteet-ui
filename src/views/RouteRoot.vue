<template>
  <div
    class="home-container minfull"
    sticky-container
  >
    <EpTestiymparisto />

    <div class="view-container">
      <div
        ref="header"
        class="header"
      >
        <EpNavbar
          :kayttaja="kayttaja"
          :sovellus-oikeudet="sovellusOikeudet"
          :logout-href="logoutHref"
          :sticky="routeStickyNavi"
        />
        <div id="headerExtension" />
      </div>
      <RouterView />
    </div>
    <ep-footer>
      <template #palaute>
        <EpPalauteLinkki yllapito-avain="perusteiden-laadinta-palaute-url" />
      </template>
    </ep-footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, provide } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import _ from 'lodash';
import EpNavbar from '@shared/components/EpNavbar/EpNavbar.vue';
import { KayttajaStore } from '@/stores/kayttaja';
import EpFooter from '@shared/components/EpFooter/EpFooter.vue';
import EpPalauteLinkki from '@shared/components/EpPalauteLinkki/EpPalauteLinkki.vue';
import { BrowserStore } from '@shared/stores/BrowserStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpTestiymparisto from '@shared/components/EpTestiymparisto/EpTestiymparisto.vue';
import { baseURL } from '@shared/api/eperusteet';
import { $t } from '@shared/utils/globals';


const props = defineProps<{
  browserStore: BrowserStore;
  kayttajaStore: KayttajaStore;
  perusteStore: PerusteStore;
}>();

const isSticky = ref(false);
const height = ref<number | null>(null);
const header = ref<HTMLElement | null>(null);
const innerPortal = ref<HTMLElement | null>(null);
const route = useRoute();

const kayttaja = computed(() => {
  return props.kayttajaStore?.tiedot?.value || null;
});

const routeStickyNavi = computed(() => {
  return route.name !== 'root';
});

const routeName = computed(() => {
  return route.name;
});

const meta = computed(() => {
  const lang = _.get(route, 'params.lang');
  return {
    title: $t('eperusteet-laadinta'),
    htmlAttrs: {
      lang: lang || 'fi',
    },
    meta: [
      {
        vmid: 'description',
        name: 'description',
        content: $t('tervetuloa-kuvaus'),
      },
      {
        vmid: 'keywords',
        name: 'keywords',
        content: $t('avainsanalista'),
      },
      {
        vmid: 'author',
        name: 'author',
        content: $t('opetushallitus'),
      },
      {
        vmid: 'og:site_name',
        property: 'og:site_name',
        content: $t('eperusteet'),
      },
      {
        vmid: 'og:description',
        property: 'og:description',
        content: $t('tervetuloa-kuvaus'),
      },
      {
        vmid: 'og:locale',
        property: 'og:locale',
        content: lang + '_FI',
      },
    ],
  };
});

useHead(meta);

const portalStyle = computed(() => {
  if (height.value === null) {
    return {};
  }
  else if (isSticky.value) {
    return {
      'max-height': 0 + 'px',
    };
  }
  else {
    return {
      'max-height': height.value + 'px',
    };
  }
});

const scrollY = computed(() => {
  return props.browserStore.scrollY.value;
});

watch(scrollY, (newVal, oldVal) => {
  const threshold = 0.5;
  if ((newVal < threshold && oldVal < threshold)
    || (newVal >= threshold && oldVal >= threshold)) {
    // No action needed
  }
  else {
    isSticky.value = newVal >= threshold;
    if (innerPortal.value) {
      setTimeout(() => {
        height.value = innerPortal.value?.clientHeight || null;
      }, 100);
    }
  }
}, { immediate: true });

const sovellusOikeudet = computed(() => {
  return props.kayttajaStore?.sovellusOikeudet.value;
});

const logoutHref = computed(() => {
  return baseURL + '/api/logout';
});

const dullInject = computed(() => {
  return {};
});

provide('dull', dullInject);
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .header {
    color: white;
    background-image: url('@assets/img/banners/header.svg');
    background-position: 100% 0;
    background-repeat: none;
    background-size: cover;
    @media only screen and (min-width: 2503px)  {
    }
  }
}

.view-container {
  flex:1;
}
</style>
