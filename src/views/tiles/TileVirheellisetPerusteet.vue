<template>
<EpHomeTile icon="hallitus" :route="{ name: 'virheellisetperusteet' }">
  <template slot="header">
    <span>{{ $t('virheelliset-perusteet') }}</span>
  </template>
  <template slot="content">
    <ep-spinner v-if="isLoading"></ep-spinner>
    <div v-else>
      <p>{{ $t('tile-virheelliset-kuvaus') }}</p>
    </div>
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
export default class TileVirheellisetPerusteet extends Vue {
  private isLoading = false;

  async mounted () {
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
