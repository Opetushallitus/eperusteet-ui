<template>
  <EpEditointi :store="store">
    <template #header>
      <h3>{{ $t('oppiaineet') }}</h3>
    </template>
    <template #muokkaa>
      {{ $t('muokkaa-jarjestysta') }}
    </template>
    <template #default="{ data, isEditing }">
      <div class="d-flex justify-content-end">
        <EpButton
          v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
          variant="outline"
          icon="add"
          :disabled="isEditing"
          @click="lisaaOppiaine"
        >
          {{ $t('uusi-oppiaine') }}
        </EpButton>
      </div>

      <b-row
        v-if="data.oppiaineet.length > 0"
        class="border-bottom-1 m-0"
      >
        <b-col
          cols="5"
          class="font-weight-bold pb-2"
        >
          {{ $t('nimi') }}
        </b-col>
      </b-row>

      <VueDraggable
        v-bind="defaultDragOptions"
        v-model="data.oppiaineet"
        tag="div"
      >
        <b-row
          v-for="(oppiaine, index) in data.oppiaineet"
          :key="'lao'+index"
          class="taulukko-rivi-varitys py-3 m-0"
        >
          <b-col
            cols="5"
            class="d-flex"
          >
            <div
              v-if="isEditing"
              class="order-handle mr-2"
            >
              <EpMaterialIcon>drag_indicator</EpMaterialIcon>
            </div>
            <div>
              <router-link :to="{ name: 'lukio_oppiaine', params: { oppiaineId: oppiaine.id } }">
                {{ $kaanna(oppiaine.nimi) }}
              </router-link>
            </div>
          </b-col>
          <b-col cols="5">
            <span v-if="oppiaine.muokattu">{{ $sdt(oppiaine.muokattu) }}</span>
          </b-col>
        </b-row>
      </VueDraggable>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LukioOppiaineetStore } from '@/stores/LukioOppiaineetStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { VueDraggable } from 'vue-draggable-plus';
import { $t, $kaanna, $sdt } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const router = useRouter();
const store = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

onMounted(async () => {
  const lukioOppiaineetStore = new LukioOppiaineetStore(perusteId.value!);
  store.value = new EditointiStore(lukioOppiaineetStore);
});


const lisaaOppiaine = () => {
  router.push({
    name: 'lukio_oppiaine',
  });
};

const defaultDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !isEditing.value,
    group: {
      name: 'oppiaineet',
    },
  };
});

const isEditing = computed(() => {
  return store.value?.isEditing;
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
