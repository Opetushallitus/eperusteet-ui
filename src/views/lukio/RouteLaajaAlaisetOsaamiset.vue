<template>
  <EpEditointi
    v-if="store"
    :store="store"
  >
    <template #header>
      <h3>{{ $t('laaja-alaisen-osaamisen-osa-alueet') }}</h3>
    </template>
    <template #default="{ data, isEditing }">
      <div class="flex flex-wrap gap-4">
        <div class="flex-[11] min-w-0">
          <EpDraggableCollapse
            v-model="data.laajaAlaisetOsaamiset"
            :is-editing="isEditing"
          >
            <template
              v-if="!isEditing"
              #header="{data}"
            >
              <h4
                v-if="data.koodi"
                class="ml-3 mt-3"
              >
                {{ $kaanna(data.koodi.nimi) }}
              </h4>
            </template>

            <template #default="{data, index}">
              <div class="flex flex-wrap gap-4">
                <div
                  v-if="isEditing"
                  class="flex-[10] min-w-0"
                >
                  <EpFormGroup :label="$t('laaja-alaisen-osaamisen-otsikko')">
                    <ep-koodisto-select
                      v-model="data.koodi"
                      :store="koodisto"
                      :is-editing="isEditing"
                      :nayta-arvo="false"
                    />
                  </EpFormGroup>
                </div>
                <div class="w-1/6">
                  <EpFormGroup
                    v-if="data.koodi && data.koodi.arvo"
                    :label="$t('koodi')"
                  >
                    {{ data.koodi.arvo }}
                  </EpFormGroup>
                </div>
              </div>

              <EpFormGroup>
                <template
                  v-if="isEditing"
                  #label
                >
                  <div class="mt-1">
                    {{ $t('kuvaus') }}
                  </div>
                </template>
                <ep-content
                  v-model="data.kuvaus"
                  layout="normal"
                  :is-editable="isEditing"
                  :kasite-handler="kasiteHandler"
                />
              </EpFormGroup>

              <div
                v-if="isEditing"
                class="flex justify-between items-center mt-4"
              >
                <ep-button
                  v-if="isEditing && index === laajaAlaisetOsaamiset.length - 1"
                  variant="outline"
                  icon="add"
                  @click="lisaaLaajaAlainenOsaaminen()"
                >
                  {{ $t('uusi-laaja-alainen') }}
                </ep-button>
                <div v-else />
                <ep-button
                  variant="link"
                  icon="delete"
                  @click="poistaLaajaAlainenOsaaminen(data)"
                >
                  {{ $t('poista-laaja-alainen') }}
                </ep-button>
              </div>
            </template>
          </EpDraggableCollapse>

          <ep-button
            v-if="isEditing && laajaAlaisetOsaamiset.length === 0"
            variant="outline"
            icon="add"
            @click="lisaaLaajaAlainenOsaaminen()"
          >
            {{ $t('uusi-laaja-alainen') }}
          </ep-button>
        </div>
      </div>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { ref, computed, onMounted } from 'vue';
import { LukioLaajaAlaisetOsaamisetStore } from '@/stores/LukioLaajaAlaisetOsaamisetStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { KoodistoSelectStore, getKoodistoSivutettuna } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpDraggableCollapse from '@shared/components/EpDraggableCollapse/EpDraggableCollapse.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpInputGroup from '@shared/components/EpInputGroup/EpInputGroup.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const store = ref<EditointiStore | null>(null);

onMounted(async () => {
  const lukioStore = new LukioLaajaAlaisetOsaamisetStore(perusteId.value!);
  store.value = new EditointiStore(lukioStore);
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const koodisto = new KoodistoSelectStore({
  koodisto: 'laajaalainenosaaminenlops2021',
  async query(query: string, sivu = 0, koodisto: string) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const lisaaLaajaAlainenOsaaminen = () => {
  store.value?.setData({
    ...store.value.data,
    laajaAlaisetOsaamiset: [
      ...store.value.data.laajaAlaisetOsaamiset,
      {},
    ],
  });
};

const poistaLaajaAlainenOsaaminen = (poistettavaLao: any) => {
  store.value?.setData({
    ...store.value.data,
    laajaAlaisetOsaamiset: _.filter(laajaAlaisetOsaamiset.value, lao => lao !== poistettavaLao),
  });
};

const laajaAlaisetOsaamiset = computed(() => {
  return store.value?.data.laajaAlaisetOsaamiset || [];
});

const isEditing = computed(() => {
  return store.value?.isEditing;
});


</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
