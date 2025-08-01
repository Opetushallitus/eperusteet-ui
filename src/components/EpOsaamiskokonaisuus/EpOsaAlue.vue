<template>
  <div>
    <div v-if="isEditing">
      <b-form-group>
        <template #label>
          <div class="d-flex justify-content-between">
            <div>{{ $t('osa-alueen-nimi') }}</div>
            <slot name="poisto" />
          </div>
        </template>
        <ep-input
          v-model="osaAlue.nimi"
          :is-editing="isEditing"
        />
      </b-form-group>

      <hr>

      <b-form-group
        v-for="(tasokuvaus, index) in osaAlue.tasokuvaukset"
        :key="'tasokuvaus' + index"
        :label="$t('osa-alue-otsiko-' + tasokuvaus.taso.toLowerCase())"
      >
        <VueDraggable
          v-bind="defaultDragOptions"
          v-model="tasokuvaus.kuvaukset"
          tag="div"
        >
          <b-row
            v-for="(kuvaus, kuvausIndex) in tasokuvaus.kuvaukset"
            :key="'kuvaus'+kuvausIndex"
            class="pb-2"
          >
            <b-col cols="11">
              <ep-input
                v-model="kuvaus[sisaltokieli]"
                :is-editing="isEditing"
                type="string"
                class="flex-grow-1"
              >
                <template #left>
                  <div class="order-handle m-2">
                    <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                  </div>
                </template>
              </ep-input>
            </b-col>
            <b-col cols="1">
              <div
                class="default-icon clickable mt-2"
                @click="poistaKuvaus('kuvaukset', kuvaus, tasokuvaus.taso)"
              >
                <EpMaterialIcon>delete</EpMaterialIcon>
              </div>
            </b-col>
          </b-row>
        </VueDraggable>

        <ep-button
          variant="outline"
          icon="add"
          class="mt-2"
          @click="lisaaKuvaus('kuvaukset', tasokuvaus.taso)"
        >
          {{ $t('lisaa-kuvaus') }}
        </ep-button>

        <template v-if="tasokuvaus.taso === 'VUOSILUOKKA_12' || tasokuvaus.taso === 'VUOSILUOKKA_3456' || tasokuvaus.taso === 'VUOSILUOKKA_789'">
          <div class="mt-3 mb-2">
            {{ $t('edistynyt-osaaminen') }}
          </div>
          <VueDraggable
            v-bind="defaultDragOptions"
            v-model="tasokuvaus.edistynytOsaaminenKuvaukset"
            tag="div"
          >
            <b-row
              v-for="(kuvaus, kuvausIndex) in tasokuvaus.edistynytOsaaminenKuvaukset"
              :key="'kuvaus'+kuvausIndex"
              class="pb-2"
            >
              <b-col cols="11">
                <ep-input
                  v-model="kuvaus[sisaltokieli]"
                  :is-editing="isEditing"
                  type="string"
                  class="flex-grow-1"
                >
                  <template #left>
                    <div class="order-handle m-2">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                  </template>
                </ep-input>
              </b-col>
              <b-col cols="1">
                <div
                  class="default-icon clickable mt-2"
                  @click="poistaKuvaus('edistynytOsaaminenKuvaukset', kuvaus, tasokuvaus.taso)"
                >
                  <EpMaterialIcon>delete</EpMaterialIcon>
                </div>
              </b-col>
            </b-row>
          </VueDraggable>

          <ep-button
            variant="outline"
            icon="add"
            class="mt-1"
            @click="lisaaKuvaus('edistynytOsaaminenKuvaukset', tasokuvaus.taso)"
          >
            {{ $t('lisaa-kuvaus') }}
          </ep-button>
        </template>

        <hr>
      </b-form-group>
    </div>

    <div v-else>
      <h3>{{ $kaanna(osaAlue.nimi) }}</h3>

      <div
        v-for="(tasokuvaus, index) in osaAlue.tasokuvaukset"
        :key="'tasokuvaus' + index"
      >
        <b-form-group
          v-if="(tasokuvaus.kuvaukset && tasokuvaus.kuvaukset.length > 0) || (tasokuvaus.edistynytOsaaminenKuvaukset && tasokuvaus.edistynytOsaaminenKuvaukset.length > 0)"
          class="mt-3"
          :label="$t('osa-alue-otsiko-' + tasokuvaus.taso.toLowerCase())"
        >
          <ul
            v-if="tasokuvaus.kuvaukset && tasokuvaus.kuvaukset.length > 0"
            class="mb-4"
          >
            <li
              v-for="(kuvaus, kuvausIndex) in tasokuvaus.kuvaukset"
              :key="'kuvaus' + index + kuvausIndex"
            >
              {{ $kaanna(kuvaus) }}
            </li>
          </ul>

          <div
            v-if="tasokuvaus.edistynytOsaaminenKuvaukset && tasokuvaus.edistynytOsaaminenKuvaukset.length > 0"
            class="mb-3"
          >
            <div class="ml-3 mb-2">
              {{ $t('edistynyt-osaaminen') }}
            </div>
            <ul>
              <li
                v-for="(edistynytKuvaus, kuvausIndex) in tasokuvaus.edistynytOsaaminenKuvaukset"
                :key="'edistynytkuvaus' + index + kuvausIndex"
              >
                {{ $kaanna(edistynytKuvaus) }}
              </li>
            </ul>
          </div>
        </b-form-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed } from 'vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { Kielet } from '@shared/stores/kieli';
import { VueDraggable } from 'vue-draggable-plus';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  modelValue: any;
  isEditing: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const osaAlue = computed(() => {
  return props.modelValue;
});

const defaultDragOptions = computed(() => {
  return {
    animation: 300,
    emptyInsertThreshold: 10,
    handle: '.order-handle',
    disabled: !props.isEditing,
    ghostClass: 'dragged',
    group: {
      name: 'kuvaukset',
    },
  };
});

const sisaltokieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const poistaKuvaus = (listaKentta, kuvaus, taso) => {
  emit('update:modelValue', {
    ...osaAlue.value,
    tasokuvaukset: _.map(osaAlue.value.tasokuvaukset, tasokuvaus => tasokuvaus.taso === taso ? { ...tasokuvaus, [listaKentta]: _.filter(tasokuvaus[listaKentta], tkuvaus => tkuvaus !== kuvaus) } : tasokuvaus),
  });
};

const lisaaKuvaus = (listaKentta, taso) => {
  emit('update:modelValue', {
    ...osaAlue.value,
    tasokuvaukset: _.map(osaAlue.value.tasokuvaukset, tasokuvaus => tasokuvaus.taso === taso ? { ...tasokuvaus, [listaKentta]: [...tasokuvaus[listaKentta], {}] } : tasokuvaus),
  });
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
