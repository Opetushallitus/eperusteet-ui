<template>
  <div class="muodostuminen-laajuus-modal inline-block">
    <ep-button
      v-if="isEditing"
      variant="link"
      icon="edit"
      :text="$t('muokkaa-tutkinnon-laajuutta')"
      @click="show"
    />
    <ep-modal
      ref="modalRef"
      small
    >
      <template #modal-title>
        <h2>{{ $t('muokkaa-tutkinnon-laajuutta') }}</h2>
      </template>

      <template #modal-footer>
        <div class="flex justify-end w-full gap-4 items-center">
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
        <ep-form-group :label="$t('laajuus')">
          <div class="flex items-center">
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
        </ep-form-group>
      </template>
    </ep-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpModal from '@shared/components/EpModal/EpModal.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';

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
