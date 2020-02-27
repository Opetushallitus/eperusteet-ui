<template>
<EpHomeTile icon="arkistoi" :route="{ name: 'arkistoidut' }">
  <template slot="header">
    <span>{{ $t('arkistoidut') }}</span>
  </template>
  <template slot="content">
    <p>{{ $t('tile-arkistoidut-kuvaus') }}</p>
  </template>
</EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
  },
})
export default class TileArkistoidut extends Vue {
}
</script>
