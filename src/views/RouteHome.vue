<template>
  <div>
    <Portal to="headerExtension">
      <div class="container mt-5">
        <div class="container-fluid">
          <div class="row">
            <!-- <h1>{{ $t('tervetuloa', { nimi }) }}</h1> -->
            <p>{{ $t('tervetuloa-kuvaus') }}</p>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4 mt-2 mb-5">
            <EpSearch v-model="rajain" />
          </div>
        </div>
      </div>
    </Portal>
    <div class="container tile-container">
      <div class="d-flex flex-row flex-wrap justify-content-center">
        <TilePerusteprojektit />
        <TilePohjat />
        <TileTiedotteet :tiedotteetStore="tiedotteetStore" />
        <TileOppaat />
        <TileArviointiasteikot />
        <TileVirheellisetPerusteet />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import TileArkistoidut from './tiles/TileArkistoidut.vue';
import TileKoulutuskoodiOngelmat from './tiles/TileKoulutuskoodiOngelmat.vue';
import TileOppaat from './tiles/TileOppaat.vue';
import TilePerusteprojektit from './tiles/TilePerusteprojektit.vue';
import TilePohjat from './tiles/TilePohjat.vue';
import TileTiedotteet from './tiles/TileTiedotteet.vue';
import TileVirheellisetPerusteet from './tiles/TileVirheellisetPerusteet.vue';
import TileArviointiasteikot from './tiles/TileArviointiasteikot.vue';
import { TiedotteetStore } from '@/stores/tiedotteet';

@Component({
  components: {
    EpSearch,
    TileArkistoidut,
    TileKoulutuskoodiOngelmat,
    TileOppaat,
    TilePerusteprojektit,
    TilePohjat,
    TileTiedotteet,
    TileVirheellisetPerusteet,
    TileArviointiasteikot,
  },
})
export default class Home extends Vue {
  @Prop({ required: true })
  private tiedotteetStore!: TiedotteetStore;

  private rajain = '';
}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.home-container {
  background-color: $etusivu-background;
  overflow: auto;
  min-height: 100vh;

  .header {
    background-color: $etusivu-header-background;
    background-image: url('../../public/img/banners/header.svg');
    background-position: 100% 0;
    background-repeat: no-repeat;
    color: white;

    h1 {
      font-weight: 300;
    }
  }

  .tile-container {
    padding: 0;
    margin-top: 50px;
  }
}
</style>
