<template>
<EpHomeTile icon="luo-pdf" :route="{ name: 'pohjat' }">
  <template slot="header">
    <span>{{ $t('pohjat') }}</span>
  </template>
  <template slot="content">
    <p>{{ $t('tile-pohjat-kuvaus') }}</p>
  </template>
</EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue'
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue'

@Component({
  components: {
    EpHomeTile,
    EpSpinner
  }
})
export default class TileOppaat extends Vue {
}
</script>
