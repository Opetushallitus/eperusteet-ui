<template>
  <div class="content">
    <div class="d-flex justify-content-between">
      <h3 class="mb-4">{{$t('tiedotteet')}}</h3>
      <ep-tiedote-modal ref="eptiedotemodal" :peruste="peruste" :tiedotteetStore="tiedotteetStore"/>
    </div>

    <ep-spinner v-if="!tiedotteet || !peruste" />

    <div v-else>
      <div v-for="(tiedote, index) in tiedotteetFiltered" :key="index" class="tiedote p-2 pl-3" @click="avaaTiedote(tiedote)">
        <div class="otsikko" :class="{'uusi': tiedote.uusi}">{{$kaanna(tiedote.otsikko)}} <span class="uusi" v-if="tiedote.uusi">{{$t('uusi')}}</span></div>
        <div class="muokkausaika">{{$sdt(tiedote.muokattu)}}</div>
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
import EpTiedoteModal from '@shared/components/EpTiedoteModal/EpTiedoteModal.vue';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteDto, TiedoteDto } from '@shared/api/eperusteet';

@Component({
  components: {
    EpSpinner,
    EpButton,
    EpTiedoteModal,
  },
})
export default class EpPerusteTiedotteet extends Vue {
  @Prop({ required: true })
  private tiedotteetStore!: TiedotteetStore;

  @Prop({ required: true })
  private peruste!: PerusteDto;

  private tiedoteMaara = 3;

  get tiedotteet() {
    return this.tiedotteetStore.tiedotteet.value;
  }

  get tiedotteetSize() {
    return _.size(this.tiedotteetStore.tiedotteet.value);
  }

  get tiedotteetFiltered() {
    return _.chain(this.tiedotteetStore.tiedotteet.value)
      .map(tiedote => {
        return {
          ...tiedote,
          uusi: this.onkoUusi(tiedote.luotu),
        };
      })
      .take(this.tiedoteMaara)
      .value();
  }

  avaaTiedote(tiedote: TiedoteDto) {
    (this as any).$refs['eptiedotemodal'].muokkaa(tiedote);
  }

  onkoUusi(aika) {
    const paiva = 1000 * 60 * 60 * 24;
    const paivaSitten = Date.now() - paiva;

    return aika > paivaSitten;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .content {

    .tiedote:nth-of-type(even) {
      background-color: $table-even-row-bg-color;
    }

    .tiedote:nth-of-type(odd) {
      background-color: $table-odd-row-bg-color;
    }

    .tiedote {

      &:hover{
        background-color: $table-hover-row-bg-color;
        cursor: pointer;
      }

      .otsikko {

        &.uusi {
          font-weight: bold;
        }

        .uusi {
          background-color: $blue-lighten-3;
          border-radius: 5px;
          padding: 2px 4px;
          font-size: 0.7rem;
          margin-left: 5px;
        }
      }

      .muokkausaika {
        color: $gray-lighten-1;
      }
    }

    ::v-deep .btn {
      padding: 0px;
    }

  }

</style>
