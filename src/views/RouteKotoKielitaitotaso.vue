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
      <h2
        v-else
        class="!m-0"
      >
        {{ $t('nimeton-kielitaitotaso') }}
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
              :store="tavoitesisaltoalueotsikkoKoodisto"
              :is-editing="isEditing"
              :nayta-arvo="false"
            >
            </ep-koodisto-select>
          </EpFormGroup>
        </div>
      </div>

      <div class="flex flex-wrap gap-4">
        <div class="lg:w-2/3">
          <EpFormGroup :required="isEditing">
            <template
              v-if="isEditing"
              #label
            >
             {{ $t('kuvaus') }}
            </template>
            <ep-content
              v-model="data.kuvaus"
              layout="normal"
              :is-editable="isEditing"
              :kasite-handler="kasiteHandler"
              :kuva-handler="kuvaHandler"
            />
          </EpFormGroup>

          <EpKotoTaitotasot
            v-model="data.taitotasot"
            class="mt-4"
            :is-editing="isEditing"
            :kasite-handler="kasiteHandler"
            :kuva-handler="kuvaHandler"
            taitotaso-tyyppi="kielitaitotaso"
          />
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
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { KotoKielitaitotasoStore } from '@/stores/Koto/KotoKielitaitotasoStore';
import EpKotoTaitotasot from '@shared/components/EpKotoTaitotasot/EpKotoTaitotasot.vue';
import { Murupolku } from '@shared/stores/murupolku';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpInputGroup from '@shared/components/EpInputGroup/EpInputGroup.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const route = useRoute();
const store = ref<EditointiStore | null>(null);
const kasiteHandler = inject('kasiteHandler');
const kuvaHandler = inject('kuvaHandler');

const tavoitesisaltoalueotsikkoKoodisto = new KoodistoSelectStore({
  koodisto: 'tavoitesisaltoalueenotsikko',
  async query(query: string, sivu = 0, koodisto: string) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const kotoSisalto = computed(() => {
  return store.value?.data?.value || null;
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const kotokielitaitotasoId = computed(() => {
  return route.params.kotokielitaitotasoId;
});


const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const tkstore = new KotoKielitaitotasoStore(perusteId.value!, Number(kotokielitaitotasoId.value), versionumero.value);
  store.value = new EditointiStore(tkstore);
};

watch(kotokielitaitotasoId, async (id: string, oldId: string) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

watch(kotoSisalto, (newKotoSisalto) => {
  if (newKotoSisalto) {
    Murupolku.aseta('koto_kielitaitotaso', newKotoSisalto.nimiKoodi ? $kaanna(newKotoSisalto.nimiKoodi.nimi) : $t('nimeton-kielitaitotaso'), {
      name: 'koto_kielitaitotaso',
    });
  }
});

watch(versionumero, async () => {
  await fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  :deep(.input-wrapper) {
    flex: 1 1 0;

    input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  :deep(fieldset) {
    padding-right: 0;
  }
</style>
