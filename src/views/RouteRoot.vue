<template>
  <div class="home-container minfull">
    <EpTestiymparisto />

    <div class="header" ref="header">
      <EpNavbar :kayttaja="kayttaja" :sovellusOikeudet="sovellusOikeudet"/>
      <PortalTarget ref="innerPortal" name="headerExtension" />
    </div>
    <RouterView />
    <ep-footer />
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import Sticky from 'vue-sticky-directive';
import EpNavbar from '@shared/components/EpNavbar/EpNavbar.vue';
import { Kayttajat, KayttajaStore } from '@/stores/kayttaja';

import EpFooter from '@shared/components/EpFooter/EpFooter.vue';

import { BrowserStore } from '@shared/stores/BrowserStore';

import { PerusteStore } from '@/stores/PerusteStore';
import { Meta } from '@shared/utils/decorators';
import EpTestiymparisto from '@shared/components/EpTestiymparisto/EpTestiymparisto.vue';

@Component({
  components: {
    EpNavbar,
    EpFooter,
    EpTestiymparisto,
  },
  directives: {
    Sticky,
  },
})
export default class RouteRoot extends Vue {
  @Prop({ required: true })
  private browserStore!: BrowserStore;

  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  @Prop({ required: true })
  private perusteStore!: PerusteStore;

  private isSticky = false;
  private height = null as number | null;

  get kayttaja() {
    return this.kayttajaStore?.tiedot?.value || null;
  }

  @Meta
  getMetaInfo() {
    const lang = _.get(this.$route, 'params.lang');
    const hasRouteName = this.$route && this.$route.name;
    return {
      title: hasRouteName ? this.$t('route-' + this.$route.name) : this.$t('eperusteet'),
      titleTemplate: hasRouteName ? '%s - ' + this.$t('eperusteet') : null,
      htmlAttrs: {
        lang: lang || 'fi',
      },
      meta: [
        {
          vmid: 'description',
          name: 'description',
          content: this.$t('tervetuloa-kuvaus'),
        },
        {
          vmid: 'keywords',
          name: 'keywords',
          content: this.$t('avainsanalista'),
        },
        {
          vmid: 'author',
          name: 'author',
          content: this.$t('opetushallitus'),
        },
        {
          vmid: 'og:site_name',
          property: 'og:site_name',
          content: this.$t('eperusteet'),
        },
        {
          vmid: 'og:description',
          property: 'og:description',
          content: this.$t('tervetuloa-kuvaus'),
        },
        {
          vmid: 'og:locale',
          property: 'og:locale',
          content: lang + '_FI',
        },
      ],
    };
  }

  get portalStyle() {
    if (this.height === null) {
      return {};
    }
    else if (this.isSticky) {
      return {
        'max-height': 0 + 'px',
      };
    }
    else {
      return {
        'max-height': this.height + 'px',
      };
    }
  }

  get scrollY() {
    return this.browserStore.scrollY.value;
  }

  @Watch('scrollY', { immediate: true })
  onScroll(newVal, oldVal) {
    const threshold = 0.5;
    if ((newVal < threshold && oldVal < threshold)
      || (newVal >= threshold && oldVal >= threshold)) {

    }
    else {
      this.isSticky = newVal >= threshold;
      if (this.$refs.innerPortal) {
        setTimeout(() => {
          this.height = (this.$refs.innerPortal as any).$el.clientHeight;
        }, 100);
      }
    }
  }

  get sovellusOikeudet() {
    return this.kayttajaStore?.sovellusOikeudet.value;
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.home-container {
  .header {
    color: white;
    background-image: url('../../public/img/banners/header.svg');
    background-position: 100% 0;
    background-repeat: none;
    background-size: cover;
    @media only screen and (min-width: 2503px)  {
    }
    /* background-size: 100%; */
  }
}

// .animate {
//   transition: max-height 0.2s ease-in-out;
// }

</style>
