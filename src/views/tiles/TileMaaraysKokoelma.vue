<template>
  <EpHomeTile icon="picture_as_pdf"
              :route="{ name: 'maarayskokoelma' }">
    <template slot="header">
      <span>{{ $t('tile-maarayskokoelma') }}</span>
    </template>
    <template slot="content">
      <p>{{ $t('tile-maarayskokoelma-kuvaus') }}</p>
    </template>
  </EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';

@Component({
  components: {
    EpHomeTile,
  },
})
export default class TileMaaraysKokoelma extends Vue {

}
</script>
