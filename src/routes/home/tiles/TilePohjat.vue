<template>
<base-tile icon="luo-pdf" :route="{ name: 'pohjat' }">
  <template slot="header">
    <span>{{ $t('pohjat') }}</span>
  </template>
  <template slot="content">
    <p>{{ $t('tile-pohjat-kuvaus') }}</p>
  </template>
</base-tile>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import BaseTile from './BaseTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';


@Component({
  components: {
    BaseTile,
    EpSpinner,
  },
})
export default class TileOppaat extends Vue {
}
</script>

<style scoped lang="scss">

</style>
