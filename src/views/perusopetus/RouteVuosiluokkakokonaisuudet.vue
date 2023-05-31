<template>
  <EpContentView>
    <template v-slot:header>
      <h3 class="mb-0">
        {{ $t('vuosiluokkakokonaisuudet') }}
      </h3>
    </template>

    <EpSpinner v-if="!vuosiluokkakokonaisuudet"/>
    <div v-else>
      <div class="d-flex justify-content-end">
        <EpButton variant="outline" icon="plus" @click="lisaaVuosiluokkakokonaisuus" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
          {{ $t('uusi-vuosiluokkakokonaisuus')}}
        </EpButton>
      </div>

      <b-row class="border-bottom-1 m-0 pb-2" v-if="vuosiluokkakokonaisuudet.length > 0">
        <b-col cols="5" class="font-weight-bold">{{$t('nimi')}}</b-col>
        <b-col cols="5" class="font-weight-bold">{{$t('muokattu')}}</b-col>
      </b-row>

      <b-row v-for="(vlk, index) in vuosiluokkakokonaisuudet" :key="'lao'+index" class="taulukko-rivi-varitys py-3 m-0">
        <b-col cols="5" class="d-flex">
          <div>
            <router-link :to="{ name: 'perusopetusVuosiluokkakokonaisuus', params: { vlkId: vlk.id } }">{{ $kaanna(vlk.nimi) }}</router-link>
          </div>
        </b-col>
        <b-col cols="5">
          <span v-if="vlk.muokattu">{{$sdt(vlk.muokattu)}}</span>
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
import { PerusopetusVuosiluokkakokonaisuudetStore } from '@/stores/PerusopetusVuosiluokkakokonaisuudetStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContentView from '@shared/components/EpContentView/EpContentView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

@Component({
  components: {
    EpButton,
    EpEditointi,
    EpContentView,
    EpSpinner,
  },
})
export default class RouteVuosiluokkakokonaisuudet extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  store: PerusopetusVuosiluokkakokonaisuudetStore | null = null;

  async mounted() {
    this.store = new PerusopetusVuosiluokkakokonaisuudetStore(this.perusteId!);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get vuosiluokkakokonaisuudet() {
    return this.store?.vuosiluokkakokonaisuudet.value;
  }

  get fields() {
    return [{
      label: this.$t('nimi'),
      key: 'nimi',
      sortable: true,
    }, {
      label: this.$t('muokattu'),
      key: 'muokattu',
      thStyle: { width: '30%' },
      sortable: true,
      formatter: (value: any, key: string, item: any) => {
        return value != null ? this.$sdt(value) : '';
      },
    }];
  }

  lisaaVuosiluokkakokonaisuus() {
    this.$router.push({
      name: 'perusopetusVuosiluokkakokonaisuus',
    });
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
