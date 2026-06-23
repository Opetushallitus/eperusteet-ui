<template>
  <EpContentView>
    <template #header>
      <h3 class="mb-0">
        {{ $t('vuosiluokkakokonaisuudet') }}
      </h3>
    </template>

    <EpSpinner v-if="!vuosiluokkakokonaisuudet" />
    <div v-else>
      <div class="flex justify-end mb-2">
        <EpButton
          v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
          variant="outline"
          icon="add"
          @click="lisaaVuosiluokkakokonaisuus"
        >
          {{ $t('uusi-vuosiluokkakokonaisuus') }}
        </EpButton>
      </div>

      <EpTable
        v-if="vuosiluokkakokonaisuudet.length > 0"
        striped
        hover
        responsive
        :items="vuosiluokkakokonaisuudet"
        :fields="tableFields"
      >
        <template #cell(nimi)="{ item }">
          <router-link :to="{ name: 'perusopetusVuosiluokkakokonaisuus', params: { vlkId: item.id } }">
            {{ $kaanna(item.nimi) }}
          </router-link>
        </template>
      </EpTable>
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
import EpTable from '@shared/components/EpTable/EpTable.vue';
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
  return store.value?.vuosiluokkakokonaisuudet;
});

const tableFields = computed(() => [
  {
    key: 'nimi',
    label: $t('nimi'),
    sortable: false,
  },
  {
    key: 'muokattu',
    label: $t('muokattu'),
    sortable: false,
    formatter: (value: unknown) => (value ? $sdt(value as string) : ''),
  },
]);

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
