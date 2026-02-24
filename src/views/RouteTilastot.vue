<template>
  <ep-main-view container>
    <template #header>
      <h1>{{ $t('tilastot') }}</h1>
    </template>

    <Tabs value="0">
      <TabList>
        <Tab value="0">
          {{ $t('suunnitelmien-lukumaarat') }}
        </Tab>
        <Tab value="1">
          {{ $t('amosaa-tyokalu') }}
        </Tab>
        <Tab value="2">
          {{ $t('ops-tyokalu') }}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <div class="mt-3 taulukko-graafi">
            <Tabs value="0">
              <TabList>
                <Tab value="0">
                  {{ $t('taulukko') }}
                </Tab>
                <Tab value="1">
                  {{ $t('graafi') }}
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel value="0">
                  <div class="tab-content-wrapper">
                    <EpLukumaaraTilastot
                      :tilastot-store="tilastotStore"
                      class="mt-4"
                    />
                  </div>
                </TabPanel>
                <TabPanel value="1">
                  <div class="tab-content-wrapper">
                    <EpLukumaaraGraafit
                      :tilastot-store="tilastotStore"
                      class="mt-4"
                    />
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </TabPanel>

        <TabPanel value="1">
          <div class="tab-content-wrapper">
            <EpAmosaaTilastot
              :toteutussuunnitelmat="toteutussuunnitelmat"
              class="mt-5"
            />
          </div>
        </TabPanel>

        <TabPanel value="2">
          <div class="tab-content-wrapper">
            <EpYlopsTilastot
              :opetussuunnitelmat="opetussuunnitelmat"
              :perusteet="perusteet"
              class="mt-5"
            />
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
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
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

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

:deep(.p-tabs-nav) {
  margin-left: 0;
  padding-left: 0;
}

:deep(.p-tab) {
  margin-left: 0 !important;
}

:deep(.p-tabpanels) {
  padding: 1rem 0;
}
</style>
