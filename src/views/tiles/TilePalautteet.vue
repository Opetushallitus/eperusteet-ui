<template>
  <EpHomeTile
    icon="feedback"
    :route="{ name: 'palautteet' }">
    <template slot="header">
      <span>{{ $t('tile-palautteet') }}</span>
    </template>
    <template slot="content">
      <p>{{ $t('tile-palautteet-kuvaus') }}</p>
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
export default class TilePalautteet extends Vue {}
</script>
