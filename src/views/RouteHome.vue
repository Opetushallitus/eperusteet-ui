<template>
  <div>
    <Portal to="headerExtension">
      <div class="container">
        <div class="container-fluid">
          <div class="row no-gutters">
            <div class="col my-4 px-3 px-md-0">
              <h1>{{ $t('tervetuloa', { nimi }) }}</h1>
              <p>{{ $t('tervetuloa-kuvaus') }}</p>
            </div>
          </div>
        </div>
        <!--
        <div class="row">
          <div class="col-md-4 mt-2 mb-5">
            <EpSearch v-model="rajain" />
          </div>
        </div>
        -->
      </div>
    </Portal>
    <div class="container tile-container">
      <div class="d-flex flex-row flex-wrap justify-content-center">
        <TilePerusteprojektit />
        <TilePohjat v-oikeustarkastelu="{oikeus:'hallinta'}"/>
        <TileTiedotteet :tiedotteetStore="tiedotteetStore" />
        <TileOppaat :perusteOppaatStore="perusteOppaatStore"/>
        <TileArviointiasteikot v-oikeustarkastelu="{oikeus:'hallinta'}"/>
        <TileVirheellisetPerusteet :virheellisetPerusteetStore="virheellisetPerusteetStore" v-oikeustarkastelu="{oikeus:'hallinta'}"/>
        <TilePalautteet v-oikeustarkastelu="{oikeus:'hallinta'}"/>
        <TileTilastot v-oikeustarkastelu="{oikeus:'hallinta'}"/>
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
import TileTilastot from './tiles/TileTilastot.vue';
import TilePalautteet from './tiles/TilePalautteet.vue';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { KayttajaStore } from '@/stores/kayttaja';
import { Meta } from '@shared/utils/decorators';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { VirheellisetPerusteetStore } from '@/stores/VirheellisetPerusteetStore';

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
    TileTilastot,
    TilePalautteet,
  },
})
export default class Home extends Vue {
  @Prop({ required: true })
  private tiedotteetStore!: TiedotteetStore;

  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  @Prop({ required: true })
  private perusteOppaatStore!: PerusteetStore;

  @Prop({ required: true })
  private virheellisetPerusteetStore!: VirheellisetPerusteetStore;

  private rajain = '';

  @Meta
  getMetaInfo() {
    return {
      title: this.$t('eperusteet'),
      titleTemplate: null,
    };
  }

  get nimi() {
    return this.kayttajaStore?.nimi?.value || null;
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.home-container {
  background-color: $etusivu-background;
  overflow: auto;
  min-height: 100vh;

  .header {
    color: white;
    background-color: $etusivu-header-background;
    background-image: url('../../public/img/banners/header.svg');
    background-position: 100% 0;
    background-repeat: no-repeat;
    @media only screen and (min-width: 2503px)  {
      background-size: 100%;
    }

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
