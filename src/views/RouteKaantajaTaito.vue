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
        {{ $t('nimeton-taito') }}
      </h2>
    </template>
    <template #default="{ data, isEditing }">
      <div
        v-if="isEditing"
        class="mb-4 w-80"
      >
        <b-form-group
          class="p-0"
          :label="$t('taidon-nimi') + ' *'"
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

      <hr>

      <h3
        v-if="isEditing"
        class="mt-4 mb-3 w-80"
      >
        {{ $t('tutkintovaatimukset-ja-arviointikriteerit') }}
      </h3>

      <b-form-group
        v-if="isEditing"
        class="w-80 p-0 mb-3"
        :label="$t('valiotsikko')"
      >
        <ep-input
          v-model="data.valiotsikko"
          :is-editing="isEditing"
        />
      </b-form-group>

      <VueDraggable
        v-bind="draggingOptions"
        v-model="data.kohdealueet"
        tag="div"
        @start="dragging = true"
        @end="dragging = false"
      >
        <div
          v-for="(kohdealue, index) in data.kohdealueet"
          :key="'kohdealue' + index"
          class="mb-4 w-80"
          :class="{ 'kohdealue-editing': isEditing, 'dragging': dragging }"
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
                    {{ $t('kohdealueen-otsikko') }}
                  </div>
                  <ep-input
                    v-if="isEditing"
                    v-model="kohdealue.kohdealueOtsikko"
                    :is-editing="isEditing"
                  />
                  <span v-else>
                    {{ $kaanna(kohdealue.kohdealueOtsikko) || $t('nimeton-kohdealue') }}
                  </span>
                </h4>
              </div>

              <div class="mb-3">
                <h5>{{ $t('tutkintovaatimukset') }}</h5>
                <div
                  v-if="data.valiotsikko && kohdealue.tutkintovaatimukset && kohdealue.tutkintovaatimukset.length > 0"
                  class="mb-2"
                >
                  {{ $kaanna(data.valiotsikko) }}
                </div>
                <VueDraggable
                  v-if="isEditing"
                  v-bind="draggingOptions"
                  v-model="kohdealue.tutkintovaatimukset"
                  tag="div"
                  @start="dragging = true"
                  @end="dragging = false"
                >
                  <div
                    v-for="(vaatimus, vIndex) in kohdealue.tutkintovaatimukset"
                    :key="'vaatimus' + vIndex"
                    class="mb-2 w-100"
                  >
                    <ep-jarjesta-input
                      v-model="kohdealue.tutkintovaatimukset[vIndex]"
                      :is-editing="isEditing"
                      @delete="poistaTutkintovaatimus(index, vIndex)"
                    />
                  </div>
                </VueDraggable>
                <div
                  v-else
                >
                  <ul>
                    <li
                      v-for="(vaatimus, vIndex) in kohdealue.tutkintovaatimukset"
                      :key="'vaatimus' + vIndex"
                    >
                      {{ $kaanna(vaatimus) }}
                    </li>
                  </ul>
                </div>
                <ep-button
                  v-if="isEditing"
                  variant="outline"
                  icon="add"
                  class="mt-2"
                  no-padding
                  @click="lisaaTutkintovaatimus(index)"
                >
                  {{ $t('lisaa-tutkintovaatimus') }}
                </ep-button>
              </div>

              <div>
                <h5>{{ $t('arviointikriteerit') }}</h5>
                <div
                  v-if="data.valiotsikko && kohdealue.arviointikriteerit && kohdealue.arviointikriteerit.length > 0"
                  class="mb-2"
                >
                  {{ $kaanna(data.valiotsikko) }}
                </div>
                <VueDraggable
                  v-if="isEditing"
                  v-bind="draggingOptions"
                  v-model="kohdealue.arviointikriteerit"
                  tag="div"
                  @start="dragging = true"
                  @end="dragging = false"
                >
                  <div
                    v-for="(kriteeri, kIndex) in kohdealue.arviointikriteerit"
                    :key="'kriteeri' + kIndex"
                    class="mb-2"
                  >
                    <ep-jarjesta-input
                      v-model="kohdealue.arviointikriteerit[kIndex]"
                      :is-editing="isEditing"
                      @delete="poistaArviointikriteeri(index, kIndex)"
                    />
                  </div>
                </VueDraggable>
                <div
                  v-else
                >
                  <ul>
                    <li
                      v-for="(kriteeri, kIndex) in kohdealue.arviointikriteerit"
                      :key="'kriteeri' + kIndex"
                    >
                      {{ $kaanna(kriteeri) }}
                    </li>
                  </ul>
                </div>

                <div class="d-flex justify-content-between">
                  <ep-button
                    v-if="isEditing"
                    variant="outline"
                    icon="add"
                    class="mt-2"
                    no-padding
                    @click="lisaaArviointikriteeri(index)"
                  >
                    {{ $t('lisaa-arviointikriteeri') }}
                  </ep-button>
                  <ep-button
                    v-if="isEditing"
                    variant="link"
                    icon="delete"
                    no-padding
                    class="mr-5"
                    @click="poistaKohdealue(index)"
                  >
                    {{ $t('poista-kohdealue') }}
                  </ep-button>
                </div>
              </div>
            </div>
          </div>

          <hr v-if="!isEditing && index < data.kohdealueet.length - 1">
        </div>
      </VueDraggable>

      <ep-button
        v-if="isEditing"
        variant="outline"
        icon="add"
        class="mt-3"
        @click="lisaaKohdealue()"
      >
        {{ $t('lisaa-kohdealue') }}
      </ep-button>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { KielikaantajanTaitoStore } from '@/stores/KielikaantajanTaitoStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import * as _ from 'lodash';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpJarjestaInput from '@shared/components/forms/EpJarjestaInput.vue';
import { VueDraggable } from 'vue-draggable-plus';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
  kaantajataitoId: {
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
  const store = new KielikaantajanTaitoStore(perusteId.value!, Number(props.kaantajataitoId), versionumero.value);
  editointiStore.value = new EditointiStore(store);
};

const lisaaKohdealue = () => {
  if (editointiStore.value?.data) {
    if (!editointiStore.value.data.kohdealueet) {
      editointiStore.value.data.kohdealueet = [];
    }
    editointiStore.value.data.kohdealueet.push({
      kohdealueOtsikko: {},
      tutkintovaatimukset: [],
      arviointikriteerit: [],
    });
  }
};

const poistaKohdealue = (index: number) => {
  if (editointiStore.value?.data?.kohdealueet) {
    editointiStore.value.data.kohdealueet.splice(index, 1);
  }
};

const lisaaTutkintovaatimus = (kohdealueIndex: number) => {
  if (editointiStore.value?.data?.kohdealueet?.[kohdealueIndex]) {
    if (!editointiStore.value.data.kohdealueet[kohdealueIndex].tutkintovaatimukset) {
      editointiStore.value.data.kohdealueet[kohdealueIndex].tutkintovaatimukset = [];
    }
    editointiStore.value.data.kohdealueet[kohdealueIndex].tutkintovaatimukset!.push({});
  }
};

const poistaTutkintovaatimus = (kohdealueIndex: number, vaatimusIndex: number) => {
  if (editointiStore.value?.data?.kohdealueet?.[kohdealueIndex]?.tutkintovaatimukset) {
    editointiStore.value.data.kohdealueet[kohdealueIndex].tutkintovaatimukset!.splice(vaatimusIndex, 1);
  }
};

const lisaaArviointikriteeri = (kohdealueIndex: number) => {
  if (editointiStore.value?.data?.kohdealueet?.[kohdealueIndex]) {
    if (!editointiStore.value.data.kohdealueet[kohdealueIndex].arviointikriteerit) {
      editointiStore.value.data.kohdealueet[kohdealueIndex].arviointikriteerit = [];
    }
    editointiStore.value.data.kohdealueet[kohdealueIndex].arviointikriteerit!.push({});
  }
};

const poistaArviointikriteeri = (kohdealueIndex: number, kriteerIndex: number) => {
  if (editointiStore.value?.data?.kohdealueet?.[kohdealueIndex]?.arviointikriteerit) {
    editointiStore.value.data.kohdealueet[kohdealueIndex].arviointikriteerit!.splice(kriteerIndex, 1);
  }
};

const draggingOptions = computed(() => ({
  ...DEFAULT_DRAGGABLE_PROPERTIES,
}));

watch(() => props.kaantajataitoId, async (id, oldId) => {
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

.kohdealue-editing {
  border: 1px solid $gray-lighten-2;
  padding: 10px;

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

