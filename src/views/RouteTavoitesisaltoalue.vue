<template>
  <EpEditointi
    v-if="store"
    :store="store"
    :versionumero="versionumero"
  >
    <template #header="{ data }">
      <h2
        v-if="data.nimiKoodi"
        class="!m-0"
      >
        {{ $kaanna(data.nimiKoodi.nimi) }}
      </h2>
    </template>
    <template #default="{ data, isEditing }">
      <div
        v-if="isEditing"
        class="flex flex-wrap gap-4 mb-4"
      >
        <div class="lg:w-2/3">
          <EpFormGroup
            :label="$t('otsikko')"
            required
          >
            <ep-koodisto-select
              v-model="data.nimiKoodi"
              :store="tavoitesisaltoalueotsikkoKoodisto"
              :is-editing="isEditing"
              :nayta-arvo="false"
            >
              <template #default="{ open }">
                <EpInputGroup>
                  <ep-input
                    :model-value="data.nimiKoodi ? $kaanna(data.nimiKoodi.nimi) : ''"
                    :is-editing="true"
                    disabled
                  />
                  <template #append>
                    <ep-button
                      variant="primary"
                      @click="open"
                    >
                      {{ $t('hae-koodistosta') }}
                    </ep-button>
                  </template>
                </EpInputGroup>
              </template>
            </ep-koodisto-select>
          </EpFormGroup>
        </div>
      </div>

      <div class="flex flex-wrap gap-4">
        <div class="lg:w-2/3">
          <EpFormGroup required>
            <template
              v-if="isEditing"
              #label
            >
              <div>{{ $t('kappaleen-teksti') }}</div>
            </template>
            <ep-content
              v-model="data.teksti"
              layout="normal"
              :is-editable="isEditing"
              :kasite-handler="kasiteHandler"
              :kuva-handler="kuvaHandler"
            />
          </EpFormGroup>

          <hr>
        </div>
      </div>

      <h3 class="mb-4">
        {{ $t('tavoitteet-ja-keskeiset-sisaltoalueet') }}
      </h3>
      <div class="flex flex-wrap gap-4">
        <div class="lg:w-2/3">
          <EpTavoitesisaltoalueTavoitealueet
            v-model="data.tavoitealueet"
            :is-editing="isEditing"
          />
        </div>
      </div>
    </template>
  </EpEditointi>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import { useRoute } from 'vue-router';
import * as _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { KoodistoSelectStore, getKoodistoSivutettuna } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { TavoitesisaltoalueStore } from '@/stores/TavoitesisaltoalueStore';
import EpTavoitesisaltoalueTavoitealueet from '@shared/components/EpTavoitesisaltoalue/EpTavoitesisaltoalueTavoitealueet.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpInputGroup from '@shared/components/EpInputGroup/EpInputGroup.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const route = useRoute();
const store = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const tavoitesisaltoalueId = computed(() => {
  return route.params.tavoitesisaltoalueId;
});

const kasiteHandler = inject('kasiteHandler');
const kuvaHandler = inject('kuvaHandler');

// Initialize koodisto
const tavoitesisaltoalueotsikkoKoodisto = new KoodistoSelectStore({
  koodisto: 'tavoitesisaltoalueenotsikko',
  async query(query: string, sivu = 0, koodisto: string) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const tkstore = new TavoitesisaltoalueStore(
    perusteId.value!,
    Number(tavoitesisaltoalueId.value),
    versionumero.value,
  );
  store.value = new EditointiStore(tkstore);
};

// Watch for changes in tavoitesisaltoalueId
watch(tavoitesisaltoalueId, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

// Watch for changes in versionumero
watch(versionumero, async () => {
  await fetch();
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  :deep(fieldset) {
    padding-right: 0;
  }

  :deep(.input-wrapper) {
    flex: 1 1 0;

    input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
</style>
