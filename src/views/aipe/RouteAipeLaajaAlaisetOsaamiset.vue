<template>
  <EpEditointi :store="store" v-if="store">
    <template #header>
      <h3>{{ $t('laaja-alaiset-osaamiset') }}</h3>
    </template>
    <template #muokkaa>
      {{ $t('muokkaa-jarjestysta') }}
    </template>
    <template #default="{ data, isEditing }">
      <div class="flex justify-end">
        <EpButton
          v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
          variant="outline"
          icon="add"
          :disabled="isEditing"
          @click="lisaaLaajaAlainenOsaaminen"
        >
          {{ $t('uusi-laaja-alainen-osaaminen') }}
        </EpButton>
      </div>

      <div class="flex flex-wrap gap-4 border-bottom-1 m-0">
        <div class="w-5/12 font-semibold">
          {{ $t('nimi') }}
        </div>
        <div class="w-5/12 font-semibold">
          {{ $t('muokattu') }}
        </div>
      </div>

      <VueDraggable
        v-bind="defaultDragOptions"
        v-model="data.laajaAlaisetOsaamiset"
        tag="div"
      >
        <div
          v-for="(lao, index) in data.laajaAlaisetOsaamiset"
          :key="'lao'+index"
          class="flex flex-wrap gap-4 taulukko-rivi-varitys py-3 m-0"
        >
          <div class="w-5/12 flex">
            <div
              v-if="isEditing"
              class="order-handle mr-2"
            >
              <EpMaterialIcon>drag_indicator</EpMaterialIcon>
            </div>
            <div>
              <router-link :to="{ name: 'aipelaajaAlainenOsaaminen', params: { laoId: lao.id } }">
                {{ $kaanna(lao.nimi) }}
              </router-link>
            </div>
          </div>
          <div class="w-5/12">
            <span v-if="lao.muokattu">{{ $sdt(lao.muokattu) }}</span>
          </div>
        </div>
      </VueDraggable>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AipeLaajaAlaisetOsaamisetStore } from '@/stores/AipeLaajaAlaisetOsaamisetStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { VueDraggable } from 'vue-draggable-plus';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $kaanna, $t, $sdt } from '@shared/utils/globals';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
});

const router = useRouter();
const store = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});


const lisaaLaajaAlainenOsaaminen = () => {
  router.push({
    name: 'aipelaajaAlainenOsaaminen',
  });
};

const isEditing = computed(() => {
  return store.value?.isEditing;
});

const defaultDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !isEditing.value,
    group: {
      name: 'laot',
    },
  };
});

onMounted(async () => {
  const storeInstance = new AipeLaajaAlaisetOsaamisetStore(perusteId.value!, props.perusteStore);
  store.value = new EditointiStore(storeInstance);
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
