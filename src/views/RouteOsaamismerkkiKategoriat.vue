<template>
  <EpMainView>
    <template #header>
      <div class="d-flex justify-content-between">
        <h1>{{ $t('osaamismerkki-teemojen-hallinta') }}</h1>
        <div class="d-flex">
          <EpButton class="m-0 p-0"
                    variant="outlined"
                    icon="add"
                    @click="avaaKategoriaModal">{{$t('lisaa-teema')}}</EpButton>
        </div>
      </div>
    </template>

    <EpSpinner v-if="!kategoriat" />
    <div v-else-if="kategoriat.length > 0">
      <b-table responsive
               borderless
               striped
               fixed
               hover
               no-local-sorting
               :items="kategoriat"
               :fields="tableFields"
               @row-clicked="avaaKategoriaModal"/>
    </div>
    <div v-else class="m-2 alert alert-info">
      {{ $t('ei-hakutuloksia') }}
    </div>

    <EpOsaamismerkkiKategoriaModal ref="osaamismerkkiKategoriaModal" :store="osaamismerkitStore"/>
  </EpMainView>
</template>

<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { OsaamismerkkiKategoriaDto } from '@shared/generated/eperusteet';
import EpOsaamismerkkiKategoriaModal from '@/components/EpOsaamismerkki/EpOsaamismerkkiKategoriaModal.vue';
import { OsaamismerkitStore } from '@/stores/OsaamismerkitStore';
import { Murupolku } from '@shared/stores/murupolku';
import { $t, $kaanna, $sdt } from '@shared/utils/globals';

const props = defineProps<{
  osaamismerkitStore: OsaamismerkitStore;
}>();

const osaamismerkkiKategoriaModal = useTemplateRef('osaamismerkkiKategoriaModal');

const kategoriat = computed(() => {
  return props.osaamismerkitStore.kategoriat.value;
});

const tableFields = computed(() => {
  return [
    {
      key: 'nimi',
      label: $t('teeman-nimi'),
      sortable: false,
      thStyle: { width: '50%', borderBottom: '0px' },
      formatter: (value: any, key: any, item: any) => {
        return $kaanna(value);
      },
    }, {
      key: 'muokattu',
      label: $t('muokattu'),
      sortable: false,
      thStyle: { width: '50%', borderBottom: '0px' },
      formatter: (value: any, key: any, item: any) => {
        return $sdt(value);
      },
    },
  ];
});

const avaaKategoriaModal = (kategoria?: OsaamismerkkiKategoriaDto) => {
  (osaamismerkkiKategoriaModal.value as any)?.avaaModal(kategoria);
};

onMounted(async () => {
  Murupolku.aseta('osaamismerkkikategoriat', $t('route-osaamismerkkiteemat'), {
    name: 'osaamismerkkikategoriat',
  });
  await props.osaamismerkitStore.fetchKategoriat();
});
</script>

<style lang="scss" scoped>

</style>
