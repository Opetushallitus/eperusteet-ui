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

<script setup lang="ts">
import { ref, computed, watch, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import * as _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { PerusopetusLaajaAlainenOsaaminenStore } from '@/stores/PerusopetusLaajaAlainenOsaaminenStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { $kaanna, $t } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
  laoId?: any;
}>();

const router = useRouter();
const store = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

// Watch for changes in laoId
watch(() => props.laoId, async () => {
  const laoStore = new PerusopetusLaajaAlainenOsaaminenStore(
    perusteId.value!,
    props.laoId,
    props.perusteStore,
  );
  store.value = new EditointiStore(laoStore);
}, { immediate: true });
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
