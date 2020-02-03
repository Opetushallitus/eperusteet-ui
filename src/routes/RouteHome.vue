<template>
<div class="home-container">
  <div class="header">
    <ep-navigation :sticky="false" :tutoriaalistore="tutoriaalistore"></ep-navigation>
    <div class="container">
      <div class="container-fluid">
        <div class="row">
          <h1>{{ $t('tervetuloa', { nimi }) }}</h1>
          <p>{{ $t('tervetuloa-kuvaus') }}</p>
        </div>
      </div>

    </div>
  </div>
  <div class="container tile-container">
    <div class="d-flex flex-row flex-wrap justify-content-center">

    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Home extends Vue {
  private rajain: string = '';
}
</script>

<style scoped lang="scss">
//@import '@/styles/_variables.scss';

.home-container {
 // background-color: $etusivu-background;
  overflow: auto;

  .header {
    h1 {
      font-weight: 300;
    }
    //background-color: $etusivu-header-background;
    //background-image: url('../../../public/img/banners/header.svg');
    background-position: 100% 0;
    background-repeat: no-repeat;

    color: white;
  }

  .tile-container {
    padding: 0;//
    margin-top: 30px;
    margin-bottom: 30px;
  }
}
</style>
