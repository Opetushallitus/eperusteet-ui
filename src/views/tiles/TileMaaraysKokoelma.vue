<template>
  <EpHomeTile
    icon="picture_as_pdf"
    :route="{ name: 'maarayskokoelma' }"
  >
    <template #header>
      <span>{{ $t('tile-maarayskokoelma') }}</span>
    </template>
    <template #content>
      <p>{{ $t('tile-maarayskokoelma-kuvaus') }}</p>
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
</script>
