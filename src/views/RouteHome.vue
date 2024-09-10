<template>
  <div>
    <Portal to="headerExtension">
      <div class="container">
        <div class="container-fluid">
          <div class="row no-gutters">
            <div class="col my-4 px-3 px-md-0">
              <h1>{{ $t('eperusteet-tervetuloa', { nimi }) }}</h1>
              <p>{{ $t('eperusteet-tervetuloa-kuvaus') }}</p>
            </div>
          </div>
        </div>
      </div>
    </Portal>
    <div class="container tile-container">
      <div class="d-flex flex-row flex-wrap justify-content-center">
        <TilePerusteprojektit v-oikeustarkastelu="{oikeus:'luku', kohde: 'eperusteet'}"/>
        <TilePohjat v-oikeustarkastelu="{oikeus:'hallinta'}"/>
        <TileTiedotteet :tiedotteetStore="tiedotteetStore" v-oikeustarkastelu="{oikeus:'luku', kohde: 'eperusteet'}"/>
        <TileOppaat :perusteOppaatStore="perusteOppaatStore" v-oikeustarkastelu="{oikeus:'luku', kohde: 'eperusteet'}"/>
        <TileMaaraysKokoelma v-oikeustarkastelu="{oikeus:'luku', kohde: 'eperusteet_maarays'}"/>
        <TileMuutMaaraykset :muutMaarayksetStore="muutMaarayksetStore" v-oikeustarkastelu="{oikeus:'luku', kohde: 'eperusteet'}"/>
        <TileDigitaalinenOsaaminen v-if="$hasOphCrud()" :digitaalisetOsaamisetStore="digitaalisetOsaamisetStore"/>
        <TileOsaamismerkit v-if="$hasOphCrud()" />
        <TileArviointiasteikot v-oikeustarkastelu="{oikeus:'hallinta'}"/>
        <TilePalautteet v-if="$isAdmin()"/>
        <TileTilastot v-oikeustarkastelu="{oikeus:'hallinta'}"/>
        <TileYllapito v-if="$isAdmin()"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import TileArkistoidut from './tiles/TileArkistoidut.vue';
import TileOppaat from './tiles/TileOppaat.vue';
import TilePerusteprojektit from './tiles/TilePerusteprojektit.vue';
import TilePohjat from './tiles/TilePohjat.vue';
import TileDigitaalinenOsaaminen from './tiles/TileDigitaalinenOsaaminen.vue';
import TileTiedotteet from './tiles/TileTiedotteet.vue';
import TileArviointiasteikot from './tiles/TileArviointiasteikot.vue';
import TileTilastot from './tiles/TileTilastot.vue';
import TilePalautteet from './tiles/TilePalautteet.vue';
import TileMuutMaaraykset from './tiles/TileMuutMaaraykset.vue';
import TileMaaraysKokoelma from './tiles/TileMaaraysKokoelma.vue';
import TileYllapito from './tiles/TileYllapito.vue';
import TileOsaamismerkit from './tiles/TileOsaamismerkit.vue';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { KayttajaStore } from '@/stores/kayttaja';
import { Meta } from '@shared/utils/decorators';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { PalautteetStore } from '@/stores/PalautteetStore';
import { MuutMaarayksetStore } from '@/stores/MuutMaarayksetStore';

@Component({
  components: {
    EpSearch,
    TileYllapito,
    TileArkistoidut,
    TileOppaat,
    TilePerusteprojektit,
    TilePohjat,
    TileTiedotteet,
    TileArviointiasteikot,
    TileTilastot,
    TilePalautteet,
    TileDigitaalinenOsaaminen,
    TileOsaamismerkit,
    TileMuutMaaraykset,
    TileMaaraysKokoelma,
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
  private palautteetStore!: PalautteetStore;

  @Prop({ required: true })
  private muutMaarayksetStore!: MuutMaarayksetStore;

  @Prop({ required: true })
  private digitaalisetOsaamisetStore!: PerusteetStore;

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
    background-image: url('~@assets/img/banners/header.svg');
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
