<template>
<EpHomeTile icon="play_lesson" :route="{ name: 'digitaalisetosaamiset' }">
  <template #header>
    <span>{{ $t('digitaalinen-osaaminen') }}</span>
  </template>
  <template #content>
    <p>{{ $t('tile-digitaalinen-osaaminen-kuvaus') }}</p>
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
export default class TileDigitaalinenOsaaminen extends Vue {
}
</script>
