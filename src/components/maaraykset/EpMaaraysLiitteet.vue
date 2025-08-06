<template>
  <div>
    <ep-tiedosto-lataus
      v-if="isEditing && (liitteet.length === 0 || !yksittainen)"
      ref="liitelataus"
      :file-types="['application/pdf']"
      :as-binary="true"
      :file-max-size="LIITE_MAX_KOKO"
      @update:modelValue="lisaaLiite($event)"
    />

    <div
      v-if="liitteet.length > 0 && !yksittainen"
      class="row mt-4 ml-1"
    >
      <div class="col font-weight-bold border-bottom ml-0 pl-0 pb-2">
        {{ $t('nimi') }}
      </div>
      <div class="col font-weight-bold border-bottom ml-0 pl-0 pb-2">
        {{ $t('tiedosto') }}
      </div>
    </div>
    <div
      v-for="(liite, index) in liitteet"
      :key="'liite' + index"
      class="row mt-2 align-items-center"
    >
      <div
        v-if="nimisyote"
        class="col"
      >
        <ep-input
          v-model="liite.nimi"
          :is-editing="isEditing"
        />
      </div>
      <div class="col d-flex">
        <a
          v-if="liite.url"
          :href="liite.url"
          target="_blank"
          rel="noopener noreferrer"
        >{{ liite.tiedostonimi }}</a>
        <span v-else>{{ liite.tiedostonimi }}</span>
        <div
          v-if="isEditing"
          class="default-icon clickable ml-2"
          @click="poistaLiite(liite)"
        >
          <EpMaterialIcon>delete</EpMaterialIcon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed, useTemplateRef } from 'vue';
import EpTiedostoLataus from '@shared/components/EpTiedosto/EpTiedostoLataus.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { MaaraysLiiteDtoTyyppiEnum } from '@shared/api/eperusteet';
import { Kielet } from '@shared/stores/kieli';
import { $t } from '@shared/utils/globals';
import { ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  isEditing: {
    type: Boolean,
    required: false,
  },
  tyyppi: {
    type: String as () => MaaraysLiiteDtoTyyppiEnum,
    required: true,
  },
  yksittainen: {
    type: Boolean,
    default: false,
  },
  nimisyote: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);
const liitelatausRef = useTemplateRef('liitelataus');
const LIITE_MAX_KOKO = 99 * 1024 * 1024;

const model = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const liitteet = computed(() => {
  return _.filter(model.value, liite => liite.tyyppi === props.tyyppi);
});

const poistaLiite = (liite) => {
  model.value = _.without(model.value, liite);
};

const lisaaLiite = (liite) => {
  model.value = [
    ...model.value,
    {
      tiedostonimi: liite?.file?.name,
      tyyppi: props.tyyppi,
      fileB64: window.btoa(liite.binary),
      nimi: { [Kielet.getSisaltoKieli.value]: props.nimisyote ? '' : liite?.file?.name },
    },
  ];

  (liitelatausRef.value as any).resetFile();
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
