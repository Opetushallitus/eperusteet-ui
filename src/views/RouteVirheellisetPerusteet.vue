<template>
  <EpMainView>
    <template slot="icon">
      <EpIcon class="float-right" icon="tyoryhma" background-color="#82D4FF" />
    </template>

    <template slot="header">
      <b-container>
        <h1>{{ $t('virheita-sisaltavat-julkiset-perusteet') }}</h1>
      </b-container>
    </template>

    <b-container>
      <div v-if="validations">
        <div v-for="(validation, idx) in validations.data" :key="idx">
          <ep-virhelistaus :validation="validation" />
        </div>
        <b-pagination
          v-model="sivu"
          align="center"
          per-page="sivukoko"
          />
      </div>
      <ep-spinner v-else />
    </b-container>


  </EpMainView>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { VirheellisetPerusteetStore } from '@/stores/VirheellisetPerusteetStore';
import EpVirhelistaus from '@/components/EpVirhelistaus/EpVirhelistaus.vue';

@Component({
  components: {
    EpIcon,
    EpMainView,
    EpSpinner,
    EpVirhelistaus,
  },
})
export default class RouteVirheellisetPerusteet extends Vue {
  @Prop({ required: true })
  virheellisetPerusteetStore!: VirheellisetPerusteetStore;

  mounted() {
    this.virheellisetPerusteetStore.updateFilters(0, 10);
  }

  get validations() {
    return this.virheellisetPerusteetStore.validations.value;
  }

  get sivukoko() {
    return this.virheellisetPerusteetStore.sivukoko.value;
  }

  get sivu() {
    return this.virheellisetPerusteetStore.sivu.value + 1;
  }

  set sivu(value: number) {
    if (value !== null && this.sivu !== value - 1) {
      this.virheellisetPerusteetStore.updateFilters(value - 1, 10);
    }
  }
}
</script>

<style lang="scss">
</style>
