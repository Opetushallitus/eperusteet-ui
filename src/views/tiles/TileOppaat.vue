<template>
<EpHomeTile icon="menu_book" :route="{ name: 'oppaat' }">
  <template slot="header">
    <span>{{ $t('oppaat') }}</span>
  </template>
  <template slot="content">
    <template v-if="$hasOphCrud()">
      <ep-spinner v-if="!oppaat"></ep-spinner>
      <div v-else>
        <p v-if="oppaat.length === 0">{{ $t('ei-oppaita') }}</p>

        <div v-else class="text-left ml-5">
          <div v-for="(opas, index) in viimeisimmatOppaat" :key="'opas'+index">
            {{$kaanna(opas.nimi)}}
          </div>
          <ep-button variant="link" v-if="kokonaismaara > viimeisimmatOppaat.length" buttonClass="pl-0 btn-sm" class="no-padding">
            {{kokonaismaara - oppaat.length}} {{$t('muuta-opasta')}}
          </ep-button>
        </div>
      </div>
    </template>
    <div v-else>
      {{$t('tile-oppaat-kuvaus')}}
    </div>
  </template>
</EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import * as _ from 'lodash';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PerusteetStore } from '@/stores/PerusteetStore';

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

  async mounted() {
    if (this.$hasOphCrud()) {
      await this.perusteOppaatStore.updateQuery({});
    }
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
