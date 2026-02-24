<template>
  <EpMainView>
    <template #icon>
      <EpIcon
        class="float-right"
        icon="groups"
        background-color="#82D4FF"
      />
    </template>

    <div class="arviointi-container">
      <h1 class="mb-4">
        {{ $t('arviointi') }}
      </h1>

      <nav class="arviointi-nav">
        <router-link
          to="geneerinen"
          class="arviointi-nav-link"
          active-class="arviointi-nav-link-active"
          exact-active-class="arviointi-nav-link-active"
        >
          {{ $t('geneerinen-arviointi') }}
        </router-link>
        <router-link
          to="arviointiasteikot"
          class="arviointi-nav-link"
          active-class="arviointi-nav-link-active"
          exact-active-class="arviointi-nav-link-active"
        >
          {{ $t('arviointiasteikot') }}
        </router-link>
      </nav>
      <router-view />
    </div>
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

<style lang="scss" scoped>
@import '@shared/styles/_variables.scss';

.arviointi-container {
  max-width: 1240px;
  margin-inline: auto;
  padding-inline: 1rem;
}

.arviointi-nav {
  display: flex;
  border-bottom: 1px solid $grey200;
  margin-bottom: 1rem;
}

.arviointi-nav-link {
  padding: 0.5rem 1rem;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
  color: $grey600;

  &:hover {
    color: $grey900;
  }
}

.arviointi-nav-link-active {
  border-color: $paletti-blue;
  color: $paletti-blue;
  font-weight: 500;
}
</style>
