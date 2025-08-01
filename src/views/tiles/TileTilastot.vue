<template>
  <EpHomeTile
    icon="show_chart"
    :route="{ name: 'tilastot' }"
  >
    <template #header>
      <span>{{ $t('tile-tilastot') }}</span>
    </template>
    <template #content>
      <p>{{ $t('eperusteet-tilastot') }}</p>
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
</script>
