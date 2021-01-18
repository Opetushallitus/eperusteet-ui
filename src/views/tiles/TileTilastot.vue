<template>
  <EpHomeTile icon="tilasto"
              :route="{ name: 'tilastot' }">
    <template slot="header">
      <span>{{ $t('tile-tilastot') }}</span>
    </template>
    <template slot="content">
      <p>{{ $t('eperusteet-tilastot') }}</p>
    </template>
  </EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component, Prop, Provide } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';

@Component({
  components: {
    EpHomeTile,
  },
})
export default class TileTilastot extends Vue {

}
</script>
