<template>
  <div>
    <draggable v-bind="defaultDragOptions"
               tag="div"
               v-model="model">
      <div v-for="(arvioinninKohdeAlue, index) in model" :key="'arvioinninKohdeAlue' + index" class="arviointi">
        <div v-if="isEditing" class="order-handle">
          <EpMaterialIcon>drag_indicator</EpMaterialIcon>
        </div>
        <EpArviointi class="w-100"
                     v-model="model[index]"
                     :isEditing="isEditing"
                     :arviointiasteikot="arviointiasteikot">

          <template #poisto>
            <div>
              <EpButton v-if="isEditing" variant="link" icon="delete" @click="poistaArvioinninKohdealue(arvioinninKohdeAlue)">{{$t('poista-ammattitaitovaatimus-tekemisena')}}</EpButton>
            </div>
          </template>
        </EpArviointi>
      </div>
    </draggable>

    <EpButton v-if="isEditing"
              class="mt-3"
              variant="outline"
              icon="add"
              @click="lisaaArvioinninKohdeAlue">
        {{$t(lisaaBtnTeksti)}}
      </EpButton>
  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import draggable from 'vuedraggable';
import { computed } from 'vue';
import EpArviointi from '@/views/tutkinnonosat/EpArviointi.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  modelValue: any[];
  isEditing: boolean;
  arviointiasteikot: any;
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

function lisaaArvioinninKohdeAlue() {
  model.value = [
    ...model.value,
    {
      arvioinninKohteet: [],
    },
  ];
}

function poistaArvioinninKohdealue(arvioinninKohdeAlue: any) {
  model.value = _.filter(model.value, arv => arv !== arvioinninKohdeAlue);
}

const lisaaBtnTeksti = computed(() => {
  if (_.size(model.value) > 0) {
    return 'lisaa-ammattitaitovaatimus-tekemisena';
  }

  return 'lisaa-tutkinnon-osa-kohtainen-arviointi';
});

const defaultDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
  };
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

.arviointi {
  @include tile-background-shadow;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  display: flex;
}

</style>
