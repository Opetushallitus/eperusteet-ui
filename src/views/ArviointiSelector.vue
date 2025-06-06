<template>
  <div>
    <b-modal ref="modal" size="lg">
      <template #modal-header>
        {{$t('luo-uusi-arviointi')}}
      </template>
      <template v-slot:modal-footer>
        <ep-button variant="secondary" @click="onClose">{{ $t('peruuta') }}</ep-button>
        <ep-button variant="primary" :disabled="!model" @click="onOk">{{ $t('luo-uusi-arviointi') }}</ep-button>
      </template>

      <b-form-group :label="$t('arviointiasteikko')">
        <b-form-radio-group v-model="model" @change="onInput" stacked>
          <b-form-radio :value="asteikko.id" v-for="asteikko in asteikot" :key="asteikko.id">
            <span class="text-wrap">
              <span v-for="(taso, idx) in asteikko.osaamistasot" :key="'taso-' + taso.id">
                <span v-if="idx !== 0" class="text-muted">/</span>
                <EpExpandText :text="$kaanna(taso.otsikko)" />
              </span>
            </span>
          </b-form-radio>
        </b-form-radio-group>
      </b-form-group>
    </b-modal>
    <ep-button @click="onOpen" variant="outline" icon="add">
      <slot name="valinta">{{ $t('valitse-arviointiasteikko') }}</slot>
    </ep-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useTemplateRef } from 'vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';
import EpExpandText from '@shared/components/EpExpandText/EpExpandText.vue';

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
