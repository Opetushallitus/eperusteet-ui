<template>
  <ep-main-view :container="true">
    <template #header>
      <h1>{{ $t('tilastot') }}</h1>
    </template>

    <b-tabs>
      <b-tab :title="$t('suunnitelmien-lukumaarat')" class="mt-3 taulukko-graafi">
        <b-tabs pills>
          <b-tab :title="$t('taulukko')" active>
            <EpLukumaaraTilastot :tilastotStore="tilastotStore" class="mt-4"/>
          </b-tab>
          <b-tab :title="$t('graafi')">
            <EpLukumaaraGraafit :tilastotStore="tilastotStore" class="mt-4"/>
          </b-tab>
        </b-tabs>
      </b-tab>

      <b-tab :title="$t('amosaa-tyokalu')" class="mt-5">
        <EpAmosaaTilastot :toteutussuunnitelmat="toteutussuunnitelmat" />
      </b-tab>

      <b-tab :title="$t('ops-tyokalu')" class="mt-5">
        <EpYlopsTilastot :opetussuunnitelmat="opetussuunnitelmat" :perusteet="perusteet"/>
      </b-tab>

    </b-tabs>

  </ep-main-view>
</template>

<script lang="ts" >
import { Component, Vue, Prop } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import * as _ from 'lodash';
import { TilastotStore } from '@/stores/TilastotStore';
import EpAmosaaTilastot from '@/components/tilastot/EpAmosaaTilastot.vue';
import EpYlopsTilastot from '@/components/tilastot/EpYlopsTilastot.vue';
import EpLukumaaraTilastot from '@/components/tilastot/EpLukumaaraTilastot.vue';
import EpLukumaaraGraafit from '@/components/tilastot/EpLukumaaraGraafit.vue';

@Component({
  components: {
    EpMainView,
    EpAmosaaTilastot,
    EpYlopsTilastot,
    EpLukumaaraTilastot,
    EpLukumaaraGraafit,
  },
})
export default class RouteTilastot extends Vue {
  @Prop({ required: true })
  private tilastotStore!: TilastotStore;

  async mounted() {
    try {
      await this.tilastotStore.fetch();
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
  }

  get toteutussuunnitelmat() {
    return this.tilastotStore.toteutussuunnitelmat.value;
  }

  get opetussuunnitelmat() {
    return this.tilastotStore.opetussuunnitelmat.value;
  }

  get perusteet() {
    return this.tilastotStore.perusteet.value;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

::v-deep .container{
  max-width: 1500px;
}

::v-deep .taulukko-graafi .nav-pills .nav-item {
  border: 2px solid #3367E3;

  .nav-link {
    border-radius: 0;
  }
}

::v-deep .taulukko-graafi .nav-pills .nav-item:first-child {
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

::v-deep .taulukko-graafi .nav-pills .nav-item:last-child {
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem
}

</style>
