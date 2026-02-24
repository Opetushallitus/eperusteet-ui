<template>
  <EpContentView>
    <template #header>
      <h3 class="mb-0">
        {{ $t('laaja-alaiset-osaamiset') }}
      </h3>
    </template>

    <EpSpinner v-if="!laajaAlaisetOsaamiset" />
    <div v-else>
      <div class="flex justify-end mb-2">
        <EpButton
          v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
          variant="outline"
          icon="add"
          @click="lisaaLaajaAlainenOsaaminen"
        >
          {{ $t('uusi-laaja-alainen-osaaminen') }}
        </EpButton>
      </div>

      <EpTable
        v-if="laajaAlaisetOsaamiset.length > 0"
        striped
        hover
        responsive
        :items="laajaAlaisetOsaamiset"
        :fields="tableFields"
      >
        <template #cell(nimi)="{ item }">
          <router-link :to="{ name: 'perusopetusLaajaAlainenOsaaminen', params: { laoId: item.id } }">
            {{ $kaanna(item.nimi) }}
          </router-link>
        </template>
      </EpTable>
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
import EpTable from '@shared/components/EpTable/EpTable.vue';
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
  if (store.value?.laajaAlaisetOsaamiset) {
    return _.sortBy(store.value?.laajaAlaisetOsaamiset, 'id');
  }
  return [];
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


const lisaaLaajaAlainenOsaaminen = () => {
  router.push({
    name: 'perusopetusLaajaAlainenOsaaminen',
  });
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
