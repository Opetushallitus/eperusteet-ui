<template>
  <div v-if="isEditable">
    <div v-for="(bullet, idx) in state" :key="idx" class="d-flex mb-1">
      <div class="flex-grow-1">
        <ep-input :value="bullet" @input="onInput($event, idx)" :is-editing="true" />
      </div>
      <div class="flex-shrink-1" v-if="allowStructureChange">
        <b-button variant="link" @click="remove(idx)">
          <EpMaterialIcon>delete</EpMaterialIcon>
        </b-button>
      </div>
    </div>
    <div class="mt-2" v-if="allowStructureChange">
      <ep-button variant="outline-primary" icon="add" @click="add">
        <slot name="add">
          {{ $t('lisaa') }}
        </slot>
      </ep-button>
    </div>
  </div>
  <div v-else>
    <ul>
      <li v-for="(bullet, idx) in modelValue" :key="idx">
        {{ $kaanna(bullet) }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  modelValue: { [lang: string]: string }[];
  isEditable?: boolean;
  allowStructureChange?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const state = ref<{ [lang: string]: string }[]>([]);

watch(() => props.modelValue, (value) => {
  state.value = value || [];
}, { immediate: true });

const add = () => {
  state.value.push({});
  emit('update:modelValue', [...state.value]);
};

const remove = (idx: number) => {
  state.value.splice(idx, 1);
  emit('update:modelValue', [...state.value]);
};

const onInput = (value: any, idx: number) => {
  state.value[idx] = value;
  emit('update:modelValue', [...state.value]);
};
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

ul {
  padding: 10px;
}
</style>
