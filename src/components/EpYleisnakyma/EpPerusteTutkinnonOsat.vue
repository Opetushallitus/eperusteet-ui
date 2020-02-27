<template>
  <div class="content">
    <h3>{{$t('tutkinnon-osat')}}</h3>

    <ep-spinner v-if="!tutkinnonOsat" />

    <div class="box d-inline-flex flex-column align-items-center justify-content-center text-center" v-if="tutkinnonOsat">
      <div class="count">{{tutkinnonOsiaTuotu}}</div>
      <div class="topic">{{$t('tuotua')}}</div>
    </div>

    <div class="box d-inline-flex flex-column  align-items-center justify-content-center text-center" v-if="tutkinnonOsat">
      <div class="count">{{tutkinnonOsiaLuotu}}</div>
      <div class="topic">{{$t('luotua')}}</div>
    </div>

  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { PerusteDto } from '@shared/api/eperusteet';

@Component({
  components: {
    EpSpinner,
  },
})
export default class EpPerusteTutkinnonOsat extends Vue {
  @Prop({ required: true })
  private tutkinnonOsaStore!: TutkinnonOsaStore;

  @Prop({ required: true })
  private peruste!: PerusteDto;

  async mounted() {
    if (this.peruste && this.peruste.id) {
      this.tutkinnonOsaStore.init(this.peruste.id, _.map(this.peruste.suoritustavat, suoritustapa => _.toString(suoritustapa.suoritustapakoodi)));
    }
  }

  get tutkinnonOsat() {
    return this.tutkinnonOsaStore.tutkinnonOsat.value;
  }

  get tutkinnonOsiaLuotu() {
    return _.size(this.tutkinnonOsaStore.tutkinnonOsat.value);
  }

  get tutkinnonOsiaTuotu() {
    return '?';
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .box {
    width: 125px;
    height: 140px;
    margin-right: 10px;
    margin-top: 10px;
    padding: 10px;
    background-color: #f7f8fc;

    .count {
      font-size: 2.375rem;
      line-height: 1;

      .secondary {
        font-size: 1rem;
        color: $gray-lighten-1;
      }
    }

    .topic {
      padding-top: 10px;
    }
  }

</style>
