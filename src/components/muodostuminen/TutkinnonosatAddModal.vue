<template>
  <b-modal
    ref="tutkinnonosatModal"
    size="xl"
    :cancelTitle="$t('peruuta')">

    <template #modal-header>
      <h2 >{{ $t('liita-tutkinnon-osia-ryhmaan') }}</h2>
    </template>

    <template #modal-footer>
      <div class="d-flex justify-content-end w-100">
        <ep-button @click="cancel" variant="link">
          {{$t('peruuta')}}
        </ep-button>
        <ep-button @click="save">
          {{$t('liita-valitut-tutkinnon-osat')}}
        </ep-button>
      </div>
    </template>

    <template #default>

      <ep-search v-model="queryTutkinnonOsa" :placeholder="$t('etsi-tutkinnon-osaa')" />
      <div class="ml-1 mt-1">
        <ep-toggle v-model="showUnusedTutkinnonOsat" :isSWitch="false">
          <span class="noselect">
            {{ $t('nayta-kayttamattomat') }}
          </span>
        </ep-toggle>
      </div>

      <div class="font-weight-600 mt-4">{{$t('valittu')}} {{selected.length}} {{$t('kpl')}}</div>
      <b-table
        striped
        responsive
        borderless
        fixed
        hover
        :current-page="sivu"
        :per-page="10"
        :items="items"
        :fields="fields"
        :selectable="true"
        @row-selected="onRowSelected"
        select-mode="single"
        selected-variant=''>

        <template v-slot:cell(nimi)="{ item }">
          <EpMaterialIcon v-if="item.selected" class="checked mr-2">check_box</EpMaterialIcon>
          <EpMaterialIcon v-else class="checked mr-2">check_box_outline_blank</EpMaterialIcon>
          {{ $kaanna(item.nimi) }}
        </template>
      </b-table>
      <b-pagination
          v-model="sivu"
          :total-rows="items.length"
          :per-page="10"
          aria-controls="tutkinnonosat"
          align="center" />
    </template>
  </b-modal>
</template>

<script setup lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import * as _ from 'lodash';
import { ref, computed, useTemplateRef, inject } from 'vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna } from '@shared/utils/globals';

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
  if (!_.isEmpty(items)) {
    const row = items[0];

    if (_.includes(_.map(selected.value, '_tutkinnonOsa'), _.get(row, '_tutkinnonOsa'))) {
      selected.value = _.filter(selected.value, tosa => tosa._tutkinnonOsa !== row._tutkinnonOsa);
    }
    else {
      selected.value = [
        ...selected.value,
        row,
      ];
    }
  }
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
