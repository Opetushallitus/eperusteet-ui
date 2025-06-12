<template>
  <div>
    <EpToggle v-model="liittyyMuutosmaarays" :isSWitch="false">
      {{$t('julkaisuun-liittyy-muutosmaarays')}}
    </EpToggle>

    <b-form-group class="mt-4" :label="$t('muutosmaarays')" v-if="liittyyMuutosmaarays">
      <div class="ei-muutosmaarayksia p-3" v-if="muutosmaaraykset && muutosmaaraykset.length === 0">
        <EpMaterialIcon>info</EpMaterialIcon>
        {{$t('muutosmaarayksia-ei-loytynyt')}} {{$t('voit-lisata-muutosmaarayksia')}}
        <router-link :to="{name: 'perusteenTiedot'}">{{$t('perusteen-tiedoista')}}</router-link>
      </div>

      <ep-multi-select
        v-if="muutosmaaraykset && muutosmaaraykset.length > 0"
        class="w-50" v-model="julkaisu.muutosmaarays" :options="muutosmaaraykset" track-by="id">
        <template v-slot:singleLabel="{ option }">{{ $kaanna(option.nimi) }} ({{ $sd(option.voimassaoloAlkaa) }} - )</template>
        <template v-slot:option="{ option }">{{ $kaanna(option.nimi) }} ({{ $sd(option.voimassaoloAlkaa) }} - )</template>
        <template v-slot:tag="{ option }">{{ $kaanna(option.nimi) }} ({{ $sd(option.voimassaoloAlkaa) }} - )</template>
      </ep-multi-select>
    </b-form-group>
  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed } from 'vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { MaaraysDto } from '@shared/api/eperusteet';
import { $t, $kaanna, $sd } from '@shared/utils/globals';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

const props = defineProps<{
  modelValue: any;
  muutosmaaraykset: MaaraysDto[];
}>();

const emit = defineEmits(['update:modelValue']);

const julkaisu = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const liittyyMuutosmaarays = computed({
  get() {
    return julkaisu.value.liittyyMuutosmaarays;
  },
  set(val) {
    julkaisu.value.liittyyMuutosmaarays = val;

    if (!val) {
      julkaisu.value.muutosmaarays = null;
    }
  },
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.ei-muutosmaarayksia {
  background-color: $blue-lighten-4;
}

</style>
