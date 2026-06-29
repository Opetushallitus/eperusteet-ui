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
    <template #default="{ data, isEditing }">
      <div
        v-if="isEditing"
        class="flex flex-wrap gap-4 mb-4"
      >
        <div class="lg:w-2/3">
          <EpFormGroup
            :label="$t('otsikko')"
            required
          >
            <ep-koodisto-select
              v-model="data.nimiKoodi"
              :store="laajaalainenOsaaminenKoodisto"
              :is-editing="isEditing"
              :nayta-arvo="false"
            />
          </EpFormGroup>
        </div>
      </div>

      <ep-toggle
        v-if="isEditing"
        v-model="data.liite"
        class="my-4"
      >
        {{ $t('nayta-laaja-alainen-osaaminen-liitteena') }}
      </ep-toggle>

      <div class="flex flex-wrap gap-4">
        <div class="lg:w-2/3">
          <EpFormGroup
            :label="isEditing ? $t('kuvaus') : ''"
            required
          >
            <ep-content
              v-model="data.teksti"
              layout="normal"
              :is-editable="isEditing"
              :kasite-handler="kasiteHandler"
              :kuva-handler="kuvaHandler"
            />
          </EpFormGroup>
        </div>
      </div>
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
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { KoodistoSelectStore, getKoodistoSivutettuna } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import * as _ from 'lodash';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { TermitStore } from '@/stores/TermitStore';
import { LaajaalainenOsaaminenStore } from '@/stores/LaajaalainenOsaaminenStore';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpInputGroup from '@shared/components/EpInputGroup/EpInputGroup.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const store = ref<EditointiStore | null>(null);
const route = useRoute();

const laajaalainenOsaaminenKoodisto = new KoodistoSelectStore({
  koodisto: 'tutkintokoulutukseenvalmentavakoulutuslaajaalainenosaaminen',
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

const laajaalainenosaaminenId = computed(() => {
  return route.params.laajaalainenosaaminenId;
});


const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const tkstore = new LaajaalainenOsaaminenStore(perusteId.value!, Number(laajaalainenosaaminenId.value), versionumero.value);
  store.value = new EditointiStore(tkstore);
};

watch(() => laajaalainenosaaminenId.value, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

watch(() => versionumero.value, async () => {
  await fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

:deep(fieldset) {
  padding-right: 0;
}

:deep(.input-wrapper) {
  flex: 1 1 0;

  input {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}
</style>
