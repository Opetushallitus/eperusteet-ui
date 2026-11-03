<template>
  <EpEditointi
    v-if="store"
    :store="store"
    :versionumero="versionumero"
  >
    <template #header="{ data }">
      <h2 v-if="data.koodi">
        {{ $kaanna(data.koodi.nimi) }}
      </h2>
      <h2
        v-else
        class="font-italic"
      >
        {{ $t('nimeton-vaihe') }}
      </h2>
    </template>

    <template #default="{ data, isEditing }">
      <div class="flex gap-4 lg:w-4/5">
        <div
          v-if="isEditing"
          class="flex-1"
        >
          <EpFormGroup
            :label="$t('vaiheen-nimi')"
            required
          >
            <ep-koodisto-select
              v-model="data.koodi"
              :koodisto="Koodistot.TPO_VAIHE"
              :is-editing="isEditing"
              :nayta-arvo="false"
            />
          </EpFormGroup>
        </div>

        <div
          class="w-48 shrink-0"
          :class="{ 'ml-auto': isEditing }"
        >
          <EpFormGroup :label="$t('laajuus')">
            <EpLaajuusInput
              v-model="data.laajuus"
              :is-editing="isEditing"
            >
              {{ $t('opintopiste') }}
            </EpLaajuusInput>
          </EpFormGroup>
        </div>
      </div>

      <div class="flex flex-wrap gap-4">
        <div class="lg:w-4/5">
          <EpFormGroup>
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
              :kasite-handler="kasiteHandler"
              :kuva-handler="kuvaHandler"
            />
          </EpFormGroup>

          <hr>
        </div>
      </div>

      <h3 class="mb-4">
        {{ $t('tavoitteet-ja-keskeiset-sisaltoalueet') }}
      </h3>
      <div class="flex flex-wrap gap-4">
        <div class="lg:w-4/5">
          <EpTavoitesisaltoalueTavoitealueet
            v-model="data.tavoitealueet"
            :is-editing="isEditing"
            :otsikko-koodisto="Koodistot.TPO_TAVOITEALUE"
            :tavoite-koodisto="Koodistot.TPO_TAVOITE"
            :sallitaan-oma-tavoite="true"
            :sallitaan-oma-otsikko="true"
            :nayta-keskeiset-sisaltoalueet="false"
          />
        </div>
      </div>

      <div class="lg:w-4/5">
        <hr
          v-if="isEditing"
          class="mt-5"
        >

        <EpSisaltoTekstikappaleet
          v-model="storeData"
          :is-editing="isEditing"
          :sisalto-avaimet="[]"
          sisalto-teksti-otsikko-field="nimi"
        />
      </div>
    </template>
  </EpEditointi>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import * as _ from 'lodash';
import { PerusteStore } from '@/stores/PerusteStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { TaiteenalaVaiheStore } from '@/stores/TaiteenalaVaiheStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSisaltoTekstikappaleet from '@/components/EpSisaltoTekstikappaleet.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import EpTavoitesisaltoalueTavoitealueet from '@shared/components/EpTavoitesisaltoalue/EpTavoitesisaltoalueTavoitealueet.vue';
import { Koodistot } from '@shared/utils/koodi';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
  taiteenalaVaiheId: number;
  uusi?: string;
}>();

const route = useRoute();
const store = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const versionumero = computed(() => {
  return route.query.versionumero ? _.toNumber(route.query.versionumero) : undefined;
});

const kasiteHandler = inject('kasiteHandler');
const kuvaHandler = inject('kuvaHandler');

const storeData = computed({
  get() {
    return store.value?.data;
  },
  set(data) {
    store.value?.setData(data);
  },
});

const fetch = async () => {
  const taiteenalaVaiheStore = new TaiteenalaVaiheStore(
    perusteId.value!,
    Number(props.taiteenalaVaiheId),
    versionumero.value,
    !!props.uusi,
  );
  store.value = new EditointiStore(taiteenalaVaiheStore);
};

watch(() => props.taiteenalaVaiheId, async () => {
  await fetch();
});

watch(versionumero, async () => {
  await fetch();
});

onMounted(async () => {
  await fetch();
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

  :deep(fieldset) {
    padding-right: 0;
  }
</style>
