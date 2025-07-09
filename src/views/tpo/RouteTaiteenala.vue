<template>
  <EpEditointi v-if="store" :store="store" :versionumero="versionumero">
    <template #header="{ data }">
      <h2 v-if="data.koodi">{{ $kaanna(data.koodi.nimi) }}</h2>
      <h2 v-else-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else class="font-italic" >{{ $t('nimeton') }}</h2>
    </template>

    <template #default="{ data, isEditing }">
      <b-row v-if="isEditing">
        <b-col cols="11">
          <b-form-group :label="$t('taiteenala') + ' *'">
            <ep-koodisto-select :store="koodisto" v-model="data.koodi" :is-editing="isEditing" :naytaArvo="false">
              <template #default="{ open }">
                <b-input-group>
                  <b-form-input
                    :value="data.koodi ? $kaanna(data.koodi.nimi) : ''"
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

      <div class="col-11 pl-0">

        <h4 class="mt-4" v-if="isEditing">{{$t('kuvaus')}} *</h4>
        <ep-content
          layout="normal"
          v-model="data.teksti"
          :is-editable="isEditing"
          :kasiteHandler="kasiteHandler"/>

        <hr v-if="isEditing" class="mt-5"/>

        <EpSisaltoTekstikappaleet v-model="storeData" :isEditing="isEditing" :sisaltoAvaimet="sisaltoTekstiAvaimet" sisaltoTekstiOtsikkoField="nimi"/>
      </div>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import { useRoute } from 'vue-router';
import * as _ from 'lodash';
import { PerusteStore } from '@/stores/PerusteStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { TaiteenalaStore } from '@/stores/TaiteenalaStore';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpSisaltoTekstikappaleet from '@/components/EpSisaltoTekstikappaleet.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { $t, $kaanna } from '@shared/utils/globals';
import { onMounted } from 'vue';

const props = defineProps<{
  perusteStore: PerusteStore;
  taiteenalaId: number;
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

const sisaltoTekstiAvaimet = computed(() => {
  return ['aikuistenOpetus', 'kasvatus', 'oppimisenArviointiOpetuksessa', 'teemaopinnot', 'tyotavatOpetuksessa', 'yhteisetOpinnot'];
});

const storeData = computed({
  get() {
    return store.value?.data;
  },
  set(data) {
    store.value?.setData(data);
  },
});

const taiteenalaIdType = computed(() => {
  return typeof props.taiteenalaId;
});

const fetch = async () => {
  const taiteenalaStore = new TaiteenalaStore(
    perusteId.value!,
    props.taiteenalaId,
    versionumero.value,
    !!props.uusi,
  );
  store.value = new EditointiStore(taiteenalaStore);
};

// Initialize koodisto
const koodisto = new KoodistoSelectStore({
  koodisto: 'oppiaineetyleissivistava2',
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

// Watch for changes in taiteenalaId
watch(() => props.taiteenalaId, async () => {
  await fetch();
});

// Watch for changes in versionumero
watch(versionumero, async () => {
  await fetch();
});

const postSave = async () => {
  await props.perusteStore.updateNavigation();
};

onMounted(async () => {
  await fetch();
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
