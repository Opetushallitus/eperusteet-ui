<template>
  <EpHomeTile icon="settings"
              :route="{ name: 'yllapito' }">
    <template #header>
      <span>{{ $t('tile-yllapito') }}</span>
    </template>
    <template #content>
      <p>{{ $t('eperusteet-yllapito') }}</p>
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
</script>
