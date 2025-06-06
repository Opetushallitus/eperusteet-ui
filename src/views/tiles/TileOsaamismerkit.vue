<template>
  <EpHomeTile icon="emoji_events"
              :route="{ name: 'osaamismerkit' }">
    <template #header>
      <span>{{ $t('tile-osaamismerkit') }}</span>
    </template>
    <template #content>
      <p>{{ $t('tile-osaamismerkit-kuvaus') }}</p>
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
export default class TileOsaamismerkit extends Vue {
}
</script>

<style scoped>

</style>
