<template>
  <EpHomeTile icon="smart_toy"
              :route="{ name: 'opsai' }">
    <template slot="header">
      <span>{{ $t('tile-opsai') }}</span>
    </template>
    <template slot="content">
      <p>{{ $t('tile-opsai-kuvaus') }}</p>
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
export default class TileOpsAi extends Vue {

}
</script>
