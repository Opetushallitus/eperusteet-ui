<template>
  <EpHomeTile
    icon="article"
    :route="{ name: 'pohjat' }"
  >
    <template #header>
      <span>{{ $t('pohjat') }}</span>
    </template>
    <template #content>
      <p>{{ $t('tile-pohjat-kuvaus') }}</p>
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
</script>
