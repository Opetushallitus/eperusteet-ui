<template>
  <EpModal
    ref="osaamismerkkiKategoriaModal"
    class="backdrop"
    size="xl"
    @cancel="sulje"
  >
    <template #modal-title>
      <div class="flex flex-wrap w-full">
        <div class="flex-1">
          <span
            v-if="kategoria.id"
            class="mr-2"
          >{{ $t('muokkaa-teemaa') }}</span>
          <span
            v-else
            class="mr-2"
          >{{ $t('lisaa-teema') }}</span>
        </div>
        <div>
          <EpKielivalinta />
        </div>
      </div>
    </template>

    <div class="mb-5">
      <EpFormGroup :label="$t('nimi')" required>
        <EpInput
          v-model="kategoria.nimi"
          :is-editing="true"
        />
      </EpFormGroup>
      <EpFormGroup :label="$t('kuvaus')">
        <EpInput
          v-model="kategoria.kuvaus"
          :is-editing="true"
        />
      </EpFormGroup>
      <EpFormGroup :label="$t('kuva')" required>
        <EpTiedostoInput
          v-if="!liite"
          ref="tiedostoInput"
          v-model="kategoria.liite"
          :file-types="mimeTypes"
          @input="fileChanged"
        />
        <div v-if="!liite">
          <span class="font-size-08">{{ imageInfoText }}</span>
        </div>
        <div>
          <img
            v-if="newImagePreviewUrl"
            :src="newImagePreviewUrl"
          >
          <img
            v-if="liite && liite.binarydata && !newImagePreviewUrl"
            :src="savedImagePreviewUrl"
          >
        </div>
        <div
          v-if="liite && liite.binarydata"
          class="clickable mt-2"
          @click="poistaKuva()"
        >
          <span>{{ liite.nimi }}</span>
          <EpMaterialIcon class="default-icon ml-2">
            delete
          </EpMaterialIcon>
        </div>
      </EpFormGroup>
    </div>

    <template #modal-footer>
      <EpButton
        variant="link"
        @click="sulje"
      >
        {{ $t('peruuta') }}
      </EpButton>
      <EpButton
        v-if="kategoria.id"
        :show-spinner="tallennetaan"
        @click="poistaKategoria"
      >
        {{ $t('poista') }}
      </EpButton>
      <EpButton
        :show-spinner="tallennetaan"
        :disabled="invalid"
        @click="tallenna"
      >
        {{ $t('tallenna') }}
      </EpButton>
    </template>
  </EpModal>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef, nextTick } from 'vue';
import EpModal from '@shared/components/EpModal/EpModal.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import * as _ from 'lodash';
import { OsaamismerkitStore } from '@/stores/OsaamismerkitStore';
import { OsaamismerkkiKategoriaDto } from '@shared/generated/eperusteet';
import { useVuelidate } from '@vuelidate/core';
import { requiredLokalisoituTeksti, notNull } from '@shared/validators/required';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { Kieli } from '@shared/tyypit';
import EpTiedostoInput from '@shared/components/EpTiedosto/EpTiedostoInput.vue';
import { $t, $success, $fail } from '@shared/utils/globals';

const props = defineProps<{
  store: OsaamismerkitStore;
}>();

const osaamismerkkiKategoriaModal = useTemplateRef('osaamismerkkiKategoriaModal');

const tallennetaan = ref(false);
const tiedostoInput = useTemplateRef('tiedostoInput');
const kategoria = ref<OsaamismerkkiKategoriaDto>({});
const newImagePreviewUrl = ref<string | null>(null);
const imageWidth = ref(0);
const imageHeight = ref(0);
const imageMaxDimension = '200x200';
const requiredKielet: Kieli[] = [Kieli.fi, Kieli.sv];
const mimeTypes: string[] = ['image/jpeg, image/png, image/svg+xml'];
const allowedTypes = '.jpeg .png .svg';

const rules = computed(() => ({
  kategoria: {
    nimi: requiredLokalisoituTeksti(requiredKielet),
    liite: {
      binarydata: notNull(),
    },
  },
}));

const v$ = useVuelidate(rules, { kategoria });

const tallenna = async () => {
  tallennetaan.value = true;
  try {
    await props.store.updateKategoria(kategoria.value);
    tallennetaan.value = false;
    $success($t('teeman-paivitys-onnistui') as string);
    await props.store.fetchKategoriat();
    sulje();
  }
  catch (err) {
    tallennetaan.value = false;
    $fail($t('teeman-paivitys-epaonnistui') as string);
    kategoria.value.liite = undefined;
    newImagePreviewUrl.value = null;
    nextTick(() => (tiedostoInput.value as { reset?: () => void })?.reset?.());
  }
};

const poistaKategoria = async () => {
  try {
    await props.store.deleteKategoria(kategoria.value.id);
    tallennetaan.value = false;
    $success($t('teeman-poistaminen-onnistui') as string);
    await props.store.fetchKategoriat();
    sulje();
  }
  catch (err) {
    tallennetaan.value = false;
    $fail($t('teeman-poistaminen-epaonnistui') as string);
  }
};

const fileChanged = async (file: File) => {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (evt: any) => {
    let img = new Image();
    img.onload = () => {
      imageWidth.value = img.width;
      imageHeight.value = img.height;
      if (reader.result && isValidImage()) {
        newImagePreviewUrl.value = evt.target.result;
        kategoria.value.liite = {
          binarydata: reader.result.toString().split(',')[1],
          nimi: file.name,
        };
      }
      else {
        kategoria.value.liite = undefined;
        $fail(imageInfoText.value);
        (tiedostoInput.value as { reset?: () => void })?.reset?.();
      }
    };
    img.src = evt.target.result;
  };
};

const poistaKuva = () => {
  kategoria.value.liite = undefined;
  newImagePreviewUrl.value = null;
};

const sulje = () => {
  clear();
  (osaamismerkkiKategoriaModal.value as any).hide();
};

const avaaModal = (item) => {
  if (item) {
    kategoria.value = _.cloneDeep(item);
  }
  (osaamismerkkiKategoriaModal.value as any).show();
};

const clear = () => {
  kategoria.value = {};
  newImagePreviewUrl.value = null;
  imageWidth.value = 0;
  imageHeight.value = 0;
  nextTick(() => (tiedostoInput.value as { reset?: () => void })?.reset?.());
};

const isValidImage = () => {
  return imageWidth.value <= 200 && imageHeight.value <= 200;
};

const imageInfoText = computed(() => {
  return $t('kuvan-maksimimitat') + ': ' + imageMaxDimension + '. ' + $t('sallitut-kuvaformaatit') + ': ' + allowedTypes;
});

const liite = computed(() => {
  return kategoria.value.liite;
});

const invalid = computed(() => {
  return v$.value.$invalid;
});

const savedImagePreviewUrl = computed(() => {
  return liite.value ? 'data:' + liite.value.mime + ';base64,' + liite.value.binarydata : null;
});

defineExpose({
  avaaModal,
});
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";
</style>
