<template>
  <div class="mt-5">

    <div class="mt-5 mb-5">
      <div>
        <h2>{{ $t('julkaistut-arvioinnit') }}</h2>
      </div>
      <div class="arviointi-wrapper" v-for="(geneerinen, idx) in julkaistut" :key="idx + '-julkaistut'">
        <GeneerinenArviointi
        :value="geneerinen"
          :arviointi-store="arviointiStore"
          :kayttajaStore="kayttajaStore">
        </GeneerinenArviointi>
      </div>
    </div>

    <div class="mt-5">
      <div class="mt-5 mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h2 class="m-0">{{ $t('keskeneraiset-arvioinnit') }}</h2>
        </div>
        <div>
          <arviointi-selector @input="addGeneerinen" :arviointi-store="arviointiStore">
            <template v-slot:valinta>{{$t('luo-uusi-arviointi')}}</template>
          </arviointi-selector>
        </div>
      </div>
      <div class="arviointi-wrapper" v-for="(geneerinen, idx) in keskeneraiset" :key="idx + '-keskeneraiset'">
        <GeneerinenArviointi
          :value="geneerinen"
          :arviointi-store="arviointiStore"
          :kayttajaStore="kayttajaStore"
          :editing="geneerinen.editing">
        </GeneerinenArviointi>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import ArviointiSelector from './ArviointiSelector.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { GeneerinenArviointiasteikkoDto } from '@shared/api/eperusteet';
import GeneerinenArviointi from './GeneerinenArviointi.vue';
import * as _ from 'lodash';
import { KayttajaStore } from '@/stores/kayttaja';

@Component({
  components: {
    ArviointiSelector,
    EpButton,
    EpMainView,
    EpSearch,
    GeneerinenArviointi,
  },
})
export default class RouteGeneerinenArviointi extends Vue {
  @Prop({ required: true })
  arviointiStore!: ArviointiStore;

  @Prop({ required: true })
  kayttajaStore!: KayttajaStore;

  private open = {} as { [id: number]: boolean };
  private muokattava: GeneerinenArviointiasteikkoDto | null = null;

  mounted() {
    this.arviointiStore.fetchArviointiasteikot();
    this.arviointiStore.fetchGeneeriset();
  }

  get query() {
    return this.arviointiStore.filterStr.value;
  }

  set query(value: string) {
    this.arviointiStore.filterGeneeriset(value);
  }

  get allClosed() {
    return this.arviointiStore.allClosed.value;
  }

  get geneeriset() {
    return this.arviointiStore.geneerisetFiltered.value;
  }

  get julkaistut() {
    return _.filter(this.geneeriset, 'julkaistu');
  }

  get keskeneraiset() {
    return _.chain(this.geneeriset)
      .reject('julkaistu')
      .map(geneerinen => {
        return {
          ...geneerinen,
          editing: _.isEqual(geneerinen, this.muokattava),
        };
      })
      .value();
  }

  async addGeneerinen(arviointiAsteikko: number) {
    this.muokattava = await this.arviointiStore.add({
      _arviointiAsteikko: arviointiAsteikko,
    } as any) as any;
  }

  toggle(value?: GeneerinenArviointiasteikkoDto) {
    this.arviointiStore.toggleAll();
  }
}
</script>

<style lang="scss" scoped>

h2 {
  margin-top: 2rem;
}

.arviointi-wrapper {
  margin-top: 20px;
}

</style>
