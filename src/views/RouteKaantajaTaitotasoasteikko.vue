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
        {{ $t('nimeton-taitotasoasteikko') }}
      </h2>
    </template>
    <template #default="{ data, isEditing }">
      <div class="mb-4 w-80">
        <b-form-group>
          <template
            v-if="isEditing"
            #label
          >
            <div>{{ $t('otsikko') }}</div>
          </template>
          <ep-input
            v-model="data.nimi"
            :is-editing="isEditing"
          />
        </b-form-group>
      </div>

      <div class="mb-4 w-80">
        <b-form-group>
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
          {{ $t('nayta-kaantaja-taitotasoasteikko-liitteena') }}
        </ep-toggle>
      </div>

      <hr v-if="isEditing || data.kuvaus">

      <template v-if="isEditing">
        <h3 class="mt-4 mb-3">
          {{ $t('taitotasoasteikko') }}
        </h3>

        <VueDraggable
          v-bind="draggingOptions"
          v-model="data.taitotasoasteikkoKategoriat"
          tag="div"
          @start="dragging = true"
          @end="dragging = false"
        >
          <div
            v-for="(kategoria, kategoriaIndex) in data.taitotasoasteikkoKategoriat"
            :key="'kategoria' + kategoriaIndex"
            class="mb-4 w-80"
            :class="{ 'kategoria-editing': isEditing, 'dragging': dragging }"
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
                <div class="d-flex mb-3">
                  <h4 class="mb-0 w-100">
                    <div
                      v-if="isEditing"
                      class="mb-2"
                    >
                      {{ $t('kategorian-otsikko') }}
                    </div>
                    <ep-input
                      v-if="isEditing"
                      v-model="kategoria.otsikko"
                      :is-editing="isEditing"
                    />
                    <span v-else>
                      {{ $kaanna(kategoria.otsikko) || $t('nimeton-kategoria') }}
                    </span>
                  </h4>
                </div>

                <div class="mb-3">
                  <h5 v-if="kategoria.taitotasoasteikkoKategoriaTaitotasot && kategoria.taitotasoasteikkoKategoriaTaitotasot.length > 0">
                    {{ $t('taitotaso') }}
                  </h5>


                  <VueDraggable
                    v-bind="draggingOptions"
                    v-model="kategoria.taitotasoasteikkoKategoriaTaitotasot"
                    @start="dragging = true"
                    @end="dragging = false"
                  >
                    <div
                      v-for="(taitotaso, taitotasoIndex) in kategoria.taitotasoasteikkoKategoriaTaitotasot"
                      :key="'taitotaso' + taitotasoIndex"
                      class="mb-3 taitotaso-item"
                      :class="{ 'taitotaso-editing': isEditing }"
                    >
                      <div
                        v-if="isEditing"
                        class="d-flex"
                      >
                        <div class="w-100">
                          <ep-jarjesta-input
                            v-model="taitotaso.otsikko"
                            :is-editing="isEditing"
                            :placeholder="$t('taitotason-otsikko')"
                            @delete="poistaTaitotaso(kategoriaIndex, taitotasoIndex)"
                          />
                          <ep-content
                            v-model="taitotaso.kuvaus"
                            class="mt-2 taitotaso-kuvaus"
                            layout="none"
                            :is-editable="isEditing"
                            :placeholder="$t('taitotason-kuvaus')"
                          />
                        </div>
                      </div>
                      <div v-else>
                        <h6>{{ $kaanna(taitotaso.otsikko) }}</h6>
                        <ep-content
                          v-model="taitotaso.kuvaus"
                          :is-editable="false"
                        />
                      </div>
                    </div>
                  </VueDraggable>

                  <div class="d-flex justify-content-between">
                    <ep-button
                      v-if="isEditing"
                      variant="outline"
                      icon="add"
                      class="mt-2"
                      no-padding
                      @click="lisaaTaitotaso(kategoriaIndex)"
                    >
                      {{ $t('lisaa-taitotaso') }}
                    </ep-button>

                    <ep-button
                      v-if="isEditing"
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
          v-for="(kategoria, kategoriaIndex) in data.taitotasoasteikkoKategoriat"
          :key="'kategoria' + kategoriaIndex"
        >
          <template #header>
            <h4>{{ $kaanna(kategoria.otsikko) || $t('nimeton-kategoria') }}</h4>
          </template>

          <template #default>
            <div
              v-for="(taitotaso, taitotasoIndex) in kategoria.taitotasoasteikkoKategoriaTaitotasot"
              :key="'taitotaso' + taitotasoIndex"
            >
              <h5>{{ $kaanna(taitotaso.otsikko) || $t('nimeton-taitotaso') }}</h5>
              <ep-content
                v-model="taitotaso.kuvaus"
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
import { ref, computed, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { KaantajaTaitotasoasteikkoStore } from '@/stores/KaantajaTaitotasoasteikkoStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import * as _ from 'lodash';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpJarjestaInput from '@shared/components/forms/EpJarjestaInput.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { VueDraggable } from 'vue-draggable-plus';
import EpToggle from '@shared/components/forms/EpToggle.vue';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
  kaantajataitotasoasteikkoId: {
    type: Number,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const editointiStore = ref<EditointiStore | null>(null);
const kasiteHandler = inject('kasiteHandler');
const kuvaHandler = inject('kuvaHandler');
const dragging = ref(false);

const perusteId = computed(() => props.perusteStore.perusteId.value);
const versionumero = computed(() => _.toNumber(route.query.versionumero));

const fetch = async () => {
  const store = new KaantajaTaitotasoasteikkoStore(perusteId.value!, Number(props.kaantajataitotasoasteikkoId), versionumero.value);
  editointiStore.value = new EditointiStore(store);
};

const lisaaKategoria = () => {
  if (editointiStore.value?.data) {
    if (!editointiStore.value.data.taitotasoasteikkoKategoriat) {
      editointiStore.value.data.taitotasoasteikkoKategoriat = [];
    }
    editointiStore.value.data.taitotasoasteikkoKategoriat.push({
      otsikko: {},
      taitotasoasteikkoKategoriaTaitotasot: [],
    });
  }
};

const poistaKategoria = (index: number) => {
  if (editointiStore.value?.data?.taitotasoasteikkoKategoriat) {
    editointiStore.value.data.taitotasoasteikkoKategoriat.splice(index, 1);
  }
};

const lisaaTaitotaso = (kategoriaIndex: number) => {
  if (editointiStore.value?.data?.taitotasoasteikkoKategoriat?.[kategoriaIndex]) {
    if (!editointiStore.value.data.taitotasoasteikkoKategoriat[kategoriaIndex].taitotasoasteikkoKategoriaTaitotasot) {
      editointiStore.value.data.taitotasoasteikkoKategoriat[kategoriaIndex].taitotasoasteikkoKategoriaTaitotasot = [];
    }
    editointiStore.value.data.taitotasoasteikkoKategoriat[kategoriaIndex].taitotasoasteikkoKategoriaTaitotasot!.push({
      otsikko: {},
      kuvaus: {},
    });
  }
};

const poistaTaitotaso = (kategoriaIndex: number, taitotasoIndex: number) => {
  if (editointiStore.value?.data?.taitotasoasteikkoKategoriat?.[kategoriaIndex]?.taitotasoasteikkoKategoriaTaitotasot) {
    editointiStore.value.data.taitotasoasteikkoKategoriat[kategoriaIndex].taitotasoasteikkoKategoriaTaitotasot!.splice(taitotasoIndex, 1);
  }
};

const draggingOptions = computed(() => ({
  ...DEFAULT_DRAGGABLE_PROPERTIES,
}));

watch(() => props.kaantajataitotasoasteikkoId, async (id, oldId) => {
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

  .taitotaso-kuvaus {
    margin-right: 54px;
  }
}
</style>

