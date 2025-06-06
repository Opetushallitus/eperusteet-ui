<template>
<EpHomeTile icon="archive" :route="{ name: 'arkistoidut' }">
  <template #header>
    <span>{{ $t('arkistoidut') }}</span>
  </template>
  <template #content>
    <p>{{ $t('tile-arkistoidut-kuvaus') }}</p>
  </template>
</EpHomeTile>
</template>

<script setup lang="ts">
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
</script>
