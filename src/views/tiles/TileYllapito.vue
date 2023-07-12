<template>
  <EpHomeTile icon="ratas"
              :route="{ name: 'yllapito' }">
    <template slot="header">
      <span>{{ $t('tile-yllapito') }}</span>
    </template>
    <template slot="content">
      <p>{{ $t('eperusteet-yllapito') }}</p>
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
export default class TileYllapito extends Vue {

}
</script>
