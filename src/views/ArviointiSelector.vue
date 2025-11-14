<template>
  <div>
    <b-modal
      ref="modal"
      size="lg"
    >
      <template #modal-header>
        {{ $t('luo-uusi-arviointi') }}
      </template>
      <template #modal-footer>
        <ep-button
          variant="secondary"
          @click="onClose"
        >
          {{ $t('peruuta') }}
        </ep-button>
        <ep-button
          variant="primary"
          :disabled="!model"
          @click="onOk"
        >
          {{ $t('luo-uusi-arviointi') }}
        </ep-button>
      </template>

      <b-form-group :label="$t('arviointiasteikko')">
        <EpRadio
          v-for="asteikko in asteikot"
          :key="asteikko.id"
          v-model="model"
          :value="asteikko.id"
          :is-editing="true"
          @update:model-value="onInput"
        >
          <span class="text-wrap">
            <span
              v-for="(taso, idx) in asteikko.osaamistasot"
              :key="'taso-' + taso.id"
            >
              <span v-if="idx !== 0"> / </span>
              <EpExpandText :text="$kaanna(taso.otsikko)" />
            </span>
          </span>
        </EpRadio>
      </b-form-group>
    </b-modal>
    <ep-button
      variant="outline"
      icon="add"
      @click="onOpen"
    >
      <slot name="valinta">
        {{ $t('valitse-arviointiasteikko') }}
      </slot>
    </ep-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useTemplateRef } from 'vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';
import EpExpandText from '@shared/components/EpExpandText/EpExpandText.vue';
import EpRadio from '@shared/components/forms/EpRadio.vue';

const props = defineProps<{
  modelValue: number | null;
  arviointiStore: ArviointiStore;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number | null];
}>();

const modal = useTemplateRef('modal');
const model = ref<number | null>(null);

watch(() => props.modelValue, (value: number | null) => {
  model.value = value;
}, { immediate: true });

const asteikot = computed(() => {
  return props.arviointiStore.arviointiasteikot.value;
});

const onInput = (value: number | null) => {
  model.value = value;
};

const onOk = () => {
  emit('update:modelValue', model.value);
  model.value = null;
  (modal.value as any)?.hide();
};

const onClose = () => {
  model.value = null;
  (modal.value as any)?.hide();
};

const onOpen = () => {
  (modal.value as any)?.show();
};
</script>

<style lang="scss" scoped>
</style>
