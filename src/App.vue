<template>
<div v-if="!isInitializing" class="minfull h-100">
  <router-view />
  <EpNotification></EpNotification>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import { Kayttajat } from '@/stores/kayttaja';
import { delay } from '@shared/utils/delay';
import EpNotification from '@shared/components/EpNotification/EpNotification.vue';
import { Kielet } from '@shared/stores/kieli';
import { getKaannokset } from '@shared/api/eperusteet';

const isInitializing = ref(true);

//fix loader
//fix käännökset
onMounted(async () => {
  const instance = getCurrentInstance();
  const loader = (instance?.proxy?.$root as any)?.$loading.show({
    color: '#2E5FD1',
  });
  await Kayttajat.init();
  Kielet.load(await getKaannokset('eperusteet'));
  await delay(500);
  isInitializing.value = false;
  loader?.hide();
});
</script>

<style lang="scss">
@import 'vue-select/src/scss/vue-select.scss';

.minfull {
  min-height: 100vh;
}

body, html {
  height: 100%;
}
</style>
