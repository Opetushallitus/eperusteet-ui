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
        {{ $t('nimeton-taitotasokuvaus') }}
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

      <hr v-if="isEditing || data.kuvaus">

      <template v-if="isEditing">
        <h3 class="mt-4 mb-3">
          {{ $t('taitotasoasteikko') }}
        </h3>

        <VueDraggable
          v-bind="draggingOptions"
          v-model="data.tutkintotasot"
          tag="div"
          @start="dragging = true"
          @end="dragging = false"
        >
          <div
            v-for="(tutkintotaso, tutkintotasoIndex) in data.tutkintotasot"
            :key="'tutkintotaso' + tutkintotasoIndex"
            class="mb-4 w-80"
            :class="{ 'tutkintotaso-editing': isEditing, 'dragging': dragging }"
          >
            <div class="d-flex">
              <ep-material-icon
                v-if="isEditing"
                class="order-handle mr-2 flex-shrink-0"
              >
                drag_indicator
              </ep-material-icon>
              <div class="w-100">
                <div class="mb-3">
                  <h5>{{ $t('tutkintotaso') }}</h5>
                  <ep-input
                    v-model="tutkintotaso.nimi"
                    :is-editing="isEditing"
                  />

                  <hr v-if="tutkintotaso.osat.length > 0">
                </div>

                <div class="mb-3">
                  <VueDraggable
                    v-bind="draggingOptions"
                    v-model="tutkintotaso.osat"
                    tag="div"
                    @start="dragging = true"
                    @end="dragging = false"
                  >
                    <div
                      v-for="(osa, osaIndex) in tutkintotaso.osat"
                      :key="'osa' + osaIndex"
                      class="mb-3 pl-3"
                    >
                      <div class="w-100">
                        <hr v-if="osaIndex > 0">
                        <div class="mb-4">
                          <div class="d-flex align-items-center mb-2">
                            <ep-material-icon
                              class="order-handle mr-2 flex-shrink-0"
                            >
                              drag_indicator
                            </ep-material-icon>
                            <span>{{ $t('suorituksen-osa') }}</span>
                          </div>
                          <div class="d-flex align-items-start w-100">
                            <ep-koodisto-select
                              v-model="osa.suorituksenOsa"
                              class="w-100"
                              :store="suorituksenOsaKoodisto"
                              :is-editing="isEditing"
                              :nayta-arvo="false"
                            >
                              <template #default="{ open }">
                                <b-input-group>
                                  <b-form-input
                                    :value="osa.suorituksenOsa ? $kaanna(osa.suorituksenOsa.nimi) : ''"
                                    disabled
                                  />
                                  <b-input-group-append>
                                    <b-button
                                      variant="primary"
                                      @click="open"
                                    >
                                      {{ $t('hae-koodistosta') }}
                                    </b-button>
                                  </b-input-group-append>
                                </b-input-group>
                              </template>
                            </ep-koodisto-select>
                          </div>
                        </div>

                        <div class="mb-2">
                          <label v-if="osa.taitotasot.length > 0">{{ $t('taitotasot') }}</label>

                          <VueDraggable
                            v-bind="draggingOptions"
                            v-model="osa.taitotasot"
                            tag="div"
                            @start="dragging = true"
                            @end="dragging = false"
                          >
                            <div
                              v-for="(taitotaso, taitotasoIndex) in osa.taitotasot"
                              :key="'taitotaso' + taitotasoIndex"
                              class="mb-2"
                            >
                              <div class="d-flex">
                                <div class="w-100">
                                  <div class="d-flex align-items-start mb-2 align-items-center">
                                    <ep-koodisto-select-draggable
                                      v-model="taitotaso.taitotaso"
                                      :store="arvosanaKoodisto"
                                      :is-editing="isEditing"
                                      :nayta-arvo="false"
                                    />
                                    <ep-button
                                      variant="link"
                                      icon="delete"
                                      size="sm"
                                      no-padding
                                      class="ml-2 link-style"
                                      @click="poistaTaitotaso(tutkintotasoIndex, osaIndex, taitotasoIndex)"
                                    />
                                  </div>
                                  <ep-content
                                    v-model="taitotaso.kuvaus"
                                    layout="none"
                                    :is-editable="isEditing"
                                    :class="{ 'no-pointer-events': dragging }"
                                  />
                                </div>
                              </div>
                            </div>
                          </VueDraggable>

                          <div class="d-flex justify-content-between">
                            <ep-button
                              variant="outline"
                              icon="add"
                              no-padding
                              @click="lisaaTaitotaso(tutkintotasoIndex, osaIndex)"
                            >
                              {{ $t('lisaa-taitotaso') }}
                            </ep-button>
                            <ep-button
                              variant="link"
                              icon="delete"
                              no-padding
                              class="mr-3"
                              @click="poistaSuorituksenOsa(tutkintotasoIndex, osaIndex)"
                            >
                              {{ $t('poista-suorituksen-osa') }}
                            </ep-button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </VueDraggable>

                  <div class="d-flex justify-content-between">
                    <ep-button
                      variant="outline"
                      icon="add"
                      no-padding
                      @click="lisaaSuorituksenOsa(tutkintotasoIndex)"
                    >
                      {{ $t('lisaa-suorituksen-osa') }}
                    </ep-button>
                    <ep-button
                      variant="link"
                      icon="delete"
                      no-padding
                      class="mr-3"
                      @click="poistaTutkintotaso(tutkintotasoIndex)"
                    >
                      {{ $t('poista-tutkintotaso') }}
                    </ep-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </VueDraggable>

        <ep-button
          variant="outline"
          icon="add"
          class="mt-3"
          @click="lisaaTutkintotaso()"
        >
          {{ $t('lisaa-tutkintotaso') }}
        </ep-button>
      </template>

      <template v-if="!isEditing">
        <EpCollapse
          v-for="(tutkintotaso, tutkintotasoIndex) in data.tutkintotasot"
          :key="'tutkintotaso' + tutkintotasoIndex"
          class="mb-4"
        >
          <template #header>
            <h4>{{ $kaanna(tutkintotaso.nimi) || $t('nimeton-tutkintotaso') }}</h4>
          </template>

          <div
            v-for="(osa, osaIndex) in tutkintotaso.osat"
            :key="'osa' + osaIndex"
            class="mb-4"
          >
            <h5 class="mb-2">
              {{ $kaanna(osa.suorituksenOsa.nimi) }}
            </h5>

            <div
              v-for="(taitotaso, taitotasoIndex) in osa.taitotasot"
              :key="'taitotaso' + taitotasoIndex"
              class="mb-2"
            >
              <div class="mb-1">
                {{ $t('taso') }} {{ $kaanna(taitotaso.taitotaso.nimi) }}
              </div>
              <ep-content
                v-if="taitotaso.kuvaus"
                v-model="taitotaso.kuvaus"
                :is-editable="false"
              />
            </div>
          </div>
        </EpCollapse>
      </template>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { KaantajaTaitotasokuvausStore } from '@/stores/KaantajaTaitotasokuvausStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import * as _ from 'lodash';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { VueDraggable } from 'vue-draggable-plus';
import { KoodistoSelectStore, getKoodistoSivutettuna } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpKoodistoSelectDraggable from '@shared/components/EpKoodistoSelect/EpKoodistoSelectDraggable.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
  kaantajataitotasokuvausId: {
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
  const store = new KaantajaTaitotasokuvausStore(perusteId.value!, Number(props.kaantajataitotasokuvausId), versionumero.value);
  editointiStore.value = new EditointiStore(store);
};

const lisaaTutkintotaso = () => {
  if (editointiStore.value?.data) {
    if (!editointiStore.value.data.tutkintotasot) {
      editointiStore.value.data.tutkintotasot = [];
    }
    editointiStore.value.data.tutkintotasot.push({
      nimi: {},
      osat: [],
    });
  }
};

const poistaTutkintotaso = (index: number) => {
  if (editointiStore.value?.data?.tutkintotasot) {
    editointiStore.value.data.tutkintotasot.splice(index, 1);
  }
};

const lisaaSuorituksenOsa = (tutkintotasoIndex: number) => {
  if (editointiStore.value?.data?.tutkintotasot?.[tutkintotasoIndex]) {
    if (!editointiStore.value.data.tutkintotasot[tutkintotasoIndex].osat) {
      editointiStore.value.data.tutkintotasot[tutkintotasoIndex].osat = [];
    }
    editointiStore.value.data.tutkintotasot[tutkintotasoIndex].osat!.push({
      suorituksenOsa: {},
      taitotasot: [],
    });
  }
};

const poistaSuorituksenOsa = (tutkintotasoIndex: number, osaIndex: number) => {
  if (editointiStore.value?.data?.tutkintotasot?.[tutkintotasoIndex]?.osat) {
    editointiStore.value.data.tutkintotasot[tutkintotasoIndex].osat!.splice(osaIndex, 1);
  }
};

const lisaaTaitotaso = (tutkintotasoIndex: number, osaIndex: number) => {
  if (editointiStore.value?.data?.tutkintotasot?.[tutkintotasoIndex]?.osat?.[osaIndex]) {
    if (!editointiStore.value.data.tutkintotasot[tutkintotasoIndex].osat![osaIndex].taitotasot) {
      editointiStore.value.data.tutkintotasot[tutkintotasoIndex].osat![osaIndex].taitotasot = [];
    }
    editointiStore.value.data.tutkintotasot[tutkintotasoIndex].osat![osaIndex].taitotasot!.push({
      taitotaso: {},
      kuvaus: {},
    });
  }
};

const poistaTaitotaso = (tutkintotasoIndex: number, osaIndex: number, taitotasoIndex: number) => {
  if (editointiStore.value?.data?.tutkintotasot?.[tutkintotasoIndex]?.osat?.[osaIndex]?.taitotasot) {
    editointiStore.value.data.tutkintotasot[tutkintotasoIndex].osat![osaIndex].taitotasot!.splice(taitotasoIndex, 1);
  }
};

const arvosanaKoodisto = new KoodistoSelectStore({
  koodisto: 'ykiarvosana',
  async query(query: string, sivu = 0, koodisto: string) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const suorituksenOsaKoodisto = new KoodistoSelectStore({
  koodisto: 'ykisuorituksenosa',
  async query(query: string, sivu = 0, koodisto: string) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const draggingOptions = computed(() => ({
  ...DEFAULT_DRAGGABLE_PROPERTIES,
}));

watch(() => props.kaantajataitotasokuvausId, async (id, oldId) => {
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

.tutkintotaso-editing {
  border: 1px solid $gray-lighten-2;
  padding: 10px;
  border-radius: 4px;

  &.dragging {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    -webkit-touch-callout: none !important;
    -webkit-user-drag: none !important;
    -khtml-user-drag: none !important;
    -moz-user-drag: none !important;
    -ms-user-drag: none !important;
  }
}

:deep(.taitotaso-input) {
  max-width: 150px;
}

.no-pointer-events {
  pointer-events: none;
}
</style>

