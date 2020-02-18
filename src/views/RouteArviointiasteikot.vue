<template>
  <EpMainView>
    <template slot="icon">
      <EpIcon class="float-right" icon="tyoryhma" background-color="#82D4FF" />
    </template>

    <template slot="header">
      <h1>{{ $t('arviointiasteikot') }}</h1>
    </template>

    <pre>
    {{ arviointiasteikot }}
    </pre>
    <pre>
    {{ geneeriset }}
    </pre>
  </EpMainView>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator'
import EpMainView from '@shared/components/EpMainView/EpMainView.vue'
import EpIcon from '@shared/components/EpIcon/EpIcon.vue'
import { ArviointiStore } from '@/stores/ArviointiStore'


@Component({
  components: {
    EpMainView,
    EpIcon,
  }
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
