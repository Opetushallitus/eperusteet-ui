<template>
  <div>

    <template v-if="isEditing">
      <EpMultiSelect v-model="model"
                 :placeholder="$t('maarays-asiasanat-placeholder')"
                 :tagPlaceholder="$t('maarays-asiasanat-lisays-placeholder')"
                 :search-identity="identity"
                 :options="valittavatAsiasanat"
                 :maxHeight="500"
                 :multiple="true"
                 :closeOnSelect="false"
                 :taggable="true"
                 @tag="lisaaAsiasana">

        <template #option="{ option }">
          <span v-if="option.label">{{ option.label }}</span>
          <span v-else>{{ option }}</span>
        </template>

        <template v-slot:checkbox><span/></template>

        <template #selection="{ values }">
          <div class="d-flex align-items-center" :class="{'mb-2': values.length > 0}">
            <span class="multiselect__tag" v-for="value in values" :key="'value' + value">
              <span class="nimi">{{ value }}</span>
              <span class="multiselect__tag-icon clickable" @click.prevent @mousedown.prevent.stop="poista(value)"/>
            </span>

            <span v-if="values.length > 0" class="ml-auto clickable border-right pr-2 remove-all" @click.prevent @mousedown.prevent.stop="poistaKaikki()">
              <ep-material-icon>close</ep-material-icon>
            </span>
          </div>
        </template>
      </EpMultiSelect>
    </template>

    <ul v-else>
      <li v-for="(asiasana, index) in model" :key="'asiasana' + index">{{asiasana}}</li>
    </ul>

  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed } from 'vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { $t } from '@shared/utils/globals';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  asiasanat: {
    type: Array,
    required: true,
  },
  isEditing: {
    type: Boolean,
    required: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const valittavatAsiasanat = computed(() => {
  if (props.asiasanat && model.value) {
    return _.uniq([
      ...props.asiasanat,
      ...model.value,
    ]);
  }

  return [];
});

const identity = (asiasana) => {
  return asiasana;
};

const lisaaAsiasana = (uusiAsiasana) => {
  model.value = [
    ...model.value,
    uusiAsiasana,
  ];
};

const poista = (asiasana) => {
  model.value = _.without(model.value, asiasana);
};

const poistaKaikki = () => {
  model.value = [];
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

:deep(.multiselect__tags) {
  .multiselect__tag {
    .nimi {
      margin-left: 5px;
      margin-right: 5px;
    }
  }
}
</style>
