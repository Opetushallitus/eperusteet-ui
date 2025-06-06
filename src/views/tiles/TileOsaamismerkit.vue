<template>
  <EpHomeTile icon="emoji_events"
              :route="{ name: 'osaamismerkit' }">
    <template #header>
      <span>{{ $t('tile-osaamismerkit') }}</span>
    </template>
    <template #content>
      <p>{{ $t('tile-osaamismerkit-kuvaus') }}</p>
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
</script>

<style scoped>

</style>
