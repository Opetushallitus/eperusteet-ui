<template>
  <div class="home-container minfull">
    <div class="header" ref="header">
      <EpNavbar />
        <!-- :class="{ 'animate-in': !isSticky, 'animate-out': isSticky }"> -->
      <PortalTarget ref="innerPortal" name="headerExtension" />
    </div>
    <RouterView />
  </div>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import EpNavbar from '@shared/components/EpNavbar/EpNavbar.vue';
import { Kayttajat } from '@/stores/kayttaja';
import { BrowserStore } from '@shared/stores/BrowserStore';
import Sticky from 'vue-sticky-directive';

@Component({
  components: {
    EpNavbar,
  },
  directives: {
    Sticky,
  },
})
export default class RouteRoot extends Vue {
  @Prop({ required: true })
  private browserStore!: BrowserStore;

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

  async mounted() {
    await Kayttajat.init();
  }
}
</script>

<style lang="scss" scoped>
.home-container {
  .header {
    background-image: url('../../public/img/banners/header.svg');
    color: white;
    background-position: 100% 0;
    background-repeat: no-repeat;
  }
}

// .animate {
//   transition: max-height 0.2s ease-in-out;
// }

</style>
