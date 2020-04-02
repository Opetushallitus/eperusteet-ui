<template>
<div>
  <div class="yleisnakyma">

    <div class="row">
      <div class="col">
        <ep-peruste-aikataulu class="info-box" :aikatauluStore="aikatauluStore" :peruste="peruste"/>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <ep-peruste-tiedotteet class="info-box" :peruste="peruste" :tiedotteetStore="tiedotteetStore"/>
        <ep-peruste-perustiedot class="info-box" :peruste="peruste" :projekti="projekti"/>
        <ep-peruste-tutkinnon-osat class="info-box" :peruste="peruste" :tutkinnonOsaStore="tutkinnonOsaStore"/>
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
import { UlkopuolisetStore } from '../stores/UlkopuolisetStore';

@Component({
  components: {
    EpPerusteAikataulu,
    EpPerusteViimeaikainenToiminta,
    EpPerusteTutkinnonOsat,
    EpPerustePerustiedot,
    EpPerusteTiedotteet,
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
  private ulkopuolisetStore!: UlkopuolisetStore;

  private tyoryhma: any | null = null;

  async onProjektiChange() {
    if (this.peruste && this.peruste.id) {
      this.muokkaustietoStore.init(this.peruste.id);
      this.aikatauluStore.init(this.peruste);
      this.tutkinnonOsaStore.fetch();
      this.tiedotteetStore.init(this.peruste.id);
      this.tyoryhma = await this.ulkopuolisetStore.getTyoryhmaByOid(this.projekti?.ryhmaOid);
      console.log(this.tyoryhma);
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
@import "@/styles/_mixins.scss";
@include yleisnakyma;

</style>
