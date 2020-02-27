<template>
  <div>
    asteikot
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';

@Component({
  components: {
    EpMainView,
    EpIcon,
  },
})
export default class RouteArviointiasteikot extends Vue {
  @Prop({ required: true })
  arviointiStore!: ArviointiStore;

  mounted() {
    this.arviointiStore.fetchArviointiasteikot();
    this.arviointiStore.fetchGeneeriset();
  }

  get arviointiasteikot() {
    return this.arviointiStore.arviointiasteikot.value;
  }

  get geneeriset() {
    return this.arviointiStore.geneeriset.value;
  }
}
</script>

<style lang="scss">
</style>
