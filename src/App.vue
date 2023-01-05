<template>
<div v-if="!isInitializing" class="minfull h-100">
  <router-view />
  <EpNotification></EpNotification>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Kayttajat } from '@/stores/kayttaja';
import { delay } from '@shared/utils/delay';
import EpNotification from '@shared/components/EpNotification/EpNotification.vue';

@Component({
  components: {
    EpNotification,
  },
})
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
