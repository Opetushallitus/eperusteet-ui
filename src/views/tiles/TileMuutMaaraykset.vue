<template>
  <EpHomeTile icon="picture_as_pdf"
              :route="{ name: 'muutMaaraykset' }">
    <template slot="header">
      <span>{{ $t('tile-ammatilliset-maaraykset') }}</span>
    </template>
    <template slot="content">

      <div v-if="maaraykset">
        <p v-if="maaraykset.length === 0">{{ $t('ei-maarayksia') }}</p>

        <div v-else class="text-left ml-5">
          <div v-for="(maarays, index) in top3Maaraykset" :key="'maarays'+index">
            {{$kaanna(maarays.nimi)}}
          </div>
          <ep-button variant="link" v-if="maaraykset.length > 3" buttonClass="pl-0 btn-sm" class="no-padding">
            {{maaraykset.length - 3}} {{$t('muuta-maaraysta')}}
          </ep-button>
        </div>
      </div>

      <EpSpinner v-else />

     </template>
  </EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import { MuutMaarayksetStore } from '@/stores/MuutMaarayksetStore';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import * as _ from 'lodash';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
    EpButton,
    EpMaterialIcon,
  },
})
export default class TileMuutMaaraykset extends Vue {
  @Prop({ required: true })
  private muutMaarayksetStore!: MuutMaarayksetStore;

  async mounted() {
    if (!this.maaraykset) {
      await this.muutMaarayksetStore.fetch();
    }
  }

  get top3Maaraykset() {
    return _.take(this.maaraykset, 3);
  }

  get maaraykset() {
    return this.muutMaarayksetStore.maaraykset.value;
  }
}
</script>

<style scoped lang="scss">
.ikoni {
  font-size: 3rem;
  padding-top: 12px;
}

</style>
