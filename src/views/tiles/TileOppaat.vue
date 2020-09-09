<template>
<EpHomeTile icon="kasitteet" :route="{ name: 'oppaat' }">
  <template slot="header">
    <span>{{ $t('oppaat') }}</span>
  </template>
  <template slot="content">
    <ep-spinner v-if="!oppaat"></ep-spinner>
    <div v-else>
      <p v-if="oppaat.length === 0">{{ $t('ei-oppaita') }}</p>

      <div v-else class="text-left ml-5">
        <div v-for="(opas, index) in viimeisimmatOppaat" :key="'opas'+index">
          {{opas.nimi}}
        </div>
        <ep-button variant="link" v-if="kokonaismaara > viimeisimmatOppaat.length" buttonClass="pl-0 btn-sm" class="no-padding">
          {{kokonaismaara - viimeisimmatOppaat.length}} {{$t('muuta-opasta')}}
        </ep-button>
      </div>
    </div>
  </template>
</EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { PerusteetStore } from '@/stores/PerusteetStore';
import * as _ from 'lodash';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
    EpButton,
  },
})
export default class TileOppaat extends Vue {
  @Prop({ required: true })
  private perusteOppaatStore!: PerusteetStore;

  private isLoading = false;

  async mounted() {
    await this.perusteOppaatStore.updateQuery({});
  }

  get oppaat() {
    return this.perusteOppaatStore.projects.value?.data || null;
  }

  get kokonaismaara() {
    return this.perusteOppaatStore.projects.value?.kokonaismäärä || null;
  }

  get viimeisimmatOppaat() {
    return _.take(this.oppaat, 3);
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
