<template>
  <div>
    <EpSisaltoTekstikappaleet
      v-model="model"
      :is-editing="isEditing"
      :sisalto-avaimet="['tehtava', 'ohjaus', 'tyotavat', 'arviointi']"
    />

    <b-form-group class="mt-4 pt-3">
      <template #label>
        <h4
          v-if="model.sisaltoalueinfo"
          class="mb-0"
        >
          <span v-if="model.sisaltoalueinfo.otsikko">{{ $kaanna(model.sisaltoalueinfo.otsikko) }}</span>
          <span v-else>{{ $t('sisaltoalueet-vuosiluokilla-' + vuosiluokat) }}</span>
        </h4>
      </template>
      <EpSisaltoalueetEditModal
        v-model="model"
        :vuosiluokat="vuosiluokat"
        :is-editing="isEditing"
        :peruste-id="perusteId"
        :oppiaine-id="oppiaineId"
      />
    </b-form-group>

    <hr class="mt-4">

    <b-form-group
      :label="$t('opetuksen-tavoitteet-vuosiluokilla-' + vuosiluokat)"
      class="mt-4 pt-3"
    >
      <VueDraggable
        v-bind="tavoitteetDragOptions"
        v-model="model.tavoitteet"
        tag="div"
      >
        <EpCollapse
          v-for="(tavoite, tavoiteIndex) in model.tavoitteet"
          :key="'tavoite'+tavoiteIndex"
          class="tavoite p-3 mb-4 w-100"
          :border-bottom="false"
          :use-padding="false"
        >
          <template #header>
            <div class="d-flex">
              <div
                v-if="isEditing"
                class="order-handle mr-3"
              >
                <EpMaterialIcon v-if="isEditing">
                  drag_indicator
                </EpMaterialIcon>
              </div>
              <h4
                class="mb-0"
                v-html="$kaanna(tavoite.tavoite)"
              />
            </div>
          </template>

          <EpOppiaineenTavoite
            v-model="model.tavoitteet[tavoiteIndex]"
            :is-editing="isEditing"
            :support-data="vlkSupportData"
            @poista="poistaTavoite(tavoite)"
          />
        </EpCollapse>
      </VueDraggable>

      <ep-button
        v-if="isEditing"
        variant="outline"
        icon="add"
        @click="lisaaTavoite"
      >
        {{ $t('lisaa-tavoite') }}
      </ep-button>
    </b-form-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { OppiaineenVuosiluokkaKokonaisuusDto } from '@shared/api/eperusteet';
import _ from 'lodash';
import EpSisaltoTekstikappaleet from '@/components/EpSisaltoTekstikappaleet.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpOppiaineenTavoite from '@/views/aipe/yleiset/EpOppiaineenTavoite.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { VueDraggable } from 'vue-draggable-plus';
import EpSisaltoalueetEditModal from '@/views/perusopetus/EpSisaltoalueetEditModal.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

const props = defineProps<{
  modelValue: OppiaineenVuosiluokkaKokonaisuusDto;
  isEditing?: boolean;
  vuosiluokat: string;
  supportData: any;
  oppiaineId: any;
  perusteId: any;
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

const tavoitteetDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !props.isEditing,
    group: {
      name: 'tavoitteet',
    },
  };
});

const lisaaTavoite = () => {
  model.value.tavoitteet = [
    ...model.value.tavoitteet!,
    {
      laajattavoitteet: [],
      arvioinninkohteet: [],
      sisaltoalueet: [],
      oppiaineenTavoitteenOpetuksenTavoitteet: [],
    },
  ];
};

const vlkSupportData = computed(() => {
  return {
    ...props.supportData,
    sisaltoalueet: model.value.sisaltoalueet,
  };
});

const poistaTavoite = (poistettavaTavoite) => {
  model.value.tavoitteet = _.reject(model.value.tavoitteet, poistettavaTavoite);
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

.tavoite {
  @include tile-background-shadow;
  border-radius: 10px;
}

</style>
