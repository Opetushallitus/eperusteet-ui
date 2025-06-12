<template>
  <EpEditointi v-if="store" :store="store" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 class="m-0" v-if="data.nimiKoodi" >{{ $kaanna(data.nimiKoodi.nimi) }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing }">

      <b-row v-if="isEditing" class="mb-4">
        <b-col lg="8">
          <b-form-group :label="$t('otsikko') + (isEditing ? ' *' : '')" required>
            <ep-koodisto-select :store="tavoitesisaltoalueotsikkoKoodisto" v-model="data.nimiKoodi" :is-editing="isEditing" :naytaArvo="false">
              <template #default="{ open }">
                <b-input-group>
                  <b-form-input
                    :value="data.nimiKoodi ? $kaanna(data.nimiKoodi.nimi) : ''"
                    disabled></b-form-input>
                  <b-input-group-append>
                    <b-button @click="open" variant="primary">
                      {{ $t('hae-koodistosta') }}
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </template>
            </ep-koodisto-select>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col lg="8">
          <b-form-group required>
            <template v-if="isEditing" #label>
              <div>{{$t('kappaleen-teksti')}}</div>
            </template>
            <ep-content v-model="data.teksti"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>

          <hr/>
        </b-col>
      </b-row>

      <h3 class="mb-4">{{$t('tavoitteet-ja-keskeiset-sisaltoalueet')}}</h3>
      <b-row>
        <b-col lg="8">
          <EpTavoitesisaltoalueTavoitealueet v-model="data.tavoitealueet" :isEditing="isEditing"/>
        </b-col>
      </b-row>
    </template>
  </EpEditointi>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import { useRoute } from 'vue-router';
import * as _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { Koodisto } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { TavoitesisaltoalueStore } from '@/stores/TavoitesisaltoalueStore';
import EpTavoitesisaltoalueTavoitealueet from '@shared/components/EpTavoitesisaltoalue/EpTavoitesisaltoalueTavoitealueet.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const route = useRoute();
const store = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const tavoitesisaltoalueId = computed(() => {
  return route.params.tavoitesisaltoalueId;
});

const kasiteHandler = inject('kasiteHandler');
const kuvaHandler = inject('kuvaHandler');

// Initialize koodisto
const tavoitesisaltoalueotsikkoKoodisto = new KoodistoSelectStore({
  koodisto: 'tavoitesisaltoalueenotsikko',
  async query(query: string, sivu = 0, koodisto: string) {
    const { data } = (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    }));
    return data as any;
  },
});

const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const tkstore = new TavoitesisaltoalueStore(
    perusteId.value!,
    Number(tavoitesisaltoalueId.value),
    versionumero.value,
  );
  store.value = new EditointiStore(tkstore);
};

// Watch for changes in tavoitesisaltoalueId
watch(tavoitesisaltoalueId, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

// Watch for changes in versionumero
watch(versionumero, async () => {
  await fetch();
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
