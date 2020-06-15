<template>
<div v-if="!isInitializing" class="minfull h-100">
  <router-view />
  <notifications style="margin-right: 6px; margin-top: 90px;"
                 position="top right"
                 :max="3" />
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Kayttajat } from '@/stores/kayttaja';
import { delay } from '@shared/utils/delay';

@Component
export default class App extends Vue {
  private isInitializing = true;
  public async mounted() {
    const loader = (this as any).$loading.show({
      color: '#2E5FD1',
    });
    await Kayttajat.init();
    await delay(500);
    this.isInitializing = false;
    loader.hide();
  }
}
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
