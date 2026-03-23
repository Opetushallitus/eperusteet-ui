<template>
  <ep-button
    v-if="isEditing"
    variant="link"
    icon="edit"
    @click="show"
  />
  <b-modal
    ref="modalRef"
    size="lg"
  >
    <template #modal-header>
      <h2>{{ $t('muokkaa-tutkinnon-laajuutta') }}</h2>
    </template>

    <template #modal-footer>
      <div class="d-flex justify-content-end w-100">
        <ep-button
          variant="link"
          @click="cancel"
        >
          {{ $t('peruuta') }}
        </ep-button>
        <ep-button @click="save">
          {{ $t('aseta-laajuus') }}
        </ep-button>
      </div>
    </template>

    <template #default>
      <b-form-group :label="$t('laajuus')">
        <div class="d-flex align-items-center">
          <div>
            <ep-input
              v-model="draft"
              type="number"
              is-editing
            />
          </div>
          <div class="ml-2">
            {{ $t('osaamispiste') }}
          </div>
        </div>
      </b-form-group>
    </template>
  </b-modal>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';

const props = defineProps<{
  isEditing: boolean;
  modelValue?: number | undefined;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number | undefined];
}>();

const draft = ref<number | undefined>();

const modalRef = useTemplateRef('modalRef');

function show() {
  draft.value = props.modelValue;
  (modalRef.value as any)?.show();
}

function save() {
  emit('update:modelValue', draft.value);
  (modalRef.value as any)?.hide();
}

function cancel() {
  (modalRef.value as any)?.hide();
}

defineExpose({
  show,
});
</script>
