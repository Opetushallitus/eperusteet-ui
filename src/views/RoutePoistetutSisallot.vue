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

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import PoistetutHakuTable from '@shared/components/EpPoistettuTable/PoistetutHakuTable.vue';
import { PoistetutStore } from '@/stores/PoistetutStore';
import { PoistettuSisaltoDtoTyyppiEnum } from '@shared/api/eperusteet';
import { PerusteStore } from '@/stores/PerusteStore';
import { $t, $success, $fail } from '@shared/utils/globals';

const props = defineProps<{
  poistetutStore: PoistetutStore;
  perusteStore: PerusteStore;
}>();

const tabIndex = ref(0);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const peruste = computed(() => {
  return props.perusteStore.peruste.value;
});

const poistetut = computed(() => {
  return props.poistetutStore.poistetut.value;
});

const tekstikappaleet = computed(() => {
  return _.filter(poistetut.value, p => _.toLower(p.tyyppi) === _.toLower(PoistettuSisaltoDtoTyyppiEnum.TEKSTIKAPPALE));
});

const tabs = computed(() => {
  return _.filter([{
    otsikko: 'tekstikappaleet',
    poistetut: tekstikappaleet.value,
  }], tab => _.size(tab.poistetut) > 0);
});

const fetch = async () => {
  if (peruste.value && peruste.value.id) {
    await props.poistetutStore.init(perusteId.value);
  }
};

const palauta = async (poistettu: any) => {
  try {
    await props.poistetutStore.palauta(perusteId.value, poistettu);
    await fetch();
    await props.perusteStore.updateNavigation();
    $success('palautus-onnistui');
  }
  catch (e) {
    $fail('virhe-palvelu-virhe');
  }
};

onMounted(async () => {
  await fetch();
});
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.poistetut {

  :deep(.tabs .nav-item a) {
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
