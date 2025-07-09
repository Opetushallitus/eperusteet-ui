<template>
  <b-modal class="backdrop"
           ref="muutosmaaraysModal"
           :no-close-on-backdrop="true"
           :no-enforce-focus="true"
           :lazy="true"
           size="xl"
           :hide-footer="true">
    <template #modal-header>
      <div class="mt-1">{{ otsikko }}</div>
    </template>

    <EpMuutosmaarays class="mb-4" v-model="muutosmaarays" :isEditing="true" :asiasanat="asiasanat" :maarayksetNimella="maarayksetNimella"/>

    <div class="d-flex ">
      <div class="mr-auto">
        <EpButton
          v-if="muutosmaarays && muutosmaarays.id"
          @click="poista"
          variant="link"
          icon="delete"
          :show-spinner="poistetaan">
          {{ $t('poista') }}
        </EpButton>
      </div>
      <EpButton
        @click="sulje"
        variant="link">
        {{ $t('peruuta') }}
      </EpButton>
      <EpButton
        @click="tallenna"
        :show-spinner="tallennetaan"
        :disabled="!valid">
        {{ $t('tallenna-muutosmaarays') }}
      </EpButton>
    </div>
  </b-modal>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { ref, computed, useTemplateRef, getCurrentInstance } from 'vue';
import EpJulkaisuForm from '@/components/EpJulkaisu/EpJulkaisuForm.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMuutosmaarays from '@/components/EpJulkaisu/EpMuutosmaarays.vue';
import { MaarayksetEditStore, requireOneLiite } from '@/stores/MaarayksetEditStore';
import { MaaraysDtoLiittyyTyyppiEnum, MaaraysDtoTilaEnum, MaaraysDtoTyyppiEnum } from '@shared/generated/eperusteet';
import { useVuelidate } from '@vuelidate/core';
import { requiredOneLang } from '@shared/validators/required';
import { required } from 'vuelidate/lib/validators';
import { Maaraykset, MaaraysKevytDto } from '@shared/api/eperusteet';
import { $t, $success, $fail, $bvModal } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const muutosmaaraysModal = useTemplateRef('muutosmaaraysModal');

const muutosmaarays = ref<any | null>(null);
const tallennetaan = ref(false);
const poistetaan = ref(false);
const asiasanat = ref<{ [key: string]: string[]; } | null>(null);
const maarayksetNimella = ref<MaaraysKevytDto[] | null>(null);

const rules = {
  muutosmaarays: {
    nimi: requiredOneLang(),
    diaarinumero: { required },
    voimassaoloAlkaa: { required },
    maarayspvm: { required },
    liitteet: requireOneLiite(),
  },
};

const v$ = useVuelidate(rules, { muutosmaarays }, { $stopPropagation: true });

const tallenna = async () => {
  tallennetaan.value = true;
  try {
    await props.perusteStore.tallennaMuutosmaarays(muutosmaarays.value);
    tallennetaan.value = false;
    $success($t('muutosmaarays-tallennettu') as string);
    sulje();
  }
  catch (err) {
    tallennetaan.value = false;
    $fail($t('muutosmaarayksen-tallennus-epaonnistui') as string);
  }
};

const sulje = () => {
  (muutosmaaraysModal.value as any).hide();
};

const otsikko = computed(() => {
  if (muutosmaarays.value?.id) {
    return $t('muokkaa-muutosmaaraysta');
  }

  return $t('lisaa-muutosmaarays');
});

const muokkaa = async (editMuutosmaarays?) => {
  asiasanat.value = (await Maaraykset.getAsiasanat()).data;
  maarayksetNimella.value = (await Maaraykset.getMaarayksetNimet()).data;

  if (editMuutosmaarays) {
    muutosmaarays.value = _.cloneDeep(editMuutosmaarays);
  }
  else {
    muutosmaarays.value = MaarayksetEditStore.createEmptyMaarays({
      tyyppi: MaaraysDtoTyyppiEnum.PERUSTE,
      koulutustyypit: [props.perusteStore.peruste.value?.koulutustyyppi as any],
      tila: MaaraysDtoTilaEnum.LUONNOS,
      peruste: {
        id: props.perusteStore.peruste.value?.id,
      },
      liittyyTyyppi: MaaraysDtoLiittyyTyyppiEnum.MUUTTAA,
      muutettavatMaaraykset: props.perusteStore.maarays.value ? _.filter(maarayksetNimella.value, maarays => maarays.id === props.perusteStore.maarays.value?.id) : [],
    }) as any;
  }
  (muutosmaaraysModal.value as any).show();
};

const poista = async () => {
  const poista = await $bvModal.msgBoxConfirm($t('poista-muutosmaarays-varmistus') as any, {
    title: $t('poista-muutosmaarays') as any,
    okVariant: 'primary',
    okTitle: $t('poista') as any,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as any,
    centered: true,
  });

  if (poista) {
    poistetaan.value = true;
    props.perusteStore.poistaMuutosmaarays(muutosmaarays.value);
    poistetaan.value = false;
    sulje();
    $success($t('muutosmaarays-poistettu') as string);
  }
};

const valid = computed(() => {
  return !v$.value.$invalid;
});

defineExpose({
  muokkaa,
});
</script>

<style lang="scss" scoped>

</style>
