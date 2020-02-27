<template>
  <div>
    <div class="asteikko mt-4" v-for="(asteikko, idx) in arviointiasteikot" :key="idx">
      <span class="text-nowrap">
        <span v-for="(taso, idx) in asteikko.osaamistasot" :key="'taso-' + taso.id">
          <span v-if="idx !== 0" class="text-muted">/</span>
          {{ $kaanna(taso.otsikko) }}
        </span>
      </span>
    </div>
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
.asteikko {
  padding: 18px;
  border-radius: 10px;
  border: 1px solid #eee;
  box-shadow: 3px 3px 10px #eee;
}
</style>
