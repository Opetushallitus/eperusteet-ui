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
        {{ $t('nimeton-aihealue') }}
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
          {{ $t('aihealueet-tai-kielenkayttotarkoitukset') }}
        </h3>

        <VueDraggable
          v-bind="draggingOptions"
          v-model="data.kategoriat"
          tag="div"
          @start="dragging = true"
          @end="dragging = false"
        >
          <div
            v-for="(kategoria, kategoriaIndex) in data.kategoriat"
            :key="'kategoria' + kategoriaIndex"
            class="mb-4 w-80"
            :class="{ 'kategoria-editing': isEditing, 'dragging': dragging }"
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
                  <h5>{{ $t('kategorian-otsikko') }}</h5>
                  <ep-input
                    v-model="kategoria.nimi"
                    :is-editing="isEditing"
                  />
                </div>

                <div class="mb-3">
                  <h5>{{ $t('kuvaus') }}</h5>
                  <ep-content
                    v-model="kategoria.kuvaus"
                    layout="normal"
                    :is-editable="isEditing"
                  />
                </div>

                <div class="mb-3">
                  <h5>{{ $t('perustaso') }}</h5>
                  <ep-content
                    v-model="kategoria.perustaso"
                    layout="normal"
                    :is-editable="isEditing"
                  />
                </div>

                <div class="mb-3">
                  <h5>{{ $t('keskitaso') }}</h5>
                  <ep-content
                    v-model="kategoria.keskitaso"
                    layout="normal"
                    :is-editable="isEditing"
                  />
                </div>

                <div class="mb-3">
                  <h5>{{ $t('ylin-taso') }}</h5>
                  <ep-content
                    v-model="kategoria.ylintaso"
                    layout="normal"
                    :is-editable="isEditing"
                  />
                </div>

                <div class="d-flex justify-content-end">
                  <ep-button
                    variant="link"
                    icon="delete"
                    no-padding
                    class="mr-5"
                    @click="poistaKategoria(kategoriaIndex)"
                  >
                    {{ $t('poista-kategoria') }}
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
          @click="lisaaKategoria()"
        >
          {{ $t('lisaa-kategoria') }}
        </ep-button>
      </template>

      <template v-if="!isEditing">
        <EpCollapse
          v-for="(kategoria, kategoriaIndex) in data.kategoriat"
          :key="'kategoria' + kategoriaIndex"
          class="mb-4"
        >
          <template #header>
            <h4>{{ $kaanna(kategoria.nimi) || $t('nimeton-kategoria') }}</h4>
          </template>

          <template #default>
            <div
              v-if="kategoria.kuvaus"
              class="mb-3"
            >
              <ep-content
                v-model="kategoria.kuvaus"
                :is-editable="false"
              />
            </div>

            <div
              v-if="kategoria.perustaso"
              class="mb-3"
            >
              <h5>{{ $t('perustaso') }}</h5>
              <ep-content
                v-model="kategoria.perustaso"
                :is-editable="false"
              />
            </div>

            <div
              v-if="kategoria.keskitaso"
              class="mb-3"
            >
              <h5>{{ $t('keskitaso') }}</h5>
              <ep-content
                v-model="kategoria.keskitaso"
                :is-editable="false"
              />
            </div>

            <div
              v-if="kategoria.ylintaso"
              class="mb-3"
            >
              <h5>{{ $t('ylin-taso') }}</h5>
              <ep-content
                v-model="kategoria.ylintaso"
                :is-editable="false"
              />
            </div>
          </template>
        </EpCollapse>
      </template>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { KaantajaAihealueStore } from '@/stores/KaantajaAihealueStore';
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
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
  kaantajaaihealueId: {
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
  const store = new KaantajaAihealueStore(perusteId.value!, Number(props.kaantajaaihealueId), versionumero.value);
  editointiStore.value = new EditointiStore(store);
};

const lisaaKategoria = () => {
  if (editointiStore.value?.data) {
    if (!editointiStore.value.data.kategoriat) {
      editointiStore.value.data.kategoriat = [];
    }
    editointiStore.value.data.kategoriat.push({
      nimi: {},
      kuvaus: {},
      perustaso: {},
      keskitaso: {},
      ylintaso: {},
    });
  }
};

const poistaKategoria = (index: number) => {
  if (editointiStore.value?.data?.kategoriat) {
    editointiStore.value.data.kategoriat.splice(index, 1);
  }
};

const draggingOptions = computed(() => ({
  ...DEFAULT_DRAGGABLE_PROPERTIES,
}));

watch(() => props.kaantajaaihealueId, async (id, oldId) => {
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

.kategoria-editing {
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
</style>

