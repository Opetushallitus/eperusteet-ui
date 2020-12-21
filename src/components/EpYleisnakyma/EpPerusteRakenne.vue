<template>
  <div class="content">
    <h3>{{$t('rakenne')}}</h3>

    <ep-spinner v-if="!peruste" />

    <ep-small-data-box :topic="$t('tekstikappaleita')" :count="tekstikappaleita" />
    <ep-small-data-box :topic="$t('opintokokonaisuutta')" :count="opintokokonaisuutta" />

  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { PerusteDto } from '@shared/api/eperusteet';
import EpSmallDataBox from '@/components/EpYleisnakyma/EpSmallDataBox.vue';
import { PerusteStore } from '@/stores/PerusteStore';

@Component({
  components: {
    EpSpinner,
    EpSmallDataBox,
  },
})
export default class EpRakenne extends Vue {
  @Prop({ required: true })
  protected perusteStore!: PerusteStore;

  get peruste() {
    return this.perusteStore.peruste.value;
  }

  get tekstikappaleita() {
    return _.size(_.filter(this.sisaltoFlat, sisalto => sisalto.type === 'viite'));
  }

  get opintokokonaisuutta() {
    return _.size(_.filter(this.sisaltoFlat, sisalto => sisalto.type === 'opintokokonaisuus'));
  }

  get sisaltoFlat() {
    return this.sisaltoLapset(this.perusteStore.navigation.value);
  }

  sisaltoLapset(sisalto) {
    return _.chain(sisalto.children)
      .map(lapsi => {
        return [
          lapsi,
          ...this.sisaltoLapset(lapsi),
        ];
      })
      .flatten()
      .value();
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
</style>
