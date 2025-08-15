<template>
  <div class="row">
    <div class="col-xl-3 col-md-3 col-sm-12">
      <ep-form-content name="aikavertailu">
        <ep-multi-select
          id="tilaFilter"
          v-model="model.tyyppi"
          :multiple="false"
          :is-editing="true"
          :options="aikavaliItems"
          :placeholder="$t('valitse')"
          track-by="value"
          label="text"
        />
      </ep-form-content>
    </div>

    <div class="col-xl-9 col-md-9 col-sm-12">
      <ep-form-content name="aikavali">
        <div
          class="d-flex align-items-center"
          :class="{'disabled-events' : !model.tyyppi}"
        >
          <ep-datepicker
            v-model="model.aikavaliAlku"
            :is-editing="true"
          />
          <span class="mx-2">-</span>
          <ep-datepicker
            v-model="model.aikavaliLoppu"
            :is-editing="true"
            end-of-day
          />
        </div>
      </ep-form-content>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@shared/utils/globals';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';

export interface AikavaliVertailu {
  tyyppi?: {
    text: string;
    value: string;
  };
  aikavaliAlku?: string;
  aikavaliLoppu?: string;
}

const props = defineProps<{
  modelValue: AikavaliVertailu;
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

const aikavaliItems = computed(() => {
  return [
    {
      text: $t('julkaistu'),
      value: 'julkaistu',
    },
    {
      text: $t('ensijulkaisu'),
      value: 'ensijulkaisu',
    },
    {
      text: $t('luotu'),
      value: 'luotu',
    },
  ];
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
