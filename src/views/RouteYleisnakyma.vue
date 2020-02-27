<template>
<div>
  <div class="yleisnakyma">

    <div class="row">
      <div class="col">
        <ep-peruste-aikataulu class="info-box" />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <ep-peruste-tiedotteet class="info-box" :peruste="peruste" :tiedotteetStore="tiedotteetStore"/>
        <ep-peruste-perustiedot class="info-box" :peruste="peruste" :projekti="projekti"/>
        <ep-peruste-tutkinnon-osat class="info-box" :peruste="peruste" :tutkinnonOsaStore="tutkinnonOsaStore"/>
      </div>
      <div class="col">
        <ep-peruste-viimeaikainen-toiminta class="info-box"/>
      </div>
    </div>

  </div>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Mixins, Component, Vue } from 'vue-property-decorator';
import EpPerusteAikataulu from '@/components/EpYleisnakyma/EpPerusteAikataulu.vue';
import EpPerustePerustiedot from '@/components/EpYleisnakyma/EpPerustePerustiedot.vue';
import EpPerusteViimeaikainenToiminta from '@/components/EpYleisnakyma/EpPerusteViimeaikainenToiminta.vue';
import EpPerusteTutkinnonOsat from '@/components/EpYleisnakyma/EpPerusteTutkinnonOsat.vue';
import EpPerusteTiedotteet from '@/components/EpYleisnakyma/EpPerusteTiedotteet.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';

@Component({
  components: {
    EpPerusteAikataulu,
    EpPerusteViimeaikainenToiminta,
    EpPerusteTutkinnonOsat,
    EpPerustePerustiedot,
    EpPerusteTiedotteet,
  },
})
export default class RouteYleisnakyma extends Vue {
  @Prop({ required: true })
  private perusteStore!: PerusteStore;

  @Prop({ required: true })
  private tiedotteetStore!: TiedotteetStore;

  @Prop({ required: true })
  private tutkinnonOsaStore!: TutkinnonOsaStore;

  get projekti() {
    return this.perusteStore.projekti.value;
  }

  get peruste() {
    return this.perusteStore.peruste.value;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .yleisnakyma {

    height: 100%;
    background-color: $gray-lighten-5;
    padding: 10px;

    .row {
      margin: 0px;
      padding-top: 10px;

      .col {
        padding: 0px;
        padding-left: 10px;
      }
    }

    .info-box {
      margin-bottom: 10px;
      padding:20px;
      background-color: #fff;
      border-radius: 0.5rem;
      box-shadow: 1px 1px 5px 0px rgba(0,26,88,0.1);
      min-width: 370px;
    }

  }

</style>
