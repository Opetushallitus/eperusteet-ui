<template>
  <EpContentView>
    <template #header>
      <h3 class="mb-0">
        {{ $t('laaja-alaiset-osaamiset') }}
      </h3>
    </template>

    <EpSpinner v-if="!laajaAlaisetOsaamiset" />
    <div v-else>
      <div class="d-flex justify-content-end">
        <EpButton
          v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
          variant="outline"
          icon="add"
          @click="lisaaLaajaAlainenOsaaminen"
        >
          {{ $t('uusi-laaja-alainen-osaaminen') }}
        </EpButton>
      </div>

      <b-row
        v-if="laajaAlaisetOsaamiset.length > 0"
        class="border-bottom-1 m-0 pb-2"
      >
        <b-col
          cols="5"
          class="font-weight-bold"
        >
          {{ $t('nimi') }}
        </b-col>
        <b-col
          cols="5"
          class="font-weight-bold"
        >
          {{ $t('muokattu') }}
        </b-col>
      </b-row>

      <b-row
        v-for="(lao, index) in laajaAlaisetOsaamiset"
        :key="'lao'+index"
        class="taulukko-rivi-varitys py-3 m-0"
      >
        <b-col
          cols="5"
          class="d-flex"
        >
          <div>
            <router-link :to="{ name: 'perusopetusLaajaAlainenOsaaminen', params: { laoId: lao.id } }">
              {{ $kaanna(lao.nimi) }}
            </router-link>
          </div>
        </b-col>
        <b-col cols="5">
          <span v-if="lao.muokattu">{{ $sdt(lao.muokattu) }}</span>
        </b-col>
      </b-row>
    </div>
  </EpContentView>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as _ from 'lodash';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { PerusopetusLaajaAlaisetOsaamisetStore } from '@/stores/PerusopetusLaajaAlaisetOsaamisetStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContentView from '@shared/components/EpContentView/EpContentView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { $t, $kaanna, $sdt } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const router = useRouter();
const store = ref<PerusopetusLaajaAlaisetOsaamisetStore | null>(null);

onMounted(async () => {
  store.value = new PerusopetusLaajaAlaisetOsaamisetStore(perusteId.value!);
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const laajaAlaisetOsaamiset = computed(() => {
  if (store.value?.laajaAlaisetOsaamiset.value) {
    return _.sortBy(store.value?.laajaAlaisetOsaamiset.value, 'id');
  }
  return [];
});


const lisaaLaajaAlainenOsaaminen = () => {
  router.push({
    name: 'perusopetusLaajaAlainenOsaaminen',
  });
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
