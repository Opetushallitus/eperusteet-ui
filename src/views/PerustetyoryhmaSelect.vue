<template>
  <div>
    <div v-if="tyoryhmat && tyoryhmat.length > 0">
      <EpMultiSelect
        v-if="isEditing"
        v-model="inner"
        :placeholder="$t('valitse-tyoryhma')"
        :search-identity="tyoryhmaSearchIdentity"
        :options="tyoryhmat"
        :clear-on-select="true"
      >
        <template #singleLabel="{ option }">
          {{ $kaanna(option.nimi) }}
        </template>
        <template #option="{ option }">
          {{ $kaanna(option.nimi) }}
        </template>
      </EpMultiSelect>
      <div v-else-if="inner">
        {{ $kaanna(inner.nimi) }}
      </div>
    </div>
    <EpSpinner
      v-else
      :small="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import * as _ from 'lodash';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  modelValue: string;
  ulkopuolisetStore: UlkopuolisetStore;
  isEditing?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const inner = computed({
  get() {
    return _.find(tyoryhmat.value, { oid: props.modelValue });
  },
  set(value: any) {
    emit('update:modelValue', value ? value.oid : null);
  },
});

onMounted(async () => {
  props.ulkopuolisetStore.fetchTyoryhmat();
});

const tyoryhmaSearchIdentity = (tr: any) => {
  return _.toLower($kaanna(tr.nimi));
};

const tyoryhmat = computed(() => {
  return _.sortBy(props.ulkopuolisetStore.tyoryhmat.value, tyoryhmaSearchIdentity);
});
</script>

<style lang="scss" scoped>

.tieto {
  padding: 20px;

  .nimi {
    font-weight: 600;
  }
}

</style>
