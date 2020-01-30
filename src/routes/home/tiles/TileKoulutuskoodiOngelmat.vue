<template>
<base-tile icon="muistikirja" :route="{ name: 'koulutuskoodiongelmat' }">
  <template slot="header">
    <span>{{ $t('koulutuskoodi-ongelmat') }}</span>
  </template>
  <template slot="content">
    <p>{{ $t('tile-koulutuskoodi-ongelmat-kuvaus') }}</p>
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
export default class TileKoulutuskoodiOngelmat extends Vue {
}
</script>

<style scoped lang="scss">

</style>
