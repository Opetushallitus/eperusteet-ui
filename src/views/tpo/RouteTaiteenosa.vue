<template>
  <EpEditointi
    v-if="store"
    :store="store"
    :versionumero="versionumero"
  >
    <template #header="{ data }">
      <h2 v-if="data.nimi">
        {{ $kaanna(data.nimi) }}
      </h2>
      <h2
        v-else
        class="font-italic"
      >
        {{ $t('nimeton') }}
      </h2>
    </template>

    <template #default="{ data, isEditing }">
      <div class="flex flex-wrap gap-4">
        <div
          v-if="isEditing"
          class="flex-[8] min-w-0"
        >
          <EpFormGroup
            :label="$t('taiteenosan-nimi')"
            required
          >
            <ep-input
              v-model="data.nimi"
              :is-editing="isEditing"
            />
          </EpFormGroup>
        </div>

        <div
          v-if="isEditing || data.laajuus"
          class="flex-[3] min-w-0"
        >
          <EpFormGroup :label="$t('laajuus')">
            <div class="flex items-center">
              <ep-input
                v-model="data.laajuus"
                type="number"
                :is-editing="isEditing"
              />
              <div class="ml-2">
                {{ $t('opintopiste-partitiivi') }}
              </div>
            </div>
          </EpFormGroup>
        </div>
      </div>

      <div>
        <h4
          v-if="isEditing"
          class="mt-4"
        >
          {{ $t('kuvaus') }}
        </h4>
        <ep-content
          v-model="data.kuvaus"
          layout="normal"
          :is-editable="isEditing"
          :kasite-handler="kasiteHandler"
        />

        <hr class="mt-5">

        <h3 class="mb-4">
          {{ $t('tavoitteet') }}
        </h3>
        <template v-if="isEditing">
          <VueDraggable
            v-bind="tavoitteetOptions"
            v-model="data.tavoitteet"
            tag="div"
          >
            <div
              v-for="(tavoite, index) in data.tavoitteet"
              :key="'tavoite' + index"
              class="flex items-center gap-2 pb-2"
            >
              <div class="min-w-0 flex-1">
                <EpInput
                  v-model="data.tavoitteet[index]"
                  :is-editing="isEditing"
                >
                  <template #left>
                    <div class="order-handle m-1">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                  </template>
                </EpInput>
              </div>
              <div
                class="default-icon clickable"
                @click="poistaTavoite(data, tavoite)"
              >
                <EpMaterialIcon icon-shape="outlined">
                  delete
                </EpMaterialIcon>
              </div>
            </div>
          </VueDraggable>
          <EpButton
            variant="outline"
            icon="add"
            @click="lisaaTavoite(data)"
          >
            {{ $t('lisaa-tavoite') }}
          </EpButton>
        </template>
        <template v-else-if="data.tavoitteet && data.tavoitteet.length > 0">
          <ul>
            <li
              v-for="(tavoite, index) in data.tavoitteet"
              :key="'tavoite' + index"
            >
              {{ $kaanna(tavoite) }}
            </li>
          </ul>
        </template>
        <p
          v-else
          class="font-italic"
        >
          {{ $t('ei-asetettu') }}
        </p>
      </div>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import * as _ from 'lodash';
import { VueDraggable } from 'vue-draggable-plus';
import { PerusteStore } from '@/stores/PerusteStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { TaiteenosaStore } from '@/stores/TaiteenosaStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';

const props = defineProps<{
  perusteStore: PerusteStore;
  taiteenalaId: number;
  taiteenosaId: number;
}>();

const route = useRoute();
const store = ref<EditointiStore | null>(null);
const kasiteHandler = inject('kasiteHandler');

const perusteId = computed(() => props.perusteStore.perusteId.value);

const versionumero = computed(() => {
  return route.query.versionumero ? _.toNumber(route.query.versionumero) : undefined;
});

const tavoitteetOptions = computed(() => ({
  ...DEFAULT_DRAGGABLE_PROPERTIES,
  disabled: !store.value?.isEditing,
  group: {
    name: 'taiteenosa-tavoitteet',
  },
}));

const fetch = async () => {
  const taiteenosaStore = new TaiteenosaStore(
    perusteId.value!,
    props.taiteenalaId,
    props.taiteenosaId,
    versionumero.value,
  );
  store.value = new EditointiStore(taiteenosaStore);
};

const lisaaTavoite = (data: any) => {
  store.value?.setData({
    ...data,
    tavoitteet: [...(data.tavoitteet || []), {}],
  });
};

const poistaTavoite = (data: any, tavoite: any) => {
  store.value?.setData({
    ...data,
    tavoitteet: _.filter(data.tavoitteet, rivi => rivi !== tavoite),
  });
};

watch(() => [props.taiteenalaId, props.taiteenosaId], fetch);
watch(versionumero, fetch);

onMounted(async () => {
  await fetch();
});
</script>
