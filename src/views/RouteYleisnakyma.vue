<template>
<div class="yleisnakyma">

  <div v-if="tyyppi === 'peruste'">
    <div class="row">
      <div class="col">
        <ep-peruste-aikataulu class="info-box" :aikatauluStore="aikatauluStore" :peruste="peruste"/>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <ep-peruste-tiedotteet class="info-box" :peruste="peruste" :tiedotteetStore="tiedotteetStore"/>
        <ep-peruste-perustiedot class="info-box" :peruste="peruste" :projekti="projekti" :tyoryhmaStore="tyoryhmaStore"/>
        <ep-peruste-tutkinnon-osat class="info-box" :peruste="peruste" :tutkinnonOsaStore="tutkinnonOsaStore"/>
      </div>
      <div class="col">
        <ep-peruste-viimeaikainen-toiminta class="info-box" :muokkaustietoStore="muokkaustietoStore" :peruste="peruste"/>
      </div>
    </div>
  </div>

  <div v-else>
    <div class="row">
      <div class="col">
        <ep-opas-perustiedot class="info-box" :peruste="peruste" :projekti="projekti" :tyoryhmaStore="tyoryhmaStore"/>
      </div>
      <div class="col">
        <ep-peruste-viimeaikainen-toiminta class="info-box" :muokkaustietoStore="muokkaustietoStore" :peruste="peruste"/>
      </div>
    </div>
  </div>

</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Mixins, Component, Vue, Watch } from 'vue-property-decorator';
import EpPerusteAikataulu from '@/components/EpYleisnakyma/EpPerusteAikataulu.vue';
import EpPerustePerustiedot from '@/components/EpYleisnakyma/EpPerustePerustiedot.vue';
import EpOpasPerustiedot from '@/components/EpYleisnakyma/EpOpasPerustiedot.vue';
import EpPerusteViimeaikainenToiminta from '@/components/EpYleisnakyma/EpPerusteViimeaikainenToiminta.vue';
import EpPerusteTutkinnonOsat from '@/components/EpYleisnakyma/EpPerusteTutkinnonOsat.vue';
import EpPerusteTiedotteet from '@/components/EpYleisnakyma/EpPerusteTiedotteet.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { TyoryhmaStore } from '@/stores/TyoryhmaStore';

@Component({
  components: {
    EpPerusteAikataulu,
    EpPerusteViimeaikainenToiminta,
    EpPerusteTutkinnonOsat,
    EpPerustePerustiedot,
    EpPerusteTiedotteet,
    EpOpasPerustiedot,
  },
})
export default class RouteYleisnakyma extends PerusteprojektiRoute {
  @Prop({ required: true })
  private tiedotteetStore!: TiedotteetStore;

  @Prop({ required: true })
  private tutkinnonOsaStore!: TutkinnonOsaStore;

  @Prop({ required: true })
  private muokkaustietoStore!: MuokkaustietoStore;

  @Prop({ required: true })
  private perusteprojektiStore!: PerusteprojektiStore;

  @Prop({ required: true })
  private aikatauluStore!: AikatauluStore;

  @Prop({ required: true })
  private tyoryhmaStore!: TyoryhmaStore;

  @Prop({ required: false, default: 'peruste' })
  private tyyppi!: 'opas' | 'peruste';

  async onProjektiChange() {
    if (this.peruste && this.peruste.id) {
      this.muokkaustietoStore.init(this.peruste.id);
      this.aikatauluStore.init(this.peruste);
      this.tutkinnonOsaStore.fetch();
      this.tiedotteetStore.init(this.peruste.id);
      this.tyoryhmaStore.init(this.projekti?.ryhmaOid);
    }
  }

  get projektiId() {
    return this.$route.params.projektiId;
  }

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
