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
import { Component, Vue } from 'vue-property-decorator'
import EpNavbar from '@shared/components/EpNavbar/EpNavbar.vue'

@Component({
  components: {
    EpNavbar
  }
})
export default class RouteRoot extends Vue {
}
</script>

<style lang="scss" scoped>
.home-container {
  .header {
    background-image: url('../../public/img/banners/header.svg');
  }
}
</style>
