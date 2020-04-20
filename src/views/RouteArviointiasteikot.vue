<template>
  <div class="mt-5">
    <h2>{{ $t('arviointiasteikot') }}</h2>
    <div class="asteikko mt-4" v-for="(asteikko, idx) in arviointiasteikot" :key="idx">
      <span class="text-nowrap">
        <h3>{{$t('arviointiasteikko') + ' ' + (idx+1)}}</h3>
        <ep-julki-lista :tiedot="asteikko.osaamistasot" :tietoMaara="10"/>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpJulkiLista from '@shared/components/EpJulkiLista/EpJulkiLista.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';

@Component({
  components: {
    EpMainView,
    EpIcon,
    EpJulkiLista,
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
