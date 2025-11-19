<template>
  <EpHomeTile
    icon="article"
    :route="{ name: 'kielikaantajatutkinnot' }"
  >
    <template #header>
      <span>{{ $t('kieli-kaantaja-tutkinto') }}</span>
    </template>
    <template #content>
      <p>{{ $t('tile-kieli-kaantaja-tutkinto-kuvaus') }}</p>
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
</script>

