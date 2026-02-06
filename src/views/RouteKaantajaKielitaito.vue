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
        {{ $t('nimeton-kielitaito') }}
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

        <ep-toggle
          v-if="isEditing"
          v-model="data.liite"
          class="mt-4"
        >
          {{ $t('nayta-liitteena') }}
        </ep-toggle>
      </div>

      <template v-if="isEditing">
        <h3 class="mt-4 mb-3">
          {{ $t('taitotasoasteikko') }}
        </h3>

        <VueDraggable
          v-bind="draggingOptions"
          v-model="data.taitotasot"
          tag="div"
          @start="dragging = true"
          @end="dragging = false"
        >
          <div
            v-for="(taitotaso, taitotasoIndex) in data.taitotasot"
            :key="'taitotaso' + taitotasoIndex"
            class="mb-4 w-80"
            :class="{ 'taitotaso-editing': isEditing, 'dragging': dragging }"
          >
            <div class="d-flex">
              <ep-material-icon
                v-if="isEditing"
                class="order-handle mr-2 flex-shrink-0"
                size="18px"
              >
                drag_indicator
              </ep-material-icon>
              <div class="w-100">
                <div class="mb-3">
                  <h5>{{ $t('taitotaso') }}</h5>
                  <div class="d-flex align-items-start">
                    <ep-koodisto-select-draggable
                      v-model="taitotaso.taitotaso"
                      :store="arvosanaKoodisto"
                      :is-editing="isEditing"
                      :nayta-arvo="false"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <h5>{{ $t('kuvaus') }}</h5>
                  <ep-content
                    v-model="taitotaso.kuvaus"
                    layout="normal"
                    :is-editable="isEditing"
                    :class="{ 'no-pointer-events': dragging }"
                  />
                </div>

                <div class="d-flex justify-content-end">
                  <ep-button
                    v-if="isEditing"
                    variant="link"
                    icon="delete"
                    no-padding
                    class="mr-5"
                    @click="poistaTaitotaso(taitotasoIndex)"
                  >
                    {{ $t('poista-taitotaso') }}
                  </ep-button>
                </div>
              </div>
            </div>
          </div>
        </VueDraggable>

        <ep-button
          variant="outline"
          icon="add"
          class="mt-3"
          @click="lisaaTaitotaso()"
        >
          {{ $t('lisaa-taitotaso') }}
        </ep-button>
      </template>

      <template v-if="!isEditing">
        <div
          v-for="(taitotaso, taitotasoIndex) in data.taitotasot"
          :key="'taitotaso' + taitotasoIndex"
          class="mb-4"
        >
          <div class="mb-2">
            <h4>{{ $t('taso') }} {{ $kaanna(taitotaso.taitotaso.nimi) }}</h4>
          </div>
          <div v-if="taitotaso.kuvaus">
            <ep-content
              v-model="taitotaso.kuvaus"
              :is-editable="false"
            />
          </div>
        </div>
      </template>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { KaantajaKielitaitoStore } from '@/stores/KaantajaKielitaitoStore';
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
import EpKoodistoSelectDraggable from '@shared/components/EpKoodistoSelect/EpKoodistoSelectDraggable.vue';
import { KoodistoSelectStore, getKoodistoSivutettuna } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpToggle from '@shared/components/forms/EpToggle.vue';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
  kaantajakielitaitoId: {
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
  const store = new KaantajaKielitaitoStore(perusteId.value!, Number(props.kaantajakielitaitoId), versionumero.value);
  editointiStore.value = new EditointiStore(store);
};

const arvosanaKoodisto = new KoodistoSelectStore({
  koodisto: 'ykiarvosana',
  async query(query: string, sivu = 0, koodisto: string) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const lisaaTaitotaso = () => {
  if (editointiStore.value?.data) {
    if (!editointiStore.value.data.taitotasot) {
      editointiStore.value.data.taitotasot = [];
    }
    editointiStore.value.data.taitotasot.push({
      taitotaso: {},
      kuvaus: {},
    });
  }
};

const poistaTaitotaso = (index: number) => {
  if (editointiStore.value?.data?.taitotasot) {
    editointiStore.value.data.taitotasot.splice(index, 1);
  }
};

const draggingOptions = computed(() => ({
  ...DEFAULT_DRAGGABLE_PROPERTIES,
}));

watch(() => props.kaantajakielitaitoId, async (id, oldId) => {
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

.taitotaso-editing {
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

.no-pointer-events {
  pointer-events: none;
}
</style>

