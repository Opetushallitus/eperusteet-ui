<template>
  <div class="content">
    <div class="d-flex justify-content-between">
      <h3 class="mb-4">{{$t('tiedotteet')}}</h3>
      <ep-button icon="plussa" variant="outline" v-b-modal.tiedoteMuokkausModal @click="lisaaTiedote">
          {{ $t('lisaa-tiedote') }}
      </ep-button>
    </div>

    <ep-spinner v-if="!tiedotteet" />

    <div v-else>
      <div v-for="(tiedote, index) in tiedotteetFiltered" :key="index" class="tiedote p-2 pl-3">
        <div>
          <div class="otsikko">{{$kaanna(tiedote.otsikko)}}</div>
          <div class="muokkausaika">{{$sdt(tiedote.muokattu)}}</div>
        </div>
      </div>

      <div class="text-center">
        <ep-button variant="link" @click="tiedoteMaara += 3" v-if="tiedoteMaara < tiedotteetSize">{{$t('katso-lisaa-tiedotteita')}}</ep-button>
        <span v-if="tiedotteetSize === 0">{{$t('ei-tiedotteita')}}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { PerusteDto } from '@shared/api/eperusteet';

@Component({
  components: {
    EpSpinner,
    EpButton,
  },
})
export default class EpPerusteTiedotteet extends Vue {
  @Prop({ required: true })
  private tiedotteetStore!: TiedotteetStore;

  @Prop({ required: true })
  private peruste!: PerusteDto;

  private tiedoteMaara = 3;

  async mounted() {
    if (this.peruste && this.peruste.id) {
      await this.tiedotteetStore.init(this.peruste.id);
    }
  }

  get tiedotteet() {
    return this.tiedotteetStore.perusteenTiedotteet.value;
  }

  get tiedotteetSize() {
    return _.size(this.tiedotteetStore.perusteenTiedotteet.value);
  }

  get tiedotteetFiltered() {
    return _.chain(this.tiedotteetStore.perusteenTiedotteet.value)
      .take(this.tiedoteMaara)
      .value();
  }

  lisaaTiedote() {

  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .content {

    .tiedote:nth-child(even) {
      background-color: $gray-lighten-5;
    }

    .tiedote {

      .muokkausaika {
        color: $gray-lighten-1;
      }
    }

  }

</style>
