<template>
  <div>
    <div
      v-for="(maarays, index) in model"
      :key="tyyppi+index"
    >
      <div class="d-flex w-100 mb-2 align-items-center">
        <EpMultiSelect
          class="w-100"
          :model-value="maarays"
          :placeholder="$t('valitse-maarays')"
          :is-editing="true"
          :search-identity="nimiSearchIdentity"
          :options="maarayksetNimella"
          @update:modelValue="asetaMaarays(index, $event)"
        >
          <template #singleLabel="{ option }">
            {{ $kaanna(option.nimi) }} <span v-if="option.diaarinumero">({{ option.diaarinumero }})</span>
          </template>
          <template #option="{ option }">
            {{ $kaanna(option.nimi) }} <span v-if="option.diaarinumero">({{ option.diaarinumero }})</span>
          </template>
        </EpMultiSelect>

        <div
          class="default-icon clickable ml-2"
          @click="poistaMaarays(maarays)"
        >
          <EpMaterialIcon>delete</EpMaterialIcon>
        </div>
      </div>
    </div>

    <ep-button
      variant="outline"
      icon="add"
      @click="lisaaMaarays()"
    >
      {{ $t('lisaa-maarays') }}
    </ep-button>
  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed } from 'vue';
import EpMaterialIcon from '@shared/components//EpMaterialIcon/EpMaterialIcon.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { nimiSearchIdentity } from '@shared/utils/helpers';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { MaaraysKevytDto } from '@shared/api/eperusteet';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  modelValue: MaaraysKevytDto[];
  maarayksetNimella: MaaraysKevytDto[];
  tyyppi?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const poistaMaarays = (maarays) => {
  model.value = _.without(model.value, maarays);
};

const lisaaMaarays = () => {
  model.value = [
    ...model.value,
    {},
  ];
};

const asetaMaarays = (index, asetettavaMaarays) => {
  model.value = _.map(model.value, (maarays, ind) => ind === index ? asetettavaMaarays : maarays);
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
