<template>
<div class="home-container">
  <div class="header">
    <ep-navigation :sticky="true" :tutoriaalistore="tutoriaalistore"></ep-navigation>
    <div class="container mt-5">
      <div class="container-fluid">
        <div class="row">
          <h1>{{ $t('tervetuloa', { nimi }) }}</h1>
          <p>{{ $t('tervetuloa-kuvaus') }}</p>
        </div>
      </div>
      <div class="row">
         <div class="col-md-4 mt-2 mb-5">
           <ep-search v-model="rajain"></ep-search>
         </div>
      </div>
    </div>
  </div>
  <div class="container tile-container">
    <div class="d-flex flex-row flex-wrap justify-content-center">
      <tile-perusteprojektit />
      <tile-pohjat />
      <tile-tiedotteet />
      <tile-virheelliset-perusteet />
      <tile-arviointiasteikot />
      <tile-koulutuskoodi-ongelmat />
      <tile-oppaat />
      <tile-arkistoidut />
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { Kayttajat } from '@/stores/kayttaja';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';

import EpRoute from '@/mixins/EpRoute';

import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

import TilePerusteprojektit from './tiles/TilePerusteprojektit.vue';
import TilePohjat from './tiles/TilePohjat.vue';
import TileTiedotteet from './tiles/TileTiedotteet.vue';
import TileVirheellisetPerusteet from '@/routes/home/tiles/TileVirheellisetPerusteet.vue';
import TileArviointiasteikot from '@/routes/home/tiles/TileArviointiasteikot.vue';
import TileKoulutuskoodiOngelmat from '@/routes/home/tiles/TileKoulutuskoodiOngelmat.vue';
import TileOppaat from '@/routes/home/tiles/TileOppaat.vue';
import TileArkistoidut from '@/routes/home/tiles/TileArkistoidut.vue';


@Component({
  components: {
    TileVirheellisetPerusteet,
    EpContent,
    EpNavigation,
    EpSearch,
    EpSpinner,
    TilePerusteprojektit,
    TilePohjat,
    TileTiedotteet,
    TileArviointiasteikot,
    TileKoulutuskoodiOngelmat,
    TileOppaat,
    TileArkistoidut,
  },
  directives: {
    oikeustarkastelu,
  },
})
export default class Home extends Mixins(EpRoute) {

  @Prop()
  private tutoriaalistore!: TutoriaaliStore;

  private rajain: string = '';

  async init() {
    // Todo: hae etusivu
  }

  get nimi() {
    return Kayttajat.nimi;
  }

  get kayttaja() {
    return Kayttajat.tiedot;
  }

}
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.home-container {
  background-color: $etusivu-background;
  overflow: auto;

  .header {
    h1 {
      font-weight: 300;
    }
    background-color: $etusivu-header-background;
    background-image: url('../../../public/img/banners/header.svg');
    background-position: 100% 0;
    background-repeat: no-repeat;

    color: white;
  }

  .tile-container {
    padding: 0;
    margin-top: 50px;
  }
}
</style>
