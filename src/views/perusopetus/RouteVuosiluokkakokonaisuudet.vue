<template>
  <EpContentView>
    <template v-slot:header>
      <h3 class="mb-0">
        {{ $t('vuosiluokkakokonaisuudet') }}
      </h3>
    </template>

    <EpSpinner v-if="!vuosiluokkakokonaisuudet"/>
    <div v-else>
      <div class="d-flex justify-content-end">
        <EpButton variant="outline" icon="add" @click="lisaaVuosiluokkakokonaisuus" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
          {{ $t('uusi-vuosiluokkakokonaisuus')}}
        </EpButton>
      </div>

      <b-row class="border-bottom-1 m-0 pb-2" v-if="vuosiluokkakokonaisuudet.length > 0">
        <b-col cols="5" class="font-weight-bold">{{$t('nimi')}}</b-col>
        <b-col cols="5" class="font-weight-bold">{{$t('muokattu')}}</b-col>
      </b-row>

      <b-row v-for="(vlk, index) in vuosiluokkakokonaisuudet" :key="'lao'+index" class="taulukko-rivi-varitys py-3 m-0">
        <b-col cols="5" class="d-flex">
          <div>
            <router-link :to="{ name: 'perusopetusVuosiluokkakokonaisuus', params: { vlkId: vlk.id } }">{{ $kaanna(vlk.nimi) }}</router-link>
          </div>
        </b-col>
        <b-col cols="5">
          <span v-if="vlk.muokattu">{{$sdt(vlk.muokattu)}}</span>
        </b-col>
      </b-row>
    </div>

  </EpContentView>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { PerusopetusVuosiluokkakokonaisuudetStore } from '@/stores/PerusopetusVuosiluokkakokonaisuudetStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContentView from '@shared/components/EpContentView/EpContentView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { $kaanna, $t, $sdt } from '@shared/utils/globals';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
});

const router = useRouter();
const store = ref<PerusopetusVuosiluokkakokonaisuudetStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const vuosiluokkakokonaisuudet = computed(() => {
  return store.value?.vuosiluokkakokonaisuudet.value;
});


const lisaaVuosiluokkakokonaisuus = () => {
  router.push({
    name: 'perusopetusVuosiluokkakokonaisuus',
  });
};

onMounted(async () => {
  store.value = new PerusopetusVuosiluokkakokonaisuudetStore(perusteId.value!);
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
