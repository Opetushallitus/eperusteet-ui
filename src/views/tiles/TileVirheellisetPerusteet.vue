<template>
<EpHomeTile icon="virheelliset-perusteet" :route="{ name: 'virheellisetperusteet' }">
  <template slot="header">
    <span>{{ $t('virheelliset-perusteet') }}</span>
  </template>
  <template slot="content">
      <p>{{ $t('eperusteet-virheelliset-perusteet') }}</p>
    </template>
</EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { VirheellisetPerusteetStore } from '@/stores/VirheellisetPerusteetStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpHomeTile,
  },
})
export default class TileVirheellisetPerusteet extends Vue {

}
</script>

<style scoped lang="scss">

</style>
