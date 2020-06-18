<template>
  <div class="home-container minfull">
    <div class="header" ref="header">
      <EpNavbar :kayttaja="kayttaja" />
      <PortalTarget ref="innerPortal" name="headerExtension" />
    </div>
    <RouterView />
    <ep-footer />
  </div>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import EpNavbar from '@shared/components/EpNavbar/EpNavbar.vue';
import { Kayttajat, KayttajaStore } from '@/stores/kayttaja';
import { BrowserStore } from '@shared/stores/BrowserStore';

import Sticky from 'vue-sticky-directive';
import { PerusteStore } from '@/stores/PerusteStore';
import EpFooter from '@shared/components/EpFooter/EpFooter.vue';

@Component({
  components: {
    EpNavbar,
    EpFooter,
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

  get kayttaja() {
    return this.kayttajaStore?.tiedot?.value || null;
  }

  private isSticky = false;
  private height = null as number | null;

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
