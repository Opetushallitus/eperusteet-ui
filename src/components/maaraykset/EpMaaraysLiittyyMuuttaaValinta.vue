<template>
  <div>
    <template v-if="isEditing">
      <EpRadio v-model="model.liittyyTyyppi" :value="EILIITY" :disabled="disabloidutValinnat.includes(EILIITY)">
        {{ $t('ei-liity-toiseen-maaraykseen') }}
      </EpRadio>
      <EpRadio v-model="model.liittyyTyyppi" :value="MUUTTAA">
        {{ $t('muuttaa-toista-maaraysta') }}
      </EpRadio>

      <div v-if="model.liittyyTyyppi === MUUTTAA" class="my-3 ml-4">
        <EpMaaraysLiittyyMaaraykseen v-model="model.muutettavatMaaraykset" :maarayksetNimella="maarayksetNimella" tyyppi="muuttaa"/>
      </div>

      <EpRadio v-model="model.liittyyTyyppi" :value="KORVAA">
        {{ $t('korvaa-toisen-maarayksen') }}
      </EpRadio>

      <div v-if="model.liittyyTyyppi === KORVAA" class="my-3 ml-4">
        <EpMaaraysLiittyyMaaraykseen v-model="model.korvattavatMaaraykset" :maarayksetNimella="maarayksetNimella" tyyppi="korvaa"/>
      </div>
    </template>
    <template v-else-if="model.muutettavatMaaraykset.length > 0 || model.korvattavatMaaraykset.length > 0">
      <ul>
        <li v-for="(muuttaa, index) in model.muutettavatMaaraykset" :key="'muuttaa' + index">
          <router-link :to="{ name: 'maaraysMuokkaus', params: { maaraysId: muuttaa.id } }">
            {{$kaanna(muuttaa.nimi)}}
          </router-link>
        </li>
        <li v-for="(korvaa, index) in model.korvattavatMaaraykset" :key="'korvaa' + index">
          <router-link :to="{ name: 'maaraysMuokkaus', params: { maaraysId: korvaa.id } }">
            {{$kaanna(korvaa.nimi)}}
          </router-link>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { MaaraysDto, MaaraysDtoLiittyyTyyppiEnum, MaaraysKevytDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { computed } from 'vue';
import EpMaaraysLiittyyMaaraykseen from '@/components/maaraykset/EpMaaraysLiittyyMaaraykseen.vue';
import { $t, $kaanna } from '@shared/utils/globals';
import EpRadio from '@shared/components/forms/EpRadio.vue';

const EILIITY = MaaraysDtoLiittyyTyyppiEnum.EILIITY;
const MUUTTAA = MaaraysDtoLiittyyTyyppiEnum.MUUTTAA;
const KORVAA = MaaraysDtoLiittyyTyyppiEnum.KORVAA;

const props = defineProps({
  modelValue: {
    type: Object as () => MaaraysDto,
    required: true,
  },
  isEditing: {
    type: Boolean,
    required: false,
  },
  maarayksetNimella: {
    type: Array as () => MaaraysKevytDto[],
    required: false,
    default: () => [],
  },
  disabloidutValinnat: {
    type: Array as () => MaaraysDtoLiittyyTyyppiEnum[],
    required: false,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const isRequired = computed(() => {
  return props.isEditing ? ' *' : '';
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
