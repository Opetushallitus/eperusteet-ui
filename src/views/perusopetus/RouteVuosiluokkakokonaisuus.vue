<template>
  <EpEditointi :store="store">
    <template #header="{ data }">
      <h2 v-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else class="font-italic" >{{ $t('nimeton') }}</h2>
    </template>

    <template #default="{ data, isEditing, supportData }">
      <div class="col-11 pl-0">
        <div class="mt-1" v-if="isEditing">
          <h3>{{$t('vuosiluokkakokonaisuuden-nimi')}} *</h3>
          <ep-input v-model="data.nimi" :is-editing="true"></ep-input>
        </div>

        <b-form-group class="mt-4" :label="$t('vuosiluokat') + (isEditing ? ' *' : '')">
          <EpToggleGroup v-model="data.vuosiluokat" :items="valittavatVuosiluokat" v-if="isEditing">
            <template v-slot="{ item }">
              <div class="mr-5">
                {{ $t('vuosiluokka') }} {{ $t(item) }}
              </div>
            </template>
          </EpToggleGroup>

          <div v-else>
            <span v-for="(vuosiluokka, index) in vuosiluokat" :key="'vlk' + index"><span v-if="index > 0">, </span>{{ $t(vuosiluokka) }}</span>
          </div>
        </b-form-group>

        <EpSisaltoTekstikappaleet v-model="storeData" :isEditing="isEditing" :sisaltoAvaimet="['siirtymaEdellisesta', 'siirtymaSeuraavaan', 'tehtava', 'laajaalainenOsaaminen']" />

        <b-form-group class="mt-4" :label="$t('laaja-alaiset-osaamiset')">
          <div v-for="(lao, index) in data.laajaalaisetOsaamiset" :key="'lao' +index" :class="{'mb-5': index + 1 < data.laajaalaisetOsaamiset.length}">
            <h5>{{$kaanna(supportData.laajaalaisetOsaamiset[lao._laajaalainenOsaaminen].nimi)}}</h5>

            <ep-content layout="normal" v-model="lao.kuvaus" :is-editable="isEditing"> </ep-content>

            <ep-collapse v-if="isEditing" :borderBottom="false" :usePadding="false" chevronLocation="left" :expandedByDefault="false">
              <template #header>
                <div class="link-style">{{ $t('nayta-osaamiskokonaisuuden-yleiskuvaus')}}</div>
              </template>

              <ep-content layout="normal" :value="supportData.laajaalaisetOsaamiset[lao._laajaalainenOsaaminen].kuvaus" :is-editable="false"> </ep-content>
            </ep-collapse>

          </div>

        </b-form-group>

        <hr/>

        <ep-collapse :collapsable="!isEditing" :borderBottom="false" :usePadding="false">
          <template #header>
            <h4>{{ $t('paikallisesti-paatettavat-asiat')}}</h4>
          </template>
          <ep-content layout="normal" v-model="data.paikallisestiPaatettavatAsiat.teksti" :is-editable="isEditing"> </ep-content>
        </ep-collapse>

      </div>
    </template>
  </EpEditointi>

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { PerusopetusVuosiluokkakokonaisuusStore } from '@/stores/PerusopetusVuosiluokkakokonaisuusStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpSisaltoTekstikappaleet from '@/components/EpSisaltoTekstikappaleet.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { $t, $kaanna } from '@shared/utils/globals';
import EpToggleGroup from '@shared/components/forms/EpToggleGroup.vue';

const props = defineProps<{
  perusteStore: PerusteStore;
  vlkId?: any;
}>();

const router = useRouter();
const store = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

// Watch for changes in vlkId
watch(() => props.vlkId, async () => {
  const vlkStore = new PerusopetusVuosiluokkakokonaisuusStore(
    perusteId.value!,
    props.vlkId,
    props.perusteStore,
    { $router: router }
  );
  store.value = new EditointiStore(vlkStore);
}, { immediate: true });

const storeData = computed({
  get() {
    return store.value?.data;
  },
  set(data) {
    store.value?.setData(data);
  },
});

const vuosiluokat = computed(() => {
  return _.sortBy(store.value?.data.vuosiluokat);
});

const valittavatVuosiluokat = computed((): any => {
  return _.map(_.range(1, 10), vlk => ('vuosiluokka_' + vlk));
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
