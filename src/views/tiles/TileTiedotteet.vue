<template>
<EpHomeTile icon="muistikirja" :route="{ name: 'tiedotteet' }">
  <template slot="header">
    <span>{{ $t('tiedotteet') }}</span>
  </template>
  <template slot="content">
    <div v-if="tiedotteet">
      <div v-for="(tiedote, index) in viimeisimmatTiedotteet" :key="index" class="row justify-content-center text-left">
        <div class="col-3">{{$sd(tiedote.muokattu)}}</div>
        <div class="col-7 otsikko">{{$kaanna(tiedote.otsikko)}}</div>
      </div>
    </div>
    <div v-else-if="tiedotteet === []">
      <p>{{ $t('ei-tiedotteita') }}</p>
    </div>
    <ep-spinner v-else />
  </template>
</EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import _ from 'lodash';
import { perustetila } from '@shared/utils/perusteet';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
  },
})
export default class TileTiedotteet extends Vue {
  @Prop({ required: true })
  private tiedotteetStore!: TiedotteetStore;

  mounted() {
    this.tiedotteetStore.fetch();
  }

  get isLoading() {
    return !!this.tiedotteet;
  }

  get tiedotteet() {
    if (this.tiedotteetStore.tiedotteet.value) {
      return _.chain(this.tiedotteetStore.tiedotteet.value)
        .filter(tiedote => _.isEmpty(tiedote.perusteet) || !_.some(tiedote.perusteet, (peruste) => (peruste.tila as any) !== perustetila.valmis))
        .value();
    }
  }

  get viimeisimmatTiedotteet() {
    return _.take(this.tiedotteet, 3);
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
