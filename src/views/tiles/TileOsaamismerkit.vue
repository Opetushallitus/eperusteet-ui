<template>
  <EpHomeTile
    icon="military_tech"
    :route="{ name: 'osaamismerkit' }">
    <template slot="header">
      <span>{{ $t('tile-osaamismerkit') }}</span>
    </template>
    <template slot="content">
      <p>{{ $t('tile-osaamismerkit-kuvaus') }}</p>
    </template>
  </EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import { OsaamismerkitStore } from '@/stores/OsaamismerkitStore';
@Component({
  components: {
    EpHomeTile,
  },
})
export default class TileOsaamismerkit extends Vue {
  @Prop({ required: true })
  private osaamismerkitStore!: OsaamismerkitStore;
}
</script>

<style scoped>

</style>
