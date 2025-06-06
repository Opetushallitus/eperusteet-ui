<template>
  <b-row>
    <b-col cols="4">{{$kaanna(arviointiasteikko.osaamistasot[osaamistasonkriteeri._osaamistaso].otsikko)}}</b-col>
    <b-col class="d-flex flex-column">
      <template v-if="!isEditing">
        <ul>
          <li v-for="(kriteeri, kriteeriIndex) in osaamistasonkriteeri.kriteerit" :key="'kriteeri'+kriteeriIndex">
            {{$kaanna(osaamistasonkriteeri.kriteerit[kriteeriIndex])}}
          </li>
        </ul>
      </template>

      <template v-else>
        <draggable v-bind="defaultDragOptions"
                   tag="div"
                   v-model="osaamistasonkriteeri.kriteerit">
          <div v-for="(kriteeri, kriteeriIndex) in osaamistasonkriteeri.kriteerit" :key="'kriteeri'+kriteeriIndex" class="mb-2">
            <div class="d-flex">
              <EpInput class="w-100" :isEditing="isEditing" v-model="osaamistasonkriteeri.kriteerit[kriteeriIndex]">
                <template #left>
                  <div class="order-handle m-2">
                    <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                  </div>
                </template>
              </EpInput>
              <EpButton v-if="isEditing" variant="link" icon="delete" @click="poistaKriteeri(kriteeri)"/>
            </div>
          </div>
        </draggable>
        <EpButton :paddingx="false" v-if="isEditing" class="mb-3" variant="link" icon="add" @click="lisaaKriteeri()">
          {{ $t('lisaa-kriteeri') }}
        </EpButton>
      </template>
    </b-col>
  </b-row>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { $kaanna } from '@shared/utils/globals';
import * as _ from 'lodash';
import draggable from 'vuedraggable';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { $t } from '@shared/utils/globals';


const props = defineProps<{
  modelValue: any;
  isEditing: boolean;
  arviointiasteikko: any;
}>();

const emit = defineEmits(['update:modelValue']);


const osaamistasonkriteeri = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const lisaaKriteeri = async () => {
  osaamistasonkriteeri.value.kriteerit = [
    ...osaamistasonkriteeri.value.kriteerit,
    {},
  ];
};

const poistaKriteeri = async (poistettavaKriteeri) => {
  osaamistasonkriteeri.value.kriteerit = _.filter(osaamistasonkriteeri.value.kriteerit, kriteeri => kriteeri !== poistettavaKriteeri);
};

const defaultDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
  };
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
