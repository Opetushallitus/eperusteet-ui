<template>
  <div>
    <b-form-group v-if="isEditing">
      <b-form-radio-group v-model="inner">
        <b-form-radio
          v-for="geneerinen in geneeriset"
          name="geneerinen"
          :value="geneerinen.id"
          :key="'geneerinen-' + geneerinen.id">
          {{ $kaanna(geneerinen.nimi) }}
        </b-form-radio>
      </b-form-radio-group>
    </b-form-group>
    <div v-else-if="valittuGeneerinen">
      <div class="mt-3 mb-4">
        <div class="font-weight-bold">{{ $t('arvioinnin-kohde') }}</div>
        <div>{{ $kaanna(valittuGeneerinen.kohde) }}</div>
      </div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th width="20%">{{ $t('osaamistaso') }}</th>
            <th>{{ $t('kriteerit') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ot, idx) in valittuGeneerinen.osaamistasot" :key="'ot-' + idx">
            <td>{{ $kaanna(ot.otsikko) }}</td>
            <td>
              <ul class="pl-4">
                <li v-for="(kriteeri, idx) in ot.kriteerit" :key="idx">
                  {{ $kaanna(kriteeri) }}
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <EpAlert :text="$t('ei-valittu')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import { LokalisoituTekstiDto } from '@shared/tyypit';
import { ArviointiStore } from '@/stores/ArviointiStore';
import _ from 'lodash';
import { $t, $kaanna } from '@shared/utils/globals';

export interface YhdistettyOsaamistaso {
  otsikko?: LokalisoituTekstiDto;
  kriteerit?: any[];
}

export interface YhdistettyGeneerinen {
  nimi?: LokalisoituTekstiDto;
  kohde?: LokalisoituTekstiDto;
  osaamistasot?: YhdistettyOsaamistaso[],
}

const props = defineProps<{
  arviointiStore: ArviointiStore;
  isEditing?: boolean;
  modelValue: number;
}>();

const emit = defineEmits(['update:modelValue']);

const inner = computed({
  get() {
    return props.modelValue;
  },
  set(value: number) {
    emit('update:modelValue', value);
  },
});

const arviointiasteikot = computed(() => {
  return props.arviointiStore.arviointiasteikot.value;
});

const kaikkiGeneeriset = computed(() => {
  return props.arviointiStore.geneeriset.value;
});

const valittuGeneerinen = computed((): YhdistettyGeneerinen | null => {
  if (!props.modelValue) {
    return null;
  }

  const geneerinen = _.first(_.filter(kaikkiGeneeriset.value,
    g => g.id === Number(props.modelValue)));

  if (!geneerinen) {
    return null;
  }

  const asteikko = _.first(_.filter(arviointiasteikot.value,
    g => g.id === Number((geneerinen as any)._arviointiAsteikko)));

  if (!asteikko) {
    return null;
  }

  const kriteeriMap = _.keyBy(geneerinen.osaamistasonKriteerit, '_osaamistaso');

  return {
    nimi: geneerinen.nimi as any,
    kohde: geneerinen.kohde as any,
    osaamistasot: _.map(_.reverse(asteikko?.osaamistasot || []), (ot: any) => {
      return {
        otsikko: ot.otsikko as any,
        kriteerit: kriteeriMap[ot.id!]!.kriteerit!,
      };
    }),
  };
});

const geneeriset = computed(() => {
  return _.filter(props.arviointiStore.geneeriset.value, 'julkaistu');
});
</script>

<style lang="scss" scoped>
</style>
