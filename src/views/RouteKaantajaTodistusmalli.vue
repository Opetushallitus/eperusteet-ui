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
        {{ $t('nimeton-todistusmalli') }}
      </h2>
    </template>
    <template #default="{ data, isEditing }">
      <div
        v-if="isEditing"
        class="mb-4 w-80"
      >
        <b-form-group
          class="p-0"
          :label="$t('otsikko')"
          required
        >
          <ep-input
            v-model="data.nimi"
            :is-editing="isEditing"
          />
        </b-form-group>
      </div>

      <div class="mb-4 w-80">
        <b-form-group class="p-0">
          <template
            v-if="isEditing"
            #label
          >
            <div>{{ $t('kuvaus') }}</div>
          </template>
          <ep-content
            v-model="data.kuvaus"
            layout="normal"
            :is-editable="isEditing"
          />
        </b-form-group>
      </div>

      <template v-if="isEditing">
        <h3 class="mt-4 mb-3">
          {{ $t('taitotasokuvaukset') }}
        </h3>


        <template
          v-for="taso in tasot"
          :key="taso.key"
        >
          <div class="mb-4 w-80 taso-section">
            <h4>{{ taso.label }}</h4>
            <VueDraggable
              v-bind="draggingOptions"
              v-model="data[taso.key].taitotasot"
              tag="div"
              @start="dragging = true"
              @end="dragging = false"
            >
              <div
                v-for="(taitotaso, index) in data[taso.key].taitotasot"
                :key="taso.key + '-view-' + index"
                class="mb-3"
              >
                <div class="d-flex">
                  <div class="w-100">
                    <div class="row mb-2">
                      <div class="col-md-5">
                        <label>{{ $t('taitotaso') }}</label>
                        <ep-koodisto-select-draggable
                          v-model="taitotaso.taitotaso"
                          :store="arvosanaKoodisto"
                          :is-editing="isEditing"
                          :nayta-arvo="false"
                        />
                      </div>
                      <div class="col-md-6">
                        <label>{{ $t('evkn-asteikko') }}</label>
                        <ep-input
                          v-model="taitotaso.asteikko"
                          :is-editing="isEditing"
                        />
                      </div>
                      <div class="col-md-1">
                        <div>&nbsp;</div>
                        <ep-button
                          class="link-style pt-1 mt-2"
                          variant="link"
                          icon="delete"
                          size="sm"
                          no-padding
                          @click="poistaTaitotaso(taso.key, index)"
                        />
                      </div>
                    </div>
                    <div class="mb-2">
                      <ep-content
                        v-model="taitotaso.kuvaus"
                        layout="none"
                        :is-editable="isEditing"
                        :class="{ 'no-pointer-events': dragging }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </VueDraggable>
            <ep-button
              variant="outline"
              icon="add"
              no-padding
              @click="lisaaTaitotaso(taso.key)"
            >
              {{ $t('lisaa-taitotaso') }}
            </ep-button>
          </div>
        </template>
      </template>

      <template v-if="!isEditing">
        <template v-if="hasTaitotasoja">
          <h3 class="mt-4 mb-3">
            {{ $t('taitotasokuvaukset') }}
          </h3>
          <hr class="my-4">
        </template>

        <template
          v-for="taso in tasot"
          :key="taso.key"
        >
          <EpCollapse
            v-if="data[taso.key] && data[taso.key].taitotasot && data[taso.key].taitotasot.length > 0"
            class="mb-4"
            :use-padding="false"
          >
            <template #header>
              <h4>{{ taso.label }}</h4>
            </template>
            <template #default>
              <div
                v-for="(taitotaso, index) in data[taso.key].taitotasot"
                :key="taso.key + '-view-' + index"
                class="mb-3"
              >
                <h5 class="mb-1">
                  {{ $t('taso') }} {{ taitotaso.taitotaso ? $kaanna(taitotaso.taitotaso.nimi) : '' }}
                  <span v-if="taitotaso.asteikko"> / {{ $kaanna(taitotaso.asteikko) }} ({{ $t('evkn-asteikko') }})</span>
                </h5>
                <ep-content
                  v-if="taitotaso.kuvaus"
                  v-model="taitotaso.kuvaus"
                  :is-editable="false"
                />
              </div>
            </template>
          </EpCollapse>
        </template>
      </template>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { KaantajaTodistusmalliStore } from '@/stores/KaantajaTodistusmalliStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import * as _ from 'lodash';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { VueDraggable } from 'vue-draggable-plus';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpKoodistoSelectDraggable from '@shared/components/EpKoodistoSelect/EpKoodistoSelectDraggable.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { $t } from '@shared/utils/globals';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
  kaantajatodistusmalliId: {
    type: Number,
    required: true,
  },
});

const route = useRoute();
const editointiStore = ref<EditointiStore | null>(null);
const dragging = ref(false);

const perusteId = computed(() => props.perusteStore.perusteId.value);
const versionumero = computed(() => _.toNumber(route.query.versionumero));

const fetch = async () => {
  const store = new KaantajaTodistusmalliStore(perusteId.value!, Number(props.kaantajatodistusmalliId), versionumero.value);
  editointiStore.value = new EditointiStore(store);
};

const lisaaTaitotaso = (taso: 'ylintaso' | 'keskitaso' | 'perustaso') => {
  if (editointiStore.value?.data?.[taso]) {
    if (!editointiStore.value.data[taso].taitotasot) {
      editointiStore.value.data[taso].taitotasot = [];
    }
    editointiStore.value.data[taso].taitotasot.push({
      taitotaso: {},
      asteikko: {},
      kuvaus: {},
    });
  }
};

const poistaTaitotaso = (taso: 'ylintaso' | 'keskitaso' | 'perustaso', index: number) => {
  if (editointiStore.value?.data?.[taso]?.taitotasot) {
    editointiStore.value.data[taso].taitotasot.splice(index, 1);
  }
};

const arvosanaKoodisto = new KoodistoSelectStore({
  koodisto: 'ykiarvosana',
  async query(query: string, sivu = 0, koodisto: string) {
    const { data } = (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    }));
    return data as any;
  },
});

const draggingOptions = computed(() => ({
  ...DEFAULT_DRAGGABLE_PROPERTIES,
}));

const tasot = [
  {key: 'ylintaso', label: $t('ylin-taso')},
  {key: 'keskitaso', label: $t('keskitaso')},
  {key: 'perustaso', label: $t('perustaso')},
];

const hasTaitotasoja = computed(() => {
  return tasot.some(taso =>
    editointiStore.value?.data?.[taso.key]?.taitotasot?.length > 0,
  );
});

watch(() => props.kaantajatodistusmalliId, async (id, oldId) => {
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

.taso-section {
  border: 1px solid $gray-lighten-3;
  padding: 15px;
}

.no-pointer-events {
  pointer-events: none;
}
</style>

