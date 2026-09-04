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
        {{ $t('nimeton-opinto') }}
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
            />
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

          <EpKotoTaitotasot
            v-model="data.taitotasot"
            class="mt-4"
            :is-editing="isEditing"
            :kasite-handler="kasiteHandler"
            :kuva-handler="kuvaHandler"
            taitotaso-tyyppi="opintokokonaisuus"
          />
        </div>
      </div>
    </template>
  </EpEditointi>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import { useRoute } from 'vue-router';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { KoodistoSelectStore, getKoodistoSivutettuna } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpInputGroup from '@shared/components/EpInputGroup/EpInputGroup.vue';
import EpKotoTaitotasot from '@shared/components/EpKotoTaitotasot/EpKotoTaitotasot.vue';
import { KotoOpintoStore } from '@/stores/Koto/KotoOpintoStore';
import { Murupolku } from '@shared/stores/murupolku';
import * as _ from 'lodash';
import { $kaanna, $t } from '@shared/utils/globals';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
});

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

const kotoOpintoId = computed(() => route.params.kotoOpintoId);
const perusteId = computed(() => props.perusteStore.perusteId.value);
const versionumero = computed(() => _.toNumber(route.query.versionumero));
const kotoSisalto = computed(() => store.value?.data?.value || null);

const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const tkstore = new KotoOpintoStore(perusteId.value!, Number(kotoOpintoId.value), versionumero.value);
  store.value = new EditointiStore(tkstore);
};

watch(kotoOpintoId, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

watch(versionumero, async () => {
  await fetch();
}, { immediate: true });

watch(kotoSisalto, (kotoSisalto) => {
  if (kotoSisalto) {

    Murupolku.aseta('koto_opinto', kotoSisalto.nimiKoodi ? $kaanna(kotoSisalto.nimiKoodi.nimi) : $t('nimeton-opinto'), {
      name: 'koto_opinto',
    });
  }
});
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
