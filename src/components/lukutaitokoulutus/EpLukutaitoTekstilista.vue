<template>
  <div>
    <VueDraggable
      v-bind="dragOptions"
      v-model="model"
      tag="div"
    >
      <div
        v-for="(teksti, index) in model"
        :key="'teksti' + index"
        class="flex items-center pb-2"
      >
        <div class="grow">
          <EpInput
            v-model="model[index]"
            :is-editing="true"
          >
            <template #left>
              <div class="order-handle tekstilista-handle m-1">
                <EpMaterialIcon>drag_indicator</EpMaterialIcon>
              </div>
            </template>
          </EpInput>
        </div>
        <div
          class="default-icon clickable ml-3"
          @click="poista(index)"
        >
          <EpMaterialIcon
            icon-shape="outlined"
            :color="'inherit'"
          >
            delete
          </EpMaterialIcon>
        </div>
      </div>
    </VueDraggable>

    <div class="flex justify-between items-center">
      <EpButton
        variant="outline"
        icon="add"
        @click="lisaa()"
      >
        {{ $t(lisaaTeksti) }}
      </EpButton>
      <slot name="toiminnot" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  modelValue: any[];
  lisaaTeksti: string;
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

const dragOptions = computed(() => ({
  ...DEFAULT_DRAGGABLE_PROPERTIES,
  emptyInsertThreshold: 10,
  handle: '.tekstilista-handle',
  disabled: false,
  group: {
    name: 'lukutaitotekstilista',
  },
}));

const lisaa = () => {
  model.value = [...model.value, {}];
};

const poista = (index: number) => {
  model.value = model.value.filter((_, i) => i !== index);
};
</script>
