<template>
<EpHomeTile icon="bar_chart" :route="{ name: 'geneerinen' }">
  <template #header>
    <span>{{ $t('arviointi') }}</span>
  </template>
  <template #content>
    <p>{{ $t('tile-arviointiasteikot-kuvaus') }}</p>
  </template>
</EpHomeTile>
</template>

<script setup lang="ts">
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
</script>
