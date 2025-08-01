<template>
  <div v-if="inner">
    <b-form-group :label="$t('laajuus')">
      <ep-laajuus-input
        v-model="inner.laajuus"
        :is-editing="isEditing"
      />
    </b-form-group>
    <b-form-group>
      <h4>{{ $t('osaamistavoitteet') }}</h4>
      <EpAmmattitaitovaatimukset
        v-model="tavoitteet"
        :kohdealueettomat="false"
        :kaannos-tavoiteet="$t('tavoitteet')"
        :kaannos-lisaa-kohdealue="$t('lisaa-tavoiteryhma')"
        :kaannos-lisaa-ammattitaitovaatimus="$t('lisaa-tavoite')"
        kaannos-kohdealueet=""
        :kaannos-kohdealue="$t('tavoitteiden-otsikko')"
        :kaannos-vaatimukset="$t('tavoitteet')"
        :kohde="{ fi: $t('opiskelija') }"
        :tavoitekoodisto="'osaamistavoitteet'"
        :show-kohde="true"
        :is-editing="isEditing"
      />
    </b-form-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import EpAmmattitaitovaatimukset from '@shared/components/EpAmmattitaitovaatimukset/EpAmmattitaitovaatimukset.vue';
import { $t } from '@shared/utils/globals';
import _ from 'lodash';

const props = defineProps<{
  modelValue: Object;
  isValinnainen: boolean;
  isEditing?: boolean;
  validation?: Object;
}>();

const emit = defineEmits(['update:modelValue']);

const inner = computed({
  get() {
    return props.modelValue || {
      laajuus: 0,
      tavoitteet: {},
    };
  },
  set(v) {
    emit('update:modelValue', v);
  },
});

const tavoitteet = computed({
  get() {
    return inner.value.tavoitteet || null;
  },
  set(tavoitteet) {
    emit('update:modelValue', {
      ...inner.value,
      tavoitteet,
    });
  },
});
</script>

<style lang="scss" scoped>
</style>
