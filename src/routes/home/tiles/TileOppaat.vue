<template>
<base-tile icon="kasitteet" :route="{ name: 'oppaat' }">
  <template slot="header">
    <span>{{ $t('oppaat') }}</span>
  </template>
  <template slot="content">
    <ep-spinner v-if="isLoading"></ep-spinner>
    <div v-else>
      <p>{{ $t('tile-oppaat-kuvaus') }}</p>
    </div>
  </template>
</base-tile>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import { delay } from '@shared/utils/delay';

import BaseTile from './BaseTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';


@Component({
  components: {
    BaseTile,
    EpSpinner,
  },
})
export default class TileOppaat extends Vue {
  private isLoading = true;

  async mounted() {
    await delay(3500);
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
