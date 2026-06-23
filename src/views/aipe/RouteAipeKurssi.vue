<template>
  <EpEditointi
    :store="store"
    :versionumero="versionumero"
  >
    <template #header="{ data }">
      <h2 v-if="data.koodi">
        {{ $kaanna(data.koodi.nimi) }}
      </h2>
      <h2 v-else-if="data.nimi">
        {{ $kaanna(data.nimi) }}
      </h2>
      <h2
        v-else
        class="font-italic"
      >
        {{ $t('nimeton-kurssi') }}
      </h2>
    </template>

    <template #default="{ data, isEditing, supportData }">
      <div class="flex flex-wrap gap-4">
        <div
          v-if="isEditing"
          class="flex-[8] min-w-0"
        >
          <EpFormGroup :label="$t('kurssin-nimi')">
            <ep-koodisto-select
              v-model="data.koodi"
              :store="koodisto"
              :is-editing="isEditing"
              :nayta-arvo="false"
            />
          </EpFormGroup>
        </div>

        <div class="w-1/4">
          <EpFormGroup :label="$t('koodi')">
            <span v-if="data.koodi">
              {{ data.koodi.arvo }}
            </span>
          </EpFormGroup>
        </div>
      </div>

      <hr>

      <div class="flex flex-wrap gap-4">
        <div class="flex-[11] min-w-0">
          <EpFormGroup :label="$t('tavoitteisiin-liittyvat-keskeiset-sisaltoalueet')">
            <ep-content
              v-model="data.kuvaus"
              layout="normal"
              :is-editable="isEditing"
            />
          </EpFormGroup>
        </div>
      </div>

      <hr>

      <div class="flex flex-wrap gap-4">
        <div class="flex-[11] min-w-0">
          <EpFormGroup :label="$t('liitetyt-tavoitteet')">
            <div
              v-if="isEditing"
              class="flex flex-col gap-2"
            >
              <ep-toggle
                v-for="tavoite in supportData.tavoitteet"
                :key="tavoite.id"
                :checkbox="true"
                :model-value="data.tavoitteet?.includes(tavoite.id)"
                @update:model-value="(val: boolean) => toggleTavoite(tavoite.id, val)"
              >
                {{ $kaanna(tavoite.tavoite) }}
              </ep-toggle>
            </div>
            <template v-else>
              <div
                v-for="tavoite in tavoitteet"
                :key="tavoite.id"
                class="listaus p-3"
              >
                {{ $kaanna(tavoite.tavoite) }}
              </div>
            </template>
          </EpFormGroup>
        </div>
      </div>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed, inject, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { KoodistoSelectStore, getKoodistoSivutettuna } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { AipeKurssiStore } from '@/stores/AipeKurssiStore';
import { $kaanna, $t } from '@shared/utils/globals';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpToggleGroup from '@shared/components/forms/EpToggleGroup.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpInputGroup from '@shared/components/EpInputGroup/EpInputGroup.vue';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
  vaiheId: {
    type: [String, Number],
    required: false,
  },
  oppiaineId: {
    type: [String, Number],
    required: false,
  },
  kurssiId: {
    type: [String, Number],
    required: false,
  },
});

const route = useRoute();
const store = ref<EditointiStore | null>(null);

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});


const koodisto = new KoodistoSelectStore({
  koodisto: 'oppiaineetyleissivistava2',
  async query(query: string, sivu = 0, koodisto: string) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const isEditing = computed(() => {
  return store.value?.isEditing;
});

const tavoitteet = computed(() => {
  return _.filter(store.value?.supportData?.tavoitteet, tavoite => _.includes(store.value?.data?.tavoitteet, _.toString(tavoite.id)));
});

const kurssiChange = async () => {
  const storeInstance = new AipeKurssiStore(perusteId.value!, props.vaiheId, props.oppiaineId, props.kurssiId, props.perusteStore, versionumero.value);
  store.value = new EditointiStore(storeInstance);
};

const toggleTavoite = (tavoiteId: number, checked: boolean) => {
  if (!store.value?.data?.tavoitteet) return;
  if (checked) {
    store.value.data.tavoitteet = [...(store.value.data.tavoitteet || []), tavoiteId];
  }
  else {
    store.value.data.tavoitteet = store.value.data.tavoitteet.filter((id: number) => id !== tavoiteId);
  }
};

watch(() => props.kurssiId, async () => {
  await kurssiChange();
}, { immediate: true });

watch(versionumero, async () => {
  await kurssiChange();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.listaus:nth-of-type(even) {
  background-color: $table-even-row-bg-color;
}
.listaus:nth-of-type(odd) {
  background-color: $table-odd-row-bg-color;
}
</style>
