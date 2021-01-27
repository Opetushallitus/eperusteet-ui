<template>
  <div class="content">
    <h3>{{$t('tutkinnon-osat')}}</h3>

    <ep-spinner v-if="!tutkinnonOsat || !peruste" />

    <div v-else>
      <ep-small-data-box :topic="$t('tuotua')" :count="tutkinnonOsiaTuotu" />
      <ep-small-data-box :topic="$t('luotu')" :count="tutkinnonOsiaLuotu" />
    </div>

  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { PerusteDto } from '@shared/api/eperusteet';
import EpSmallDataBox from '@/components/EpYleisnakyma/EpSmallDataBox.vue';

@Component({
  components: {
    EpSpinner,
    EpSmallDataBox,
  },
})
export default class EpPerusteTutkinnonOsat extends Vue {
  @Prop({ required: true })
  private tutkinnonOsaStore!: TutkinnonOsaStore;

  @Prop({ required: true })
  private peruste!: PerusteDto;

  get tutkinnonOsat() {
    return this.tutkinnonOsaStore.tutkinnonOsat.value;
  }

  get tutkinnonOsiaLuotu() {
    return _.size(_.filter(this.tutkinnonOsaStore.tutkinnonOsat.value,
      tutkinnonosaViite => !tutkinnonosaViite.tutkinnonOsa?.alkuperainenPeruste || tutkinnonosaViite.tutkinnonOsa.alkuperainenPeruste.id === this.peruste.id));
  }

  get tutkinnonOsiaTuotu() {
    return _.size(this.tutkinnonOsaStore.tutkinnonOsat.value) - this.tutkinnonOsiaLuotu;
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
</style>
