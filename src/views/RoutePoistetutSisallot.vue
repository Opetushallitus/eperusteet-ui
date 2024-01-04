<template>
  <div class="poistetut">
    <div class="ylapaneeli d-flex align-items-center">
      <h2 class="otsikko">{{ $t('poistetut') }}</h2>
    </div>
    <div class="sisalto">
      <EpSpinner v-if="!poistetut" />
      <b-tabs content-class="mt-4" v-model="tabIndex">
        <b-tab v-for="(tab, index) in tabs" :key="'tab'+index" :title="$t(tab.otsikko)">
          <ep-spinner v-if="!poistetut" />
          <poistetut-haku-table v-else
                                :poistetut="tab.poistetut"
                                @palauta="palauta" />
        </b-tab>
      </b-tabs>

      <div v-if="poistetut && poistetut.length === 0 ">{{$t('ei-poistettuja-sisaltoja')}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Vue, Prop } from 'vue-property-decorator';

import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import PoistetutHakuTable from '@shared/components/EpPoistettuTable/PoistetutHakuTable.vue';
import { PoistetutStore } from '@/stores/PoistetutStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { PoistettuSisaltoDtoTyyppiEnum } from '@shared/api/eperusteet';
import { success, fail } from '@shared/utils/notifications';

@Component({
  components: {
    EpSpinner,
    PoistetutHakuTable,
  },
})
export default class RoutePoistetutSisallot extends PerusteprojektiRoute {
  @Prop({ required: true })
  private poistetutStore!: PoistetutStore;

  private tabIndex = 0;

  async mounted() {
    await this.fetch();
  }

  async fetch() {
    if (this.peruste && this.peruste.id) {
      await this.poistetutStore.init(this.perusteId);
    }
  }

  get poistetut() {
    return this.poistetutStore.poistetut.value;
  }

  get tabs() {
    return _.filter([{
      otsikko: 'tekstikappaleet',
      poistetut: this.tekstikappaleet,
    },
    ], tab => _.size(tab.poistetut) > 0);
  }

  get tekstikappaleet() {
    return _.filter(this.poistetut, p => p.tyyppi === _.toLower(PoistettuSisaltoDtoTyyppiEnum.TEKSTIKAPPALE));
  }

  async palauta(poistettu: any) {
    try {
      await this.poistetutStore.palauta(this.perusteId, poistettu);
      await this.fetch();
      await this.perusteStore.updateNavigation();
      success('palautus-onnistui');
    }
    catch (e) {
      fail('virhe-palvelu-virhe');
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.poistetut {

  ::v-deep .tabs .nav-item a {
    margin: 0;
    padding: 10px;
  }

  .ylapaneeli {
    font-weight: 600;
    padding: 5px 15px 5px 15px;
    border-bottom: 1px solid #eee;
    height: 50px;

    .otsikko {
      margin-bottom: 0;
    }
  }

  .sisalto {
    padding: 15px;
  }
}

</style>
