<template>
<base-tile icon="arkistoi" :route="{ name: 'arkistoidut' }">
  <template slot="header">
    <span>{{ $t('arkistoidut') }}</span>
  </template>
  <template slot="content">
    <p>{{ $t('tile-arkistoidut-kuvaus') }}</p>
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
export default class TileArkistoidut extends Vue {
}
</script>

<style scoped lang="scss">

</style>
