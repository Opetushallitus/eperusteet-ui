<template>
  <EpEditointi v-if="store" :store="store">
    <template #header>
      <h3>{{$t('oppiaineet')}}</h3>
    </template>
    <template #muokkaa>
      {{$t('muokkaa-jarjestysta')}}
    </template>
    <template #default="{ data, isEditing }">
      <div class="d-flex justify-content-end">
        <EpButton variant="outline" :disabled="isEditing" icon="add" @click="lisaaOppiaine" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
          {{ $t('uusi-oppiaine')}}
        </EpButton>
      </div>

      <b-row class="border-bottom-1 m-0 pb-2" v-if="data.oppiaineet.length > 0">
        <b-col cols="5" class="font-weight-bold">{{$t('nimi')}}</b-col>
      </b-row>

      <VueDraggable
        v-bind="defaultDragOptions"
        tag="div"
        v-model="data.oppiaineet">

        <b-row v-for="(oppiaine, index) in data.oppiaineet" :key="'lao'+index" class="taulukko-rivi-varitys py-3 m-0">
          <b-col cols="5" class="d-flex">
            <div class="order-handle mr-2" v-if="isEditing">
              <EpMaterialIcon>drag_indicator</EpMaterialIcon>
            </div>
            <div>
              <router-link :to="{ name: 'perusopetusoppiaine', params: { oppiaineId: oppiaine.id } }">
                <span v-if="oppiaine.nimi">{{ $kaanna(oppiaine.nimi) }}</span>
                <span v-else>{{$t('nimeton-oppiaine')}}</span>
                <span v-if="oppiaine.koodiArvo"> ({{ oppiaine.koodiArvo }})</span>
              </router-link>
            </div>
          </b-col>
        </b-row>
      </VueDraggable>
    </template>

  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as _ from 'lodash';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { PerusopetusOppiaineetStore } from '@/stores/PerusopetusOppiaineetStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { VueDraggable } from 'vue-draggable-plus';
import { PerusopetusOppiaineStore } from '@/stores/PerusopetusOppiaineStore';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const router = useRouter();
const store = ref<EditointiStore | null>(null);

onMounted(async () => {
  const storeInstance = new PerusopetusOppiaineetStore(perusteId.value!, props.perusteStore);
  store.value = new EditointiStore(storeInstance);
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const fields = computed(() => {
  return [{
    label: $t('nimi'),
    key: 'nimi',
    sortable: true,
  }];
});

const isEditing = computed(() => {
  return store.value?.isEditing;
});

const defaultDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !isEditing.value,
    group: {
      name: 'oppiaineet',
    },
  };
});

const lisaaOppiaine = async () => {
  const newOppiaine = await PerusopetusOppiaineStore.create(perusteId.value);
  await props.perusteStore.updateNavigation();
  await EditointiStore.cancelAll();
  router.push({ name: 'perusopetusoppiaine', params: { oppiaineId: _.toString(newOppiaine.id), uusi: 'uusi' } });
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
