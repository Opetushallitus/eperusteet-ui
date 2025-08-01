<template>
  <EpHomeTile
    icon="play_lesson"
    :route="{ name: 'digitaalisetosaamiset' }"
  >
    <template #header>
      <span>{{ $t('digitaalinen-osaaminen') }}</span>
    </template>
    <template #content>
      <p>{{ $t('tile-digitaalinen-osaaminen-kuvaus') }}</p>
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
</script>
