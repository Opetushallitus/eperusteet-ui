<template>
  <EpMainView>
    <template #icon>
      <EpIcon class="float-right" icon="groups" background-color="#82D4FF" />
    </template>

    <b-container>
      <h1 class="mb-4">{{ $t('arviointi') }}</h1>

      <b-nav tabs>
        <b-nav-item to="geneerinen">
          {{ $t('geneerinen-arviointi') }}
        </b-nav-item>
        <b-nav-item to="arviointiasteikot">
          {{ $t('arviointiasteikot') }}
        </b-nav-item>
      </b-nav>
      <router-view />
    </b-container>
  </EpMainView>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  arviointiStore: ArviointiStore;
}>();

onMounted(() => {
  props.arviointiStore.fetchArviointiasteikot();
  props.arviointiStore.fetchGeneeriset();
});

const arviointiasteikot = computed(() => {
  return props.arviointiStore.arviointiasteikot.value;
});

const geneeriset = computed(() => {
  return props.arviointiStore.geneeriset.value;
});
</script>

<style lang="scss">
</style>
