<template>
  <EpModal
    ref="tutkinnonosatModal"
    size="xl"
    @cancel="cancel"
  >
    <template #modal-title>
      <h2>{{ $t('liita-tutkinnon-osia-ryhmaan') }}</h2>
    </template>

    <template #modal-footer>
      <ep-button
        variant="link"
        @click="cancel"
      >
        {{ $t('peruuta') }}
      </ep-button>
      <ep-button @click="save">
        {{ $t('liita-valitut-tutkinnon-osat') }}
      </ep-button>
    </template>

    <template #default>
      <ep-search
        v-model="queryTutkinnonOsa"
        :placeholder="$t('etsi-tutkinnon-osaa')"
      />
      <div class="ml-1 mt-1">
        <ep-toggle
          v-model="showUnusedTutkinnonOsat"
          :is-s-witch="false"
        >
          <span class="noselect">
            {{ $t('nayta-kayttamattomat') }}
          </span>
        </ep-toggle>
      </div>

      <div class="font-semibold mt-4">
        {{ $t('valittu') }} {{ selected.length }} {{ $t('kpl') }}
      </div>
      <EpTable
        striped
        responsive
        borderless
        fixed
        hover
        data-key="_tutkinnonOsa"
        :current-page="sivu"
        :per-page="10"
        :items="items"
        :fields="fields"
        :selectable="true"
        select-mode="multiple"
        :selection="selected"
        @row-selected="onRowSelected"
      >
        <template #cell(nimi)="{ item }">
          {{ $kaanna(item.nimi) }}
        </template>
      </EpTable>
      <EpBPagination
        v-model="sivu"
        :total="items.length"
        :items-per-page="10"
        aria-controls="tutkinnonosat"
      />
    </template>
  </EpModal>
</template>

<script setup lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpModal from '@shared/components/EpModal/EpModal.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpTable from '@shared/components/EpTable/EpTable.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import * as _ from 'lodash';
import { ref, computed, useTemplateRef, inject } from 'vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna } from '@shared/utils/globals';
import EpBPagination from '@shared/components/EpBPagination/EpBPagination.vue';

const props = defineProps({
  tutkinnonosat: {
    type: Array,
    required: false,
  },
});

const emit = defineEmits(['save']);

const selected = ref([]);
const queryTutkinnonOsa = ref('');
const showUnusedTutkinnonOsat = ref(false);
const sivu = ref(1);

const tutkinnonosatModal = useTemplateRef('tutkinnonosatModal');

const kayttamattomatTutkinnonOsat = inject('kayttamattomatTutkinnonOsat', [] as any[]);

const show = () => {
  selected.value = [];
  sivu.value = 1;
  showUnusedTutkinnonOsat.value = false;
  queryTutkinnonOsa.value = '';
  (tutkinnonosatModal.value as any).show();
};

const save = () => {
  emit('save', selected.value);
  (tutkinnonosatModal.value as any).hide();
};

const cancel = () => {
  (tutkinnonosatModal.value as any).hide();
};

const items = computed(() => {
  if (!props.tutkinnonosat) {
    return null;
  }

  return _.chain(props.tutkinnonosat)
    .filter(tosa => !showUnusedTutkinnonOsat.value || _.includes(_.map(kayttamattomatTutkinnonOsat, '_tutkinnonOsa'), tosa._tutkinnonOsa))
    .filter((tosa) => {
      if (!queryTutkinnonOsa.value) {
        return true;
      }

      const search = queryTutkinnonOsa.value.toLowerCase();
      const nimi = $kaanna(tosa.nimi).toLowerCase();
      return nimi.includes(search);
    })
    .map(tutkinnonosa => {
      return {
        ...tutkinnonosa,
        selected: _.includes(_.map(selected.value, '_tutkinnonOsa'), _.get(tutkinnonosa, '_tutkinnonOsa')),
      };
    })
    .value();
});

const onRowSelected = (items) => {
  selected.value = items;
};

const fields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
  }, {
    key: 'laajuus',
    label: $t('osaamispiste'),
    thStyle: { width: '30%' },
  }];
});

defineExpose({
  show,
});
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

  .checked {
    color: $paletti-blue;
  }

  :deep(.filter) {
    max-width: 100%;
  }
</style>
