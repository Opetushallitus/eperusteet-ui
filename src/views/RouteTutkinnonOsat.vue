<template>
  <EpEditointi :store="store">
    <template v-slot:header>
      <div class="d-flex justify-content-between">
        <h1>{{ $t('tutkinnon-osat') }}</h1>
      </div>
    </template>

    <template v-slot:default="{ isEditing }">
      <div v-if="!isEditing" class="d-md-flex justify-content-between align-items-center">
        <div>
          <ep-search v-model="query" />
        </div>
        <div>
          <ep-button @click="lisaaTutkinnonOsa" variant="outline" icon="add">
            {{ $t('lisaa-tutkinnon-osa') }}
          </ep-button>
          <ep-button @click="tuoTutkinnonOsa" variant="outline" icon="add">
            {{ $t('tuo-tutkinnon-osa') }}
          </ep-button>
          <EpTutkinnonosaTuontiModal ref="tutkinnonosaTuontiModal" :peruste="peruste" @refresh="refresh"/>
        </div>
      </div>

      <ep-spinner v-if="!items" />
      <div v-else-if="items.length === 0" class="p-4">
        <EpAlert :text="$t('tutkinnon-osia-ei-luotu')" />
      </div>
      <div v-else>
        <div class="table-responsive" v-if="isEditing">
          <table class="table table-borderless table-striped table-hover" role="table">
            <thead role="rowgroup">
              <tr>
                <th>{{ $t('no') }}</th>
                <th>{{ $t('nimi') }}</th>
                <th>{{ $t('laajuus') }}</th>
                <th>{{ $t('muokattu') }}</th>
              </tr>
            </thead>
            <draggable v-model="items"
                       tag="tbody"
                       v-bind="options">
              <tr v-for="(item, idx) in raw" :key="idx" role="row">
                <td>
                  <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                  {{ idx + 1 }}
                </td>
                <td>{{ $kaanna(item.tutkinnonOsa.nimi) || $t('nimeton-tutkinnonosa') }}</td>
                <td>{{ item.laajuus }}</td>
                <td>{{ $ago(item.muokattu) }}</td>
              </tr>
            </draggable>
          </table>
        </div>

        <b-table
          v-else
          responsive
          borderless
          striped
          fixed
          hover
          :items="items"
          :fields="fields">
          <template v-slot:cell(nimi)="{ item }">
            <router-link :to="item.to">
              {{ $kaanna(item.tutkinnonOsa.nimi) || $t('nimeton-tutkinnonosa') }}
            </router-link>
          </template>
        </b-table>
      </div>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import draggable from 'vuedraggable';
import _ from 'lodash';
import EpTutkinnonosaTuontiModal from '@/components/EpTutkinnonosaTuontiModal.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $kaanna, $t, $ago, $sdt, $filterBy } from '@shared/utils/globals';

const props = defineProps<{
  tutkinnonOsaStore: TutkinnonOsaStore;
  perusteStore: any;
  projektiId?: number;
  perusteId?: number;
}>();

const router = useRouter();
const route = useRoute();
const tutkinnonosaTuontiModal = useTemplateRef('tutkinnonosaTuontiModal');

const store = ref<EditointiStore | null>(null);
const query = ref('');

const options = computed(() => {
  return {
    animation: 300,
    handle: '.handle',
    disabled: false,
    ghostClass: 'placeholder',
    forceFallback: true,
  };
});

const raw = computed(() => {
  if (!store.value) {
    return null;
  }

  return _.map(store.value.data.value,
    (item, idx) => ({
      ...item,
      idx: idx + 1,
      to: {
        name: 'tutkinnonosa',
        params: {
          tutkinnonOsaId: item.id,
        },
      },
    }));
});

const items = computed({
  get() {
    if (!store.value) {
      return null;
    }

    return _.filter(raw.value, $filterBy('nimi', query.value));
  },
  set(value: any) {
    store.value!.setData(value);
  }
});

const fields = computed(() => {
  return [{
    key: 'idx',
    thStyle: { width: '4rem' },
    label: $t('no'),
    sortable: true,
  }, {
    key: 'nimi',
    label: $t('nimi'),
    sortable: true,
    sortByFormatted: true,
    thStyle: { width: '50%' },
    formatter: (value: any, key: any, item: any) => {
      if (item.tutkinnonOsa.nimi) {
        return $kaanna(item.tutkinnonOsa.nimi);
      }
      return $kaanna(value);
    },
  }, {
    key: 'laajuus',
    label: $t('laajuus'),
    sortable: true,
    sortByFormatted: true,
  }, {
    key: 'muokattu',
    label: $t('muokattu'),
    sortable: true,
    formatter: (value: any, key: any, item: any) => {
      if (item.luotu !== item.muokattu) {
        return $sdt(value);
      }
      return '';
    },
  }];
});

const peruste = computed(() => {
  return props.perusteStore.peruste.value;
});

const onProjektiChange = async () => {
  store.value = new EditointiStore(props.tutkinnonOsaStore);
};

const lisaaTutkinnonOsa = () => {
  router.push({
    name: 'tutkinnonosa',
    params: {
      tutkinnonOsaId: 'uusi',
    },
  });
};

const tuoTutkinnonOsa = () => {
  (tutkinnonosaTuontiModal.value as any).show();
};

const refresh = async () => {
  await onProjektiChange();
  await props.perusteStore.updateNavigation();
};

// Initialize component when mounted
onMounted(async () => {
  await onProjektiChange();
});

// Watch for changes in projektiId or perusteId
watch([() => props.projektiId, () => props.perusteId], async () => {
  if (props.projektiId && props.perusteId) {
    await onProjektiChange();
  }
});
</script>

<style lang="scss" scoped>
</style>
