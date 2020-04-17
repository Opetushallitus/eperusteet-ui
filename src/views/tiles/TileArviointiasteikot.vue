<template>
<EpHomeTile icon="pylvas-asteikko" :route="{ name: 'geneerinen' }">
  <template slot="header">
    <span>{{ $t('arviointi') }}</span>
  </template>
  <template slot="content">
    <p>{{ $t('tile-arviointiasteikot-kuvaus') }}</p>
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
export default class TileArviointiasteikot extends Vue {
}
</script>
