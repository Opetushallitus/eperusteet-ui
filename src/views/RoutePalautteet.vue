<template>
  <EpMainView>
    <h2 aria-level="1" class="mb-4">{{ $t('palautteet-otsikko') }}</h2>

    <b-tabs>
      <b-tab v-for="palautekanava in palautekanavat" :key="palautekanava" :title="$t(palautekanava)" class="p-3">
        <ep-palautteet :palautteet="palautteet[palautekanava]" :palauteProvider="palautteetStore" />
      </b-tab>

    </b-tabs>

  </EpMainView>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { PalautteetStore } from '@/stores/PalautteetStore';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpPalautteet from '@/components/EpPalautteet/EpPalautteet.vue';
import { EperusteetPalautekanava } from '@shared/tyypit';

@Component({
  components: {
    EpMainView,
    EpSpinner,
    EpPalautteet,
  },
})
export default class RoutePalautteet extends Vue {
  @Prop({ required: true })
  palautteetStore!: PalautteetStore;

  async mounted() {
    await this.palautteetStore.fetch();
  }

  get palautteet() {
    return this.palautteetStore.palautteet.value;
  }

  get palautekanavat() {
    return Object.values(EperusteetPalautekanava);
  }
}
</script>

<style scoped lang="scss">
  @import '@shared/styles/_variables.scss';

</style>
