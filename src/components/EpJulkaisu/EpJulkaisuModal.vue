<template>
  <b-modal
    id="julkaisuModal"
    ref="julkaisuModal"
    class="backdrop"
    :no-close-on-backdrop="true"
    :no-enforce-focus="true"
    :lazy="true"
    size="xl"
    :hide-footer="true"
  >
    <template #modal-header>
      <div class="d-flex justify-content-between w-100">
        <div class="mt-1">
          {{ $t('muokkaa') }}
        </div>
        <EpKielivalinta />
      </div>
    </template>

    <EpJulkaisuMuutosmaarays
      v-if="isNormaali"
      v-model="muokattavaJulkaisu"
      :muutosmaaraykset="muutosmaaraykset"
    />

    <EpJulkaisuForm
      class="mt-4"
      :is-latest="isLatest"
      :store="perusteStore"
      :julkaisu="muokattavaJulkaisu"
      @setInvalid="hasRequiredData"
    />

    <div class="float-right">
      <EpButton
        variant="link"
        @click="sulje"
      >
        {{ $t('peruuta') }}
      </EpButton>
      <EpButton
        :show-spinner="tallennetaan"
        :disabled="invalid"
        @click="tallenna"
      >
        {{ $t('tallenna') }}
      </EpButton>
    </div>
  </b-modal>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { ref, computed, useTemplateRef } from 'vue';
import EpJulkaisuForm from '@/components/EpJulkaisu/EpJulkaisuForm.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpJulkaisuMuutosmaarays from '@/components/EpJulkaisu/EpJulkaisuMuutosmaarays.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { $t, $success, $fail } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const muokattavaJulkaisu = ref<any | null>(null);
const invalid = ref(false);
const tallennetaan = ref(false);
const isLatest = ref(false);

const julkaisuModal = useTemplateRef('julkaisuModal');

const tallenna = async () => {
  tallennetaan.value = true;
  try {
    await props.perusteStore.updateJulkaisu({
      revision: muokattavaJulkaisu.value.revision,
      tiedote: muokattavaJulkaisu.value.tiedote || {},
      julkinenTiedote: muokattavaJulkaisu.value.julkinenTiedote || {},
      julkinen: muokattavaJulkaisu.value.julkinen,
      muutosmaaraysVoimaan: muokattavaJulkaisu.value.muutosmaaraysVoimaan,
      liitteet: muokattavaJulkaisu.value.liitteet,
      muutosmaarays: muokattavaJulkaisu.value.muutosmaarays,
    });
    tallennetaan.value = false;
    $success($t('julkaisun-paivitys-onnistui') as string);
    sulje();
  }
  catch (err) {
    tallennetaan.value = false;
    $fail($t('julkaisun-paivitys-epaonnistui') as string);
  }
};

const sulje = () => {
  (julkaisuModal.value as any).hide();
};

const muokkaa = (julkaisu, isLatestValue) => {
  isLatest.value = isLatestValue;
  muokattavaJulkaisu.value = {
    ..._.cloneDeep(julkaisu),
    liittyyMuutosmaarays: !!julkaisu.muutosmaarays,
  };
  (julkaisuModal.value as any).show();
};

const hasRequiredData = (value) => {
  invalid.value = value;
};

const muutosmaaraykset = computed(() => {
  return props.perusteStore.muutosmaaraykset.value;
});

const isNormaali = computed(() => {
  return props.perusteStore.isNormaali.value;
});

defineExpose({
  muokkaa,
});
</script>

<style lang="scss" scoped>

</style>
