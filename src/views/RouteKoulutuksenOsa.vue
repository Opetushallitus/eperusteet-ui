<template>
  <EpEditointi v-if="store" :store="store">
    <template #header="{ data }">
      <h2 class="m-0">{{ $kaanna(data.nimi) || $t('nimeton-koulutuksen-osa') }}</h2>
    </template>
     <template v-slot:default="{ data, isEditing, validation }">
     </template>
  </EpEditointi>
  <EpSpinner v-else class="my-3"/>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { PerusteStore } from '@/stores/PerusteStore';
import { KoulutuksenOsaStore } from '@/stores/KoulutuksenOsaStore';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';

@Component({
  components: {
    EpSpinner,
    EpEditointi,
  }
})
export default class RouteKoulutuksenOsa extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  koulutuksenosaId!: number;

  private store: EditointiStore | null = null;

  @Watch('koulutuksenosaId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    await this.perusteStore.blockUntilInitialized();
    const tkstore = new KoulutuksenOsaStore(this.perusteId!, Number(id));
    this.store = new EditointiStore(tkstore);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

}
</script>

<style scoped lang="scss">

</style>
