<template>
  <ep-spinner v-if="!store" />
  <EpEditointi
    v-else
    :store="store"
  >
    <template #header>
      <h2>{{ $t('muokkaa-jarjestysta') }}</h2>
    </template>
    <template #default="{ data, isEditing }">
      <Tabs value="0">
        <TabList>
          <Tab
            v-for="(tab, idx) in jarjestaTabs(data)"
            :key="tab.id"
            :value="String(idx)"
          >
            {{ $t(tab.titleKey) }}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel
            v-for="(tab, idx) in jarjestaTabs(data)"
            :key="'panel-' + tab.id"
            :value="String(idx)"
          >
            <div class="tab-content-wrapper mt-3">
              <EpJarjesta
                v-if="tab.id === 'tutkinnonOsat'"
                v-model="data.tutkinnonOsat"
                group="sisaltoJarjestysGroup"
                :is-editable="isEditing"
              >
                <template #default="{ node }">
                  <span>
                    {{ $kaanna(node.nimi) }}
                  </span>
                </template>
              </EpJarjesta>
              <EpJarjesta
                v-else-if="tab.id === 'tekstit'"
                v-model="data.tekstit.lapset"
                child-field="lapset"
                group="sisaltoJarjestysGroup"
                :is-editable="isEditing"
              >
                <template #default="{ node }">
                  <span>
                    {{ $kaanna(node.perusteenOsa.nimi) }}
                  </span>
                  <EpPopover
                    v-if="node.perusteenOsa.liite"
                    :triggers="['hover']"
                  >
                    <template #trigger>
                      <EpMaterialIcon size="18px">
                        attach_file
                      </EpMaterialIcon>
                    </template>
                    {{ $t('tekstikappale-naytetaan-liitteena') }}
                  </EpPopover>
                </template>
              </EpJarjesta>
              <EpJarjesta
                v-else-if="tab.id === 'vaiheet'"
                v-model="data.vaiheet.vaiheet"
                group="sisaltoJarjestysGroup"
                :is-editable="isEditing"
              >
                <template #default="{ node }">
                  <span>
                    {{ $kaanna(node.nimi) }}
                  </span>
                </template>
              </EpJarjesta>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpJarjesta from '@shared/components/EpJarjesta/EpJarjesta.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { JarjestysStore } from '@/stores/JarjestysStore';
import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { TekstiRakenneStore } from '@/stores/TekstiRakenneStore';
import { Koulutustyyppi } from '@shared/tyypit';
import { AipeVaiheetStore } from '@/stores/AipeVaiheetStore';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpPopover from '@shared/components/EpPopover/EpPopover.vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import { $kaanna, $t } from '@shared/utils/globals';
import { useRoute } from 'vue-router';

const props = defineProps<{
  perusteStore: any;
}>();

const store = ref<EditointiStore | null>(null);
const stores = ref<{ [key: string]: IEditoitava }>({});
const route = useRoute();

type JarjestaTabId = 'tutkinnonOsat' | 'tekstit' | 'vaiheet';

function jarjestaTabs(data: any) {
  const tabs: { id: JarjestaTabId; titleKey: string }[] = [];
  if (data?.tutkinnonOsat) {
    tabs.push({ id: 'tutkinnonOsat', titleKey: 'tutkinnon-osat' });
  }
  if (data?.tekstit) {
    tabs.push({ id: 'tekstit', titleKey: 'tekstikappaleet' });
  }
  if (data?.vaiheet) {
    tabs.push({ id: 'vaiheet', titleKey: 'vaiheet' });
  }
  return tabs;
}

function jarjestaTabsKey(data: any) {
  return [
    data?.tutkinnonOsat ? '1' : '0',
    data?.tekstit ? '1' : '0',
    data?.vaiheet ? '1' : '0',
  ].join('-');
}

const peruste = computed(() => {
  return props.perusteStore.peruste.value;
});

const isAmmatillinen = computed(() => {
  return props.perusteStore.isAmmatillinen.value;
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const projektiId = computed(() => {
  return route.params.projektiId;
});

const onProjektiChange = async () => {
  if (perusteId.value) {
    stores.value = {
      tekstit: new TekstiRakenneStore(perusteId.value),
    };

    if (isAmmatillinen.value) {
      stores.value.tutkinnonOsat = new TutkinnonOsaStore(props.perusteStore);
    }

    if (peruste.value?.koulutustyyppi === Koulutustyyppi.aikuistenperusopetus) {
      stores.value.vaiheet = new AipeVaiheetStore(perusteId.value, props.perusteStore);
    }

    store.value = new EditointiStore(new JarjestysStore(stores.value));
  }
};

// Initialize component when mounted
onMounted(async () => {
  await onProjektiChange();
});

// Watch for changes in perusteId or projektiId
watch([() => projektiId, () => perusteId], async () => {
  if (projektiId.value && perusteId.value) {
    await onProjektiChange();
  }
});
</script>

<style scoped lang="scss">
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
