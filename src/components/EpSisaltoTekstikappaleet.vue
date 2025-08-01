<template>
  <ep-collapse
    class="collapsable"
    :collapsable="isEditing"
    :border-bottom="borderBottom"
  >
    <template #header>
      <h3
        v-if="isEditing"
        class="mt-4"
      >
        {{ $t('tekstikappaleet') }}
      </h3>
    </template>

    <ep-collapse
      v-for="(avain, index) in sisaltoTekstiAvaimet"
      :key="avain"
      class="collapsable"
      :collapsable="!isEditing"
      :border-bottom="isEditing"
      :class="{'mb-4': !isEditing}"
    >
      <template #header>
        <h4
          v-if="!isEditing"
          class="mb-0"
        >
          <span v-if="model[avain][sisaltoTekstiOtsikkoField]">{{ $kaanna(model[avain][sisaltoTekstiOtsikkoField]) }}</span>
          <span v-else>{{ $t(avain) }}</span>
        </h4>
      </template>
      <h4
        v-if="isEditing"
        class="mt-4"
      >
        {{ $t('tekstikappaleen-otsikko') }}
      </h4>
      <ep-input
        v-if="isEditing"
        v-model="model[avain][sisaltoTekstiOtsikkoField]"
        :is-editing="isEditing"
        :placeholder="$t(avain)"
      />

      <h4
        v-if="isEditing"
        class="mt-4"
      >
        {{ $t('tekstikappaleen-sisalto') }}
      </h4>
      <ep-content
        v-model="model[avain].teksti"
        layout="normal"
        :is-editable="isEditing"
      />

      <div
        v-if="isEditing"
        class="d-flex justify-content-between mt-1"
      >
        <ep-button
          v-if="index+1 === sisaltoTekstiAvaimet.length && vapaatTekstit.length === 0"
          variant="outline-primary"
          icon="add"
          @click="lisaaTekstikappale()"
        >
          {{ $t('lisaa-tekstikappale') }}
        </ep-button>
        <div v-else />

        <ep-button
          variant="link"
          icon="delete"
          @click="poistaSisaltoteksti(avain)"
        >
          {{ $t('poista-tekstikappale') }}
        </ep-button>
      </div>
    </ep-collapse>

    <EpDraggableCollapse
      v-model="model.vapaatTekstit"
      :is-editing="isEditing"
    >
      <template #header="{data}">
        <template v-if="!isEditing">
          <h4>{{ $kaanna(data.nimi) }}</h4>
        </template>
      </template>

      <template #default="{data}">
        <h4
          v-if="isEditing"
          class="otsikko"
        >
          {{ $t('tekstikappaleen-otsikko') }}
        </h4>
        <ep-input
          v-if="isEditing"
          v-model="data.nimi"
          :is-editing="isEditing"
        />

        <h4
          v-if="isEditing"
          class="mt-4"
        >
          {{ $t('tekstikappaleen-sisalto') }}
        </h4>
        <ep-content
          v-model="data.teksti"
          layout="normal"
          :is-editable="isEditing"
        />

        <div
          v-if="isEditing"
          class="d-flex justify-content-between mt-1"
        >
          <ep-button
            variant="outline-primary"
            icon="add"
            @click="lisaaTekstikappale()"
          >
            {{ $t('lisaa-tekstikappale') }}
          </ep-button>

          <ep-button
            variant="link"
            icon="delete"
            @click="poistaTeksti(data)"
          >
            {{ $t('poista-tekstikappale') }}
          </ep-button>
        </div>
      </template>
    </EpDraggableCollapse>

    <ep-button
      v-if="isEditing && sisaltoTekstiAvaimet.length === 0 && vapaatTekstit.length === 0"
      variant="outline-primary"
      icon="add"
      @click="lisaaTekstikappale()"
    >
      {{ $t('lisaa-tekstikappale') }}
    </ep-button>
  </ep-collapse>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed } from 'vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpDraggableCollapse from '@shared/components/EpDraggableCollapse/EpDraggableCollapse.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  modelValue: any;
  sisaltoTekstiOtsikkoField?: string;
  isEditing?: boolean;
  sisaltoAvaimet: string[];
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

const sisaltoTekstiAvaimet = computed(() => {
  return _.filter(props.sisaltoAvaimet, avain => !!_.get(model.value, avain));
});

const poistaSisaltoteksti = (avain: string) => {
  model.value = {
    ...model.value,
    [avain]: null,
  };
};

const poistaTeksti = (poistettavaTeksti: any) => {
  model.value = {
    ...model.value,
    vapaatTekstit: _.filter(model.value.vapaatTekstit, teksti => teksti !== poistettavaTeksti),
  };
};

const lisaaTekstikappale = () => {
  model.value = {
    ...model.value,
    vapaatTekstit: [
      ...model.value.vapaatTekstit,
      {},
    ],
  };
};

const vapaatTekstit = computed(() => {
  return model.value.vapaatTekstit || [];
});

const borderBottom = computed(() => {
  return (!props.isEditing && (sisaltoTekstiAvaimet.value.length > 0 || model.value.vapaatTekstit?.length > 0)) || (props.isEditing && (sisaltoTekstiAvaimet.value.length === 0 && model.value.vapaatTekstit?.length === 0));
});

</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
  .collapsable :deep(.ep-collapse) {
    padding: 0 !important;
  }

  .otsikko {
    line-height: 1.5;
  }

</style>
