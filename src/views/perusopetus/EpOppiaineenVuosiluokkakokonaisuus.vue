<template>
  <div>
    <EpSisaltoTekstikappaleet v-model="model" :isEditing="isEditing" :sisaltoAvaimet="['tehtava', 'ohjaus', 'tyotavat', 'arviointi']" />

    <b-form-group class="mt-4 pt-3">
      <template v-slot:label>
        <h4 class="mb-0" v-if="model.sisaltoalueinfo">
          <span v-if="model.sisaltoalueinfo.otsikko">{{$kaanna(model.sisaltoalueinfo.otsikko)}}</span>
          <span v-else>{{$t('sisaltoalueet-vuosiluokilla-' + vuosiluokat)}}</span>
        </h4>
      </template>
      <EpSisaltoalueetEditModal v-model="model" :vuosiluokat="vuosiluokat" :isEditing="isEditing" :perusteId="perusteId" :oppiaineId="oppiaineId"/>
    </b-form-group>

    <hr class="mt-4"/>

    <b-form-group :label="$t('opetuksen-tavoitteet-vuosiluokilla-' + vuosiluokat)" class="mt-4 pt-3">
      <VueDraggable
        v-bind="tavoitteetDragOptions"
        tag="div"
        v-model="model.tavoitteet">
        <EpCollapse
          v-for="(tavoite, tavoiteIndex) in model.tavoitteet"
          :key="'tavoite'+tavoiteIndex"
          class="tavoite p-3 mb-4 w-100"
          :borderBottom="false"
          :usePadding="false">

          <template #header>
            <div class="d-flex">
              <div class="order-handle mr-3" v-if="isEditing">
                <EpMaterialIcon v-if="isEditing">drag_indicator</EpMaterialIcon>
              </div>
              <h4 class="mb-0" v-html="$kaanna(tavoite.tavoite)"></h4>
            </div>
          </template>

          <EpOppiaineenTavoite v-model="model.tavoitteet[tavoiteIndex]" :isEditing="isEditing" :supportData="vlkSupportData" @poista="poistaTavoite(tavoite)"/>

        </EpCollapse>
      </VueDraggable>

      <ep-button @click="lisaaTavoite" variant="outline" icon="add" v-if="isEditing">
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
