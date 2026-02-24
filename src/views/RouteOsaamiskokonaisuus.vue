<template>
  <EpEditointi
    v-if="editointiStore"
    :store="editointiStore"
    :versionumero="versionumero"
  >
    <template #header="{ data }">
      <h2 v-if="data.nimi">
        {{ $kaanna(data.nimi) }}
      </h2>
      <h2 v-else>
        {{ $t('nimeton-osaamiskokonaisuus') }}
      </h2>
    </template>
    <template #default="{ data, isEditing, supportData }">
      <div
        v-if="isEditing"
        class="flex flex-wrap gap-4 mb-4"
      >
        <div class="lg:w-2/3">
          <EpFormGroup
            :label="$t('osaamiskokonaisuuden-nimi')"
            required
          >
            <ep-input
              v-model="data.nimi"
              :is-editing="isEditing"
            />
          </EpFormGroup>
        </div>
      </div>

      <div class="flex flex-wrap gap-4 mb-4">
        <div class="md:w-2/3">
          <EpFormGroup :label="$t('osaamiskokonaisuuden-kuvaus')">
            <ep-content
              v-model="data.kuvaus"
              layout="normal"
              :is-editable="isEditing"
              :kasite-handler="kasiteHandler"
              :kuva-handler="kuvaHandler"
            />
          </EpFormGroup>
        </div>
      </div>

      <h3>{{ $kaanna(data.nimi) }} {{ $t('varhaiskasvatuksessa-ja-esi-ja-perusopetuksessa') }}</h3>

      <Tabs value="0">
        <TabList>
          <Tab
            v-for="(kasitteisto, idx) in data.kasitteistot"
            :key="'kasitteisto' + kasitteisto.taso"
            :value="String(idx)"
          >
            {{ $t(kasitteisto.taso.toLowerCase()) }}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel
            v-for="(kasitteisto, idx) in data.kasitteistot"
            :key="'kasitteisto-panel' + kasitteisto.taso"
            :value="String(idx)"
          >
            <div class="tab-content-wrapper">
              <EpFormGroup>
                <ep-content
                  v-model="kasitteisto.kuvaus"
                  layout="normal"
                  :is-editable="isEditing"
                  :kasite-handler="kasiteHandler"
                  :kuva-handler="kuvaHandler"
                />
              </EpFormGroup>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <hr>

      <div class="flex flex-wrap gap-4">
        <div class="md:w-2/3">
          <EpFormGroup>
            <template #label>
              <div>
                <h3>{{ $t('keskeinen-kasitteisto') }}</h3>
              </div>
            </template>
            <ep-content
              v-model="data.keskeinenKasitteisto"
              layout="normal"
              :is-editable="isEditing"
              :kasite-handler="kasiteHandler"
              :kuva-handler="kuvaHandler"
            />
          </EpFormGroup>
        </div>
      </div>

      <hr>

      <h3 class="mt-4">
        {{ $t('paa-alueet') }}
      </h3>

      <div v-if="isEditing">
        {{ $t('lisaa-paa-alueita-osaamiskokonaisuuden-tallennetusta-nakymasta') }}
      </div>
      <template v-else-if="supportData">
        <div
          v-for="paaAlue in supportData.paaAlueet"
          :key="'paaalue' + paaAlue.id"
          class="mb-2"
        >
          <router-link :to="{ name: 'osaamiskokonaisuus_paa_alue', params: { osaamiskokonaisuusPaaAlueId: paaAlue.id } }">
            {{ $kaanna(paaAlue.perusteenOsa.nimi) || $t('nimeton-osaamiskokonaisuuden-paaalue') }}
          </router-link>
        </div>

        <ep-button
          variant="outline"
          icon="add"
          class="mt-2"
          @click="lisaaPaaAlue()"
        >
          {{ $t('lisaa-paa-alue') }}
        </ep-button>
      </template>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { KuvaStore } from '@/stores/KuvaStore';
import { OsaamiskokonaisuusStore } from '@/stores/OsaamiskokonaisuusStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { TermitStore } from '@/stores/TermitStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import * as _ from 'lodash';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import { OsaamiskokonaisuusPaaAlueStore } from '@/stores/OsaamiskokonaisuusPaaAlueStore';
import { onMounted } from 'vue';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
  osaamiskokonaisuusId: {
    type: Number,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const editointiStore = ref<EditointiStore | null>(null);
const kasiteHandler = inject('kasiteHandler');
const kuvaHandler = inject('kuvaHandler');

const perusteId = computed(() => props.perusteStore.perusteId.value);
const versionumero = computed(() => _.toNumber(route.query.versionumero));

const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const store = new OsaamiskokonaisuusStore(perusteId.value!, Number(props.osaamiskokonaisuusId), versionumero.value);
  editointiStore.value = new EditointiStore(store);
};

const lisaaPaaAlue = async () => {
  const tallennettu = await OsaamiskokonaisuusPaaAlueStore.create(props.osaamiskokonaisuusId);
  await props.perusteStore.updateNavigation();
  await router.push({
    name: 'osaamiskokonaisuus_paa_alue',
    params: {
      osaamiskokonaisuusPaaAlueId: '' + tallennettu!.id,
    },
  });
};

watch(() => props.osaamiskokonaisuusId, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

watch(versionumero, async () => {
  await fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

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
