<template>
  <div class="home-container">
    <div class="header">
      <EpNavbar :sticky="true" />
      <PortalTarget name="headerExtension" />
    </div>
    <RouterView />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import EpNavbar from '@shared/components/EpNavbar/EpNavbar.vue';
import { Kayttajat } from '@/stores/kayttaja';

@Component({
  components: {
    EpNavbar
  }
})
export default class RouteRoot extends Vue {
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
</style>
