<template>
  <div class="mt-5">
    <div class="rajaimet">
      <div class="d-flex justify-content-between">
        <div>
          <ep-search v-model="query" />
        </div>
        <div>
          <ep-button variant="link" @click="toggle()">{{ $t(allClosed ? 'avaa-kaikki' : 'sulje-kaikki') }}</ep-button>
        </div>
      </div>
    </div>

    <div class="mt-5 mb-5">
      <div>
        <h2>{{ $t('julkaistut-arvioinnit') }}</h2>
      </div>
      <div class="arviointi-wrapper" v-for="(geneerinen, idx) in julkaistut" :key="idx + '-julkaistut'">
        <GeneerinenArviointi
        :value="geneerinen"
          :arviointi-store="arviointiStore">
        </GeneerinenArviointi>
      </div>
    </div>

    <div class="mt-5">
      <div class="mt-5 mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h2 class="m-0">{{ $t('keskeneraiset-arvioinnit') }}</h2>
        </div>
        <div>
          <arviointi-selector @input="addGeneerinen" :arviointi-store="arviointiStore"> </arviointi-selector>
        </div>
      </div>
      <div class="arviointi-wrapper" v-for="(geneerinen, idx) in keskeneraiset" :key="idx + '-keskeneraiset'">
        <GeneerinenArviointi
        :value="geneerinen"
          :arviointi-store="arviointiStore">
        </GeneerinenArviointi>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator'
import EpMainView from '@shared/components/EpMainView/EpMainView.vue'
import EpIcon from '@shared/components/EpIcon/EpIcon.vue'
import EpSearch from '@shared/components/forms/EpSearch.vue'
import EpButton from '@shared/components/EpButton/EpButton.vue'
import ArviointiSelector from './ArviointiSelector.vue'
import { ArviointiStore } from '@/stores/ArviointiStore'
import { ArviointiAsteikkoDto, GeneerinenArviointiasteikkoDto } from '@shared/api/eperusteet'
import GeneerinenArviointi from './GeneerinenArviointi.vue'
import * as _ from 'lodash'


@Component({
  components: {
    ArviointiSelector,
    EpButton,
    EpIcon,
    EpMainView,
    EpSearch,
    GeneerinenArviointi,
  }
})
export default class RouteGeneerinenArviointi extends Vue {
  @Prop({ required: true })
  arviointiStore!: ArviointiStore;

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
    return _.reject(this.geneeriset, 'julkaistu');
  }

  async addGeneerinen(arviointiAsteikko: number) {
    await this.arviointiStore.addGeneerinenArviointi({ _arviointiAsteikko: arviointiAsteikko } as any);
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

