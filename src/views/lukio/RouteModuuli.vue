<template>
  <EpEditointi :store="store">
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
        {{ $t('nimeton-moduuli') }}
      </h2>
    </template>

    <template #default="{ data, isEditing }">
      <div class="flex flex-wrap gap-2">
        <div
          v-if="isEditing"
          class="flex-[8] min-w-0 mb-3"
        >
          <EpFormGroup :label="$t('moduulin-nimi')">
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

        <EpFormGroup :class="[isEditing ? 'w-full' : 'w-1/4', 'mb-2']">
          <template #label>
            <div class="flex">
              <div>{{ $t('tyyppi') }}</div>
              <EpInfoPopover
                v-if="isEditing"
                class="ml-2"
              >
                {{ $t('ohje-moduuli-pakollinen') }}
              </EpInfoPopover>
            </div>
          </template>
          <template v-if="isEditing">
            <EpRadio
              v-model="data.pakollinen"
              :value="true"
              :label="$t('pakollinen')"
              name="moduulipakollinen"
            />
            <EpRadio
              v-model="data.pakollinen"
              :value="false"
              :label="$t('valinnainen')"
              name="moduulipakollinen"
            />
          </template>
          <div v-else-if="data.pakollinen">
            {{ $t('pakollinen') }}
          </div>
          <div v-else-if="!data.pakollinen">
            {{ $t('valinnainen') }}
          </div>
        </EpFormGroup>

        <div class="w-1/6 mb-3">
          <EpFormGroup>
            <template #label>
              {{ $t('laajuus') }}
            </template>
            <div class="flex items-center">
              <ep-input
                v-model="data.laajuus"
                type="number"
                :is-editing="isEditing"
              />
              <div class="ml-2">
                {{ $t('opintopiste') }}
              </div>
            </div>
          </EpFormGroup>
        </div>
      <!-- </div> -->

      <EpFormGroup>
        <template
          v-if="isEditing"
          #label
        >
          {{ $t('moduulin-kuvaus') }}
        </template>
        <ep-content
          v-model="data.kuvaus"
          layout="normal"
          :is-editable="isEditing"
        />
      </EpFormGroup>

      <hr>

      <EpCollapse
        class="mt-4"
        :collapsable="!isEditing"
        :use-padding="false"
      >
        <template #header>
          <h4>{{ $t('yleiset-tavoitteet') }}</h4>
        </template>

        <template v-if="isEditing">
          <div class="flex flex-wrap gap-4">
            <div class="flex-[11] min-w-0">
              <div class="mb-2 font-semibold">
                {{ $t('kohde') }}
              </div>
              <ep-input
                v-model="data.tavoitteet.kohde"
                :is-editing="true"
              />
            </div>
          </div>

          <div class="mb-2 mt-3 font-semibold">
            {{ $t('tavoitteet') }}
          </div>
          <VueDraggable
            v-bind="tavoitteetDragOptions"
            v-model="data.tavoitteet.tavoitteet"
            tag="div"
          >
            <div
              v-for="(tavoite, tavoiteindex) in data.tavoitteet.tavoitteet"
              :key="'tavoitteet' +tavoiteindex"
              class="flex mb-2"
            >
              <!-- <div class="flex-[11] min-w-0"> -->
                <EpInput
                  v-model="data.tavoitteet.tavoitteet[tavoiteindex]"
                  :is-editing="true"
                  class="input-wrapper"
                >
                  <template #left>
                    <div class="order-handle m-1">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                  </template>
                </EpInput>
              <!-- </div> -->
              <!-- <div class="flex-1 min-w-0"> -->
                <div
                  class="default-icon clickable mt-1 ml-2"
                  @click="poistaTavoite(tavoite)"
                >
                  <EpMaterialIcon icon-shape="outlined">
                    delete
                  </EpMaterialIcon>
                </div>
              <!-- </div> -->
            </div>
          </VueDraggable>

          <EpButton
            class="mt-2"
            variant="outline"
            icon="add"
            @click="lisaaTavoite()"
          >
            {{ $t('lisaa-tavoite') }}
          </EpButton>
        </template>

        <template v-else>
          <div class="font-semibold">
            {{ $kaanna(data.tavoitteet.kohde) }}
          </div>
          <ul>
            <li
              v-for="tavoite in data.tavoitteet.tavoitteet"
              :key="'tavoite'+tavoite._id"
            >
              {{ $kaanna(tavoite) }}
            </li>
          </ul>
        </template>
      </EpCollapse>

      <EpCollapse
        class="mt-4"
        :collapsable="!isEditing"
        :use-padding="false"
        :border-bottom="false"
      >
        <template #header>
          <h4>{{ $t('keskeiset-sisallot') }}</h4>
        </template>

        <div v-if="isEditing">
          <VueDraggable
            v-bind="keskeisetSisallotDragOptions"
            v-model="data.sisallot"
            tag="div"
          >
            <div
              v-for="(sisaltoalue, sisaltoIndex) in data.sisallot"
              :key="'sisalto'+sisaltoIndex"
              class="mt-4 p-2 tavoitealue editing"
            >
              <div class="flex">
                <div class="order-handle m-2">
                  <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                </div>
                <div class="mt-2 w-full">
                  <div class="flex flex-wrap gap-4">
                    <div class="flex-[11] min-w-0">
                      <div class="mb-2 font-semibold">
                        {{ $t('kohde') }}
                      </div>
                      <ep-input
                        v-model="sisaltoalue.kohde"
                        :is-editing="true"
                      />
                    </div>
                  </div>

                  <div class="mt-3 mb-2 font-semibold">
                    {{ $t('sisallot') }}
                  </div>
                  <EpTavoitealueTavoitteet v-model="sisaltoalue.sisallot">
                    <template #default="{tavoiteIndex}">
                      <EpInput
                        v-model="sisaltoalue.sisallot[tavoiteIndex]"
                        :is-editing="true"
                        class="input-wrapper"
                      >
                        <template #left>
                          <div class="order-handle m-1">
                            <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                          </div>
                        </template>
                      </EpInput>
                    </template>
                    <template #lisaaBtnText>
                      {{ $t('lisaa-sisalto') }}
                    </template>
                    <template #footer>
                      <EpButton
                        icon="delete"
                        class="mr-1"
                        variant="link"
                        @click="poistaSisaltoalue(sisaltoalue)"
                      >
                        {{ $t('poista-sisaltoalue') }}
                      </EpButton>
                    </template>
                  </EpTavoitealueTavoitteet>
                </div>
              </div>
            </div>
          </VueDraggable>

          <EpButton
            class="mt-2"
            variant="outline"
            icon="add"
            @click="lisaaSisaltoalue()"
          >
            {{ $t('lisaa-sisaltoalue') }}
          </EpButton>
        </div>

        <div v-if="!isEditing">
          <div
            v-for="(sisalto, sisaltoIndex) in data.sisallot"
            :key="'sisalto'+sisaltoIndex"
            class="tavoitealue"
          >
            <div class="font-semibold">
              {{ $kaanna(sisalto.kohde) }}
            </div>
            <ul>
              <li
                v-for="tavoite in sisalto.sisallot"
                :key="'sisalto'+tavoite._id"
              >
                {{ $kaanna(tavoite) }}
              </li>
            </ul>
          </div>
        </div>
      </EpCollapse>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpInputGroup from '@shared/components/EpInputGroup/EpInputGroup.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { VueDraggable } from 'vue-draggable-plus';
import { KoodistoSelectStore, getKoodistoSivutettuna } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { LukioModuuliStore } from '@/stores/LukioModuuliStore';
import EpTavoitealueTavoitteet from '@shared/components/EpTavoitesisaltoalue/EpTavoitealueTavoitteet.vue';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $kaanna } from '@shared/utils/globals';
import EpRadio from '@shared/components/forms/EpRadio.vue';

const props = defineProps<{
  perusteStore: PerusteStore;
  oppiaineId?: number;
  moduuliId?: number;
  pakollinen?: boolean;
}>();

const store = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const koodisto = new KoodistoSelectStore({
  koodisto: 'moduulikoodistolops2021',
  async query(query: string, sivu = 0, koodisto: string) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const storeData = computed({
  get: () => store.value?.data,
  set: (data) => store.value?.setData(data),
});

const isEditing = computed(() => {
  return store.value?.isEditing;
});

const tavoitteetDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !isEditing.value,
    group: {
      name: 'tavoitteet',
    },
  };
});

const keskeisetSisallotDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !isEditing.value,
    group: {
      name: 'keskeisetSisallot',
    },
  };
});

// Methods
function poistaSisaltoalue(poistettavaSisaltoalue) {
  store.value?.setData({
    ...store.value.data,
    sisallot: _.without(store.value.data.sisallot, poistettavaSisaltoalue),
  });
}

function lisaaSisaltoalue() {
  store.value?.setData({
    ...store.value.data,
    sisallot: [
      ...store.value.data.sisallot,
      {
        sisallot: [],
      },
    ],
  });
}

function poistaTavoite(poistettavaTavoite) {
  store.value?.setData({
    ...store.value.data,
    tavoitteet: {
      ...store.value.data.tavoitteet,
      tavoitteet: _.filter(store.value.data.tavoitteet.tavoitteet, tavoite => tavoite !== poistettavaTavoite),
    },
  });
}

function lisaaTavoite() {
  store.value?.setData({
    ...store.value.data,
    tavoitteet: {
      ...store.value.data.tavoitteet,
      tavoitteet: [
        ...store.value.data.tavoitteet.tavoitteet,
        [],
      ],
    },
  });
}

async function initStore() {
  const storeInstance = new LukioModuuliStore(
    perusteId.value!,
    props.oppiaineId!,
    props.moduuliId!,
    props.pakollinen!,
    props.perusteStore,
  );
  store.value = new EditointiStore(storeInstance);
}

// Watchers
watch(() => props.moduuliId, async () => {
  await initStore();
}, { immediate: true });

// Lifecycle hooks
onMounted(async () => {
  if (!store.value) {
    await initStore();
  }
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

  .tavoitealue {
    &.editing {
      border: 1px solid $gray-lighten-8;
      border-radius: 3px;
    }
  }

</style>
