<template>
<base-tile icon="muistikirja" :route="{ name: 'tiedotteet' }">
  <template slot="header">
    <span>{{ $t('tiedotteet') }}</span>
  </template>
  <template slot="content">
    <ep-spinner v-if="isLoading"></ep-spinner>
    <div v-if="tiedotteetStore.state.tiedotteet">
      <div v-for="(tiedote, index) in viimeisimmatTiedotteet" :key="index" class="row justify-content-center text-left">
        <div class="col-3">{{$sd(tiedote.muokattu)}}</div>
        <div class="col-7 otsikko">{{$kaanna(tiedote.otsikko)}}</div>
      </div>
    </div>
    <div v-else>
      <p>{{ $t('ei-tiedotteita') }}</p>
    </div>
  </template>
</base-tile>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { delay } from '@shared/utils/delay'

import BaseTile from './BaseTile.vue'
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue'
import { TiedotteetStore } from '@/stores/tiedotteet'
import _ from 'lodash'

@Component({
  components: {
    BaseTile,
    EpSpinner
  }
})
export default class TileTiedotteet extends Vue {
  @Prop({ required: true })
  private tiedotteetStore!: TiedotteetStore;

  private isLoading = true;

  async mounted () {
    await this.tiedotteetStore.fetch()
    this.isLoading = false
  }

  get viimeisimmatTiedotteet () {
    return _.take(this.tiedotteetStore.tiedotteet.value, 3)
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

.otsikko {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

</style>
