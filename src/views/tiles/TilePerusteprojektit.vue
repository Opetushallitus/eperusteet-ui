<template>
<EpHomeTile icon="article" :route="{ name: 'perusteprojektit' }">
  <template #header>
    <span>{{ $t('perusteprojektit') }}</span>
  </template>
  <template #content>
    <p>{{ $t('tile-perusteprojektit-kuvaus') }}</p>
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
export default class TilePerusteprojektit extends Vue {
}
</script>
