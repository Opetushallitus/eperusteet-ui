<template>
  <EpContentView>
    <template v-slot:header>
      <h3 class="mb-0">
        {{ $t('laaja-alaiset-osaamiset') }}
      </h3>
    </template>

    <EpSpinner v-if="!laajaAlaisetOsaamiset"/>
    <div v-else>
      <div class="d-flex justify-content-end">
        <EpButton variant="outline" icon="plus" @click="lisaaLaajaAlainenOsaaminen" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
          {{ $t('uusi-laaja-alainen-osaaminen')}}
        </EpButton>
      </div>

      <b-row class="border-bottom-1 m-0 pb-2" v-if="laajaAlaisetOsaamiset.length > 0">
        <b-col cols="5" class="font-weight-bold">{{$t('nimi')}}</b-col>
        <b-col cols="5" class="font-weight-bold">{{$t('muokattu')}}</b-col>
      </b-row>

      <b-row v-for="(lao, index) in laajaAlaisetOsaamiset" :key="'lao'+index" class="taulukko-rivi-varitys py-3 m-0">
        <b-col cols="5" class="d-flex">
          <div>
            <router-link :to="{ name: 'perusopetusLaajaAlainenOsaaminen', params: { laoId: lao.id } }">{{ $kaanna(lao.nimi) }}</router-link>
          </div>
        </b-col>
        <b-col cols="5">
          <span v-if="lao.muokattu">{{$sdt(lao.muokattu)}}</span>
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
import { PerusopetusLaajaAlaisetOsaamisetStore } from '@/stores/PerusopetusLaajaAlaisetOsaamisetStore';
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
export default class RouteLaajaAlaisetOsaamiset extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  store: PerusopetusLaajaAlaisetOsaamisetStore | null = null;

  async mounted() {
    this.store = new PerusopetusLaajaAlaisetOsaamisetStore(this.perusteId!);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get laajaAlaisetOsaamiset() {
    if (this.store?.laajaAlaisetOsaamiset.value) {
      return _.sortBy(this.store?.laajaAlaisetOsaamiset.value, 'id');
    }
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

  lisaaLaajaAlainenOsaaminen() {
    this.$router.push({
      name: 'perusopetusLaajaAlainenOsaaminen',
    });
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
