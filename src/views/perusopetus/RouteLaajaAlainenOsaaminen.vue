<template>
  <EpEditointi :store="store">
    <template #header="{ data }">
      <h2 v-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else class="font-italic" >{{ $t('nimeton') }}</h2>
    </template>

    <template #default="{ data, isEditing }">
      <div class="mt-1" v-if="isEditing">
        <h3>{{$t('laaja-alaisen-osaamisen-nimi')}} *</h3>
        <ep-input v-model="data.nimi" :is-editing="true"></ep-input>
      </div>
      <div :class="{ 'mt-4': isEditing }">
        <h3 v-if="isEditing">{{$t('kuvaus')}}</h3>
        <ep-content v-model="data.kuvaus"
                  layout="normal"
                  :is-editable="isEditing"/>
      </div>
    </template>
  </EpEditointi>

</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { PerusopetusLaajaAlainenOsaaminenStore } from '@/stores/PerusopetusLaajaAlainenOsaaminenStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';

@Component({
  components: {
    EpEditointi,
    EpInput,
    EpContent,
  },
})
export default class RouteLaajaAlainenOsaaminen extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: false })
  laoId: any;

  store: EditointiStore | null = null;

  @Watch('laoId', { immediate: true })
  async laoChange() {
    const store = new PerusopetusLaajaAlainenOsaaminenStore(this.perusteId!, this.laoId, this.perusteStore, this);
    this.store = new EditointiStore(store);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
