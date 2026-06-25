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
    <template #default="{ data, isEditing, validation }">
      <div class="flex flex-wrap gap-4">
        <div class="md:w-2/3">
          <EpFormGroup
            :label="$t('opintokokonaisuuden-nimi')"
            required
          >
            <ep-koodisto-select
              v-model="data.nimiKoodi"
              :store="koodisto"
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

        <div class="md:w-1/6">
          <EpFormGroup
            :label="$t('minimilaajuus')"
            required
          >
            <ep-laajuus-input
              v-model="data.minimilaajuus"
              :is-editing="isEditing"
            >
              {{ $t('opintopiste') }}
            </ep-laajuus-input>
          </EpFormGroup>
        </div>
      </div>

      <div class="flex flex-wrap gap-4">
        <div class="md:w-2/3">
          <EpFormGroup
            :label="$t('kuvaus')"
            required
          >
            <ep-content
              v-model="data.kuvaus"
              layout="normal"
              :is-editable="isEditing"
              :validation="validation.kuvaus"
              :kasite-handler="kasiteHandler"
              :kuva-handler="kuvaHandler"
            />
          </EpFormGroup>
        </div>
      </div>

      <hr>

      <h3>{{ $t('opetuksen-tavoitteet') }}</h3>

      <div class="flex flex-wrap gap-4">
        <div class="md:w-2/3">
          <EpFormGroup
            :label="$t('tavoitteiden-otsikko')"
            required
          >
            <ep-input
              v-model="data.opetuksenTavoiteOtsikko"
              :is-editing="isEditing"
              :validation="validation.opetuksenTavoiteOtsikko"
            />
          </EpFormGroup>
        </div>
      </div>

      <EpFormGroup
        :label="$t('tavoitteet')"
        required
      >
        <div v-if="isEditing">
          <VueDraggable
            v-bind="tavoitteetOptions"
            v-model="data.opetuksenTavoitteet"
            tag="div"
          >
            <div
              v-for="(tavoite, index) in data.opetuksenTavoitteet"
              :key="'tavoite'+index"
              class="flex flex-wrap gap-4 pb-2"
            >
              <div class="flex-[10] min-w-0 lg:w-2/3">
                <ep-input
                  v-model="tavoite.nimi"
                  :is-editing="isEditing"
                  :disabled="!tavoite.uri.startsWith('temporary')"
                >
                  <template #left>
                    <div class="order-handle m-1">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                  </template>
                </ep-input>
              </div>
              <div
                v-if="isEditing"
                class="w-1/12"
              >
                <div
                  class="default-icon clickable mt-1"
                  @click="poista(tavoite, 'opetuksenTavoitteet')"
                >
                  <EpMaterialIcon icon-shape="outlined">
                    delete
                  </EpMaterialIcon>
                </div>
              </div>
            </div>
          </VueDraggable>

          <ep-button
            v-if="isEditing"
            variant="outline"
            icon="add"
            @click="lisaa('opetuksenTavoitteet', 'opintokokonaisuustavoitteet')"
          >
            {{ $t('lisaa-tavoite') }}
          </ep-button>
        </div>

        <div v-else>
          <ul>
            <li
              v-for="(tavoite, index) in data.opetuksenTavoitteet"
              :key="'tavoite'+index"
            >
              {{ $kaanna(tavoite.nimi) }}
            </li>
          </ul>
        </div>
      </EpFormGroup>

      <hr>

      <h3>{{ $t('arviointi') }}</h3>

      <EpFormGroup
        :label="$t('opiskelijan-osaamisen-arvioinnin-kohteet')"
        required
      >
        <div v-if="isEditing">
          <VueDraggable
            v-bind="arvioinnitOptions"
            v-model="data.arvioinnit"
            tag="div"
          >
            <div
              v-for="(arviointi, index) in data.arvioinnit"
              :key="'arviointi'+index"
              class="flex flex-wrap gap-4 pb-2"
            >
              <div class="flex-[10] min-w-0 lg:w-2/3">
                <ep-input
                  v-model="arviointi[sisaltokieli]"
                  :is-editing="isEditing"
                  type="string"
                  class="flex-1"
                >
                  <template #left>
                    <div class="order-handle m-1">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                  </template>
                </ep-input>
              </div>
              <div
                v-if="isEditing"
                class="w-1/12"
              >
                <div
                  class="default-icon clickable mt-1"
                  @click="poista(arviointi, 'arvioinnit')"
                >
                  <EpMaterialIcon icon-shape="outlined">
                    delete
                  </EpMaterialIcon>
                </div>
              </div>
            </div>
          </VueDraggable>

          <ep-button
            v-if="isEditing"
            variant="outline"
            icon="add"
            @click="lisaa('arvioinnit')"
          >
            {{ $t('lisaa-arvioinnin-kohde') }}
          </ep-button>
        </div>

        <div v-else>
          <ul>
            <li
              v-for="(arviointi, index) in data.arvioinnit"
              :key="'arviointi'+index"
            >
              {{ $kaanna(arviointi) }}
            </li>
          </ul>
        </div>
      </EpFormGroup>
    </template>
  </EpEditointi>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import { KoodistoSelectStore, getKoodistoSivutettuna } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { VueDraggable } from 'vue-draggable-plus';
import { generateTemporaryKoodiUri } from '@shared/utils/koodi';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpInputGroup from '@shared/components/EpInputGroup/EpInputGroup.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const route = useRoute();
const store = ref<EditointiStore | null>(null);

const koodisto = new KoodistoSelectStore({
  koodisto: 'opintokokonaisuusnimet',
  async query(query: string, sivu = 0, koodisto: string) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const opintokokonaisuusId = computed(() => {
  return route.params.opintokokonaisuusId;
});

const sisaltokieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const defaultDragOptions = computed(() => {
  return {
    animation: 300,
    emptyInsertThreshold: 10,
    handle: '.order-handle',
    disabled: !store.value!.isEditing,
    ghostClass: 'dragged',
  };
});

const arvioinnitOptions = computed(() => {
  return {
    ...defaultDragOptions.value,
    group: {
      name: 'arvioinnit',
    },
  };
});

const tavoitteetOptions = computed(() => {
  return {
    ...defaultDragOptions.value,
    group: {
      name: 'tavoitteet',
    },
  };
});

const kasiteHandler = inject('kasiteHandler');
const kuvaHandler = inject('kuvaHandler');

const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const tkstore = new OpintokokonaisuusStore(perusteId.value!, Number(opintokokonaisuusId.value), versionumero.value);
  store.value = new EditointiStore(tkstore);
};

const lisaa = (array: string, koodisto?: string) => {
  store.value?.setData({
    ...store.value?.data,
    [array]: [
      ..._.get(store.value?.data, array),
      {
        ...(koodisto && { uri: generateTemporaryKoodiUri(koodisto) }),
      },
    ],
  });
};

const poista = (poistettavaRivi: any, array: string) => {
  store.value?.setData({
    ...store.value?.data,
    [array]: _.filter(_.get(store.value?.data, array), rivi => rivi !== poistettavaRivi),
  });
};

// Watch for changes in opintokokonaisuusId
watch(opintokokonaisuusId, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

// Watch for changes in versionumero
watch(versionumero, async () => {
  await fetch();
}, { immediate: true });
</script>
