<template>
<EpHomeTile icon="kasitteet" :route="{ name: 'oppaat' }">
  <template slot="header">
    <span>{{ $t('oppaat') }}</span>
  </template>
  <template slot="content">
    <ep-spinner v-if="isLoading"></ep-spinner>
    <div v-else>
      <p>{{ $t('tile-oppaat-kuvaus') }}</p>
    </div>
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
export default class TileOppaat extends Vue {
  private isLoading = false;

  async mounted() {
    this.isLoading = false;
  }
}
</script>

<style scoped lang="scss">
.tiedotteet {
  text-align: left;
  display: grid;

  .tiedote {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;

    small {
      color: #071A58;
    }
  }

}

</style>
