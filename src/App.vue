<template>
  <div class="minfull h-100">
    <router-view v-if="mounted"/>
    <!-- <EpNotification /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Kayttajat } from '@/stores/kayttaja';
import { Kielet } from '@shared/stores/kieli';
import { getKaannokset } from '@shared/api/eperusteet';
import { useLoading } from 'vue-loading-overlay';
import { loadingOptions } from './utils/loading';

const $loading = useLoading({
  ...loadingOptions,
  opacity: 1,
});

const mounted = ref(false);

onMounted(async () => {
  const loading = $loading.show();
  Kielet.load(await getKaannokset());
  await Kayttajat.init();
  loading.hide();
  mounted.value = true;
});

</script>

<style lang="scss" src="@shared/styles/app.scss">

.minfull {
  min-height: 100vh;
}

body, html {
  height: 100%;
}
</style>
