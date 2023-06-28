<template>
  <EpContentView>
    <template v-slot:header>
      <h3 class="mb-0">
        {{ $t('oppiaineet') }}
      </h3>
    </template>

    <EpSpinner v-if="!oppiaineet"/>
    <div v-else>
      <div class="d-flex justify-content-end">
        <EpButton variant="outline" icon="plus" @click="lisaaOppiaine" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
          {{ $t('uusi-oppiaine')}}
        </EpButton>
      </div>

      <b-row class="border-bottom-1 m-0 pb-2" v-if="oppiaineet.length > 0">
        <b-col cols="5" class="font-weight-bold">{{$t('nimi')}}</b-col>
      </b-row>

      <b-row v-for="(oppiaine, index) in oppiaineet" :key="'lao'+index" class="taulukko-rivi-varitys py-3 m-0">
        <b-col cols="5" class="d-flex">
          <div>
            <router-link :to="{ name: 'perusopetusoppiaine', params: { oppiaineId: oppiaine.id } }">
              <span v-if="oppiaine.nimi">{{ $kaanna(oppiaine.nimi) }}</span>
              <span v-else>{{$t('nimeton-oppiaine')}}</span>
              <span v-if="oppiaine.koodiArvo"> ({{ oppiaine.koodiArvo }})</span>
            </router-link>
          </div>
        </b-col>
      </b-row>
    </div>

  </EpContentView>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { PerusopetusOppiaineetStore } from '@/stores/PerusopetusOppiaineetStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContentView from '@shared/components/EpContentView/EpContentView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { PerusopetusOppiaineStore } from '@/stores/PerusopetusOppiaineStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';

@Component({
  components: {
    EpButton,
    EpEditointi,
    EpContentView,
    EpSpinner,
  },
})
export default class RouteOppiaineet extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  store: PerusopetusOppiaineetStore | null = null;

  async mounted() {
    this.store = new PerusopetusOppiaineetStore(this.perusteId!);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get oppiaineet() {
    if (this.store?.oppiaineet.value) {
      return _.sortBy(this.store?.oppiaineet.value, oppiaine => this.$kaanna(oppiaine.nimi));
    }
  }

  get fields() {
    return [{
      label: this.$t('nimi'),
      key: 'nimi',
      sortable: true,
    }];
  }

  async lisaaOppiaine() {
    const newOppiaine = await PerusopetusOppiaineStore.create(this.perusteId);
    await this.perusteStore.updateNavigation();
    await EditointiStore.cancelAll();
    this.$router.push({ name: 'perusopetusoppiaine', params: { oppiaineId: _.toString(newOppiaine.id), uusi: 'uusi' } });
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
