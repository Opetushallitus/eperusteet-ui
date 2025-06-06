<template>
  <EpHomeTile icon="article" :route="{ name: 'perusteprojektit' }">
    <template #header>
      <span>{{ $t('perusteprojektit') }}</span>
    </template>
    <template #content>
      <p>{{ $t('tile-perusteprojektit-kuvaus') }}</p>
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
</script>
