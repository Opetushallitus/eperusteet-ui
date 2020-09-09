<template>
<EpHomeTile icon="virheelliset-perusteet" :route="{ name: 'virheellisetperusteet' }">
  <template slot="header">
    <span>{{ $t('virheelliset-perusteet') }}</span>
  </template>
  <template slot="content">
    <ep-spinner v-if="!validations"></ep-spinner>
    <div v-else>
      <p v-if="validations.length === 0">{{ $t('ei-virheellisia-perusteita') }}</p>

      <div v-else class="text-left ml-5">
        <div v-for="(validation, index) in validations" :key="'opas'+index" class="row ">
          <div class="col-2 font-size-08 mr-0 pr-0">{{validation.infot.length}} {{$t('virhetta')}}</div>
          <div class="col-10 ml-0">{{validation.perusteprojekti.nimi}}</div>
        </div>

        <div class="row" v-if="kokonaismaara > validations.length">
          <div class="col-2" />
          <div class="col-10">
            <ep-button variant="link" buttonClass="pl-0 btn-sm" class="no-padding">
              {{kokonaismaara - validations.length}} {{$t('muuta-perusteprojektia')}}
            </ep-button>
          </div>
        </div>
      </div>
    </div>

  </template>
</EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { VirheellisetPerusteetStore } from '@/stores/VirheellisetPerusteetStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
    EpButton,
  },
})
export default class TileVirheellisetPerusteet extends Vue {
  @Prop({ required: true })
  private virheellisetPerusteetStore!: VirheellisetPerusteetStore;

  mounted() {
    this.virheellisetPerusteetStore.updateFilters(0, 2);
  }

  get validations() {
    return this.virheellisetPerusteetStore.validations.value?.data || null;
  }

  get kokonaismaara() {
    return this.virheellisetPerusteetStore.kokonaismaara.value;
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
