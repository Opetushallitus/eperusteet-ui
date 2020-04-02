<template>
<div>
  <div class="yleisnakyma">

    <div class="row">
      <div class="col">
        <ep-opas-perustiedot class="info-box" :peruste="peruste" :projekti="projekti" :tyoryhma="tyoryhma"/>
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
import EpOpasPerustiedot from '@/components/EpYleisnakyma/EpOpasPerustiedot.vue';
import EpPerusteViimeaikainenToiminta from '@/components/EpYleisnakyma/EpPerusteViimeaikainenToiminta.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import RouteYleisnakyma from './RouteYleisnakyma.vue';

@Component({
  components: {
    EpPerusteViimeaikainenToiminta,
    EpOpasPerustiedot,
  },
})
export default class RouteOpasYleisnakyma extends RouteYleisnakyma {

}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import "@/styles/_mixins.scss";
@include yleisnakyma;

</style>
