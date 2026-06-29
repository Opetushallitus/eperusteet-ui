<template>
  <ep-main-view container>
    <template #header>
      <h1>{{ $t('tilastot') }}</h1>
    </template>

    <EpTabs>
      <EpTab :title="$t('suunnitelmien-lukumaarat')">
        <div class="mt-3 taulukko-graafi">
          <EpTabs>
            <EpTab :title="$t('taulukko')">
              <EpLukumaaraTilastot
                :tilastot-store="tilastotStore"
                class="mt-4"
              />
            </EpTab>
            <EpTab :title="$t('graafi')">
              <EpLukumaaraGraafit
                :tilastot-store="tilastotStore"
                class="mt-4"
              />
            </EpTab>
          </EpTabs>
        </div>
      </EpTab>

      <EpTab :title="$t('amosaa-tyokalu')">
        <EpAmosaaTilastot
          :toteutussuunnitelmat="toteutussuunnitelmat"
          class="mt-5"
        />
      </EpTab>

      <EpTab :title="$t('ops-tyokalu')">
        <EpYlopsTilastot
          :opetussuunnitelmat="opetussuunnitelmat"
          :perusteet="perusteet"
          class="mt-5"
        />
      </EpTab>
    </EpTabs>
  </ep-main-view>
</template>

<script setup lang="ts">
import { computed, onMounted, getCurrentInstance } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import _ from 'lodash';
import { TilastotStore } from '@/stores/TilastotStore';
import EpAmosaaTilastot from '@/components/tilastot/EpAmosaaTilastot.vue';
import EpYlopsTilastot from '@/components/tilastot/EpYlopsTilastot.vue';
import EpLukumaaraTilastot from '@/components/tilastot/EpLukumaaraTilastot.vue';
import EpLukumaaraGraafit from '@/components/tilastot/EpLukumaaraGraafit.vue';
import { $t, $fail } from '@shared/utils/globals';
import EpTabs from '@shared/components/EpTabs/EpTabs.vue';
import EpTab from '@shared/components/EpTabs/EpTab.vue';

const props = defineProps<{
  tilastotStore: TilastotStore;
}>();


const toteutussuunnitelmat = computed(() => {
  return props.tilastotStore.toteutussuunnitelmat.value;
});

const opetussuunnitelmat = computed(() => {
  return props.tilastotStore.opetussuunnitelmat.value;
});

const perusteet = computed(() => {
  return props.tilastotStore.perusteet.value;
});

onMounted(async () => {
  try {
    await props.tilastotStore.fetch();
  }
  catch (e) {
    $fail($t('virhe-palvelu-virhe') as string);
  }
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

:deep(.container) {
  max-width: 1500px !important;
}

</style>
