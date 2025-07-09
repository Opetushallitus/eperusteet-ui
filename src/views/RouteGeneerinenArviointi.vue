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
          <arviointi-selector @update:modelValue="addGeneerinen" :arviointi-store="arviointiStore">
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import ArviointiSelector from './ArviointiSelector.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { GeneerinenArviointiasteikkoDto } from '@shared/api/eperusteet';
import GeneerinenArviointi from './GeneerinenArviointi.vue';
import * as _ from 'lodash';
import { KayttajaStore } from '@/stores/kayttaja';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  arviointiStore: ArviointiStore;
  kayttajaStore: KayttajaStore;
}>();


const muokattava = ref<GeneerinenArviointiasteikkoDto | null>(null);





const geneeriset = computed(() => {
  return props.arviointiStore.geneerisetFiltered.value;
});

const julkaistut = computed(() => {
  return _.filter(geneeriset.value, 'julkaistu');
});

const keskeneraiset = computed(() => {
  return _.chain(geneeriset.value)
    .reject('julkaistu')
    .map(geneerinen => {
      return {
        ...geneerinen,
        editing: _.isEqual(geneerinen, muokattava.value),
      };
    })
    .value();
});

const addGeneerinen = async (arviointiAsteikko: number) => {
  muokattava.value = await props.arviointiStore.add({
    _arviointiAsteikko: arviointiAsteikko,
  } as any) as any;
};

onMounted(() => {
  props.arviointiStore.fetchArviointiasteikot();
  props.arviointiStore.fetchGeneeriset();
});
</script>

<style lang="scss" scoped>

h2 {
  margin-top: 2rem;
}

.arviointi-wrapper {
  margin-top: 20px;
}

</style>
