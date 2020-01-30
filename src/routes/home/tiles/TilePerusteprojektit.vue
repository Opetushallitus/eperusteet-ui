<template>
<base-tile icon="opetussuunnitelma" :route="{ name: 'perusteprojektit' }">
  <template slot="header">
    <span>{{ $t('perusteprojektit') }}</span>
  </template>
  <template slot="content">
    <p>{{ $t('tile-perusteprojektit-kuvaus') }}</p>
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
export default class TilePerusteprojektit extends Vue {

}
</script>

<style scoped lang="scss">

</style>
