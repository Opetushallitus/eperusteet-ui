<template>
<EpHomeTile icon="muistikirja" :route="{ name: 'tiedotteet' }">
  <template slot="header">
    <span>{{ $t('tiedotteet') }}</span>
  </template>
  <template slot="content">
    <EpSpinner v-if="isLoading" />
    <div v-else>
      <p>{{ $t('tile-tiedotteet-kuvaus') }}</p>
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
export default class TileTiedotteet extends Vue {
  private isLoading = false;

  async mounted() {
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
