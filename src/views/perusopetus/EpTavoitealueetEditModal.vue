<template>
  <div>
    <ep-button
      v-if="isEditing"
      icon="edit"
      variant="link"
      class="muokkaa mb-3 ml-1"
      @click="avaa"
    >
      {{ $t('muokkaa-tavoitealueita') }}
    </ep-button>

    <EpSortableTextList
      v-model="model.kohdealueet"
      :is-editing="false"
      group="tavoitealueet"
      :sortable="false"
    >
      <template #input="{model}">
        <EpInput
          v-model="model.nimi"
          :is-editing="false"
        />
      </template>
      <template #li="{model}">
        {{ $kaanna(model.nimi) }}
      </template>
    </EpSortableTextList>

    <b-modal
      v-if="isEditing"
      ref="EpSisaltoalueetEditModal"
      :title="$t('tavoitealueet-kaikilla-vuosiluokilla')"
      size="xl"
    >
      <template #modal-header>
        <div class="d-flex justify-content-between w-100">
          <div>{{ $t('tavoitealueet-kaikilla-vuosiluokilla') }}</div>
          <ep-kielivalinta />
        </div>
      </template>

      <EpSortableTextList
        v-model="model.kohdealueet"
        :is-editing="true"
        group="tavoitealueet"
        :sortable="false"
      >
        <template #input="{model}">
          <EpInput
            v-model="model.nimi"
            :is-editing="true"
          />
        </template>
        <template #li="{model}">
          {{ $kaanna(model.nimi) }}
        </template>
        <template #default>
          {{ $t('lisaa-tavoitealue') }}
        </template>
      </EpSortableTextList>

      <template #modal-footer>
        <div>
          <ep-button
            variant="link"
            @click="peruuta"
          >
            {{ $t('peruuta') }}
          </ep-button>
          <ep-button
            :show-spinner="tallennetaan"
            @click="tallenna"
          >
            {{ $t('tallenna') }}
          </ep-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed, ref, useTemplateRef } from 'vue';
import EpSortableTextList from '@shared/components/EpSortableTextList/EpSortableTextList.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { PerusopetusOppiaineStore } from '@/stores/PerusopetusOppiaineStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { $kaanna, $t, $fail } from '@shared/utils/globals';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    required: false,
    default: false,
  },
  oppiaineId: {
    type: [String, Number],
    required: true,
  },
  perusteId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const tempModel = ref<any | null>(null);
const tallennetaan = ref(false);
const EpSisaltoalueetEditModal = useTemplateRef('EpSisaltoalueetEditModal');

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const avaa = () => {
  tempModel.value = _.cloneDeep(model.value);
  EpSisaltoalueetEditModal.value.show();
};

const sulje = () => {
  tallennetaan.value = false;
  EpSisaltoalueetEditModal.value.hide();
};

const tallenna = async () => {
  tallennetaan.value = true;
  try {
    model.value.kohdealueet = await PerusopetusOppiaineStore.saveTavoitealueet(props.perusteId, props.oppiaineId, model.value.kohdealueet);
    sulje();
  }
  catch (e) {
    $fail($t('virhe-palvelu-virhe') as string);
  }
  finally {
    tallennetaan.value = false;
  }
};

const peruuta = () => {
  model.value = tempModel.value!;
  sulje();
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

  :deep(ul) {
    padding-inline-start: 25px;
  }

  .muokkaa {
    :deep(.btn) {
      padding-left: 0px;
    }
  }
</style>
