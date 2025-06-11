<template>
  <EpSpinner v-if="!asiasanat || !maarayksetNimella" />
  <div v-else>

    <EpInfoBanner class="mb-3">
      {{$t('lisaa-muutosmaarayksen-kieliversiot-samaan-muutosmaaraykseen')}}
    </EpInfoBanner>

    <b-tabs class="mb-3" v-model="tabindex">
      <b-tab v-for="kieli in kielet" :key='"kieli"+kieli' :title="$t('translatiivi-' + kieli)"/>
    </b-tabs>

    <b-form-group>
      <template #label>
        <div class="d-flex">
          <span>{{$t('lataa-uusi-muutosmaarays') + isRequired}}</span>
          <EpInfoPopover class="ml-2" unique-id="11">{{ $t('pdf-tiedoston-maksimikoko', { koko: fileMaxSize }) }}</EpInfoPopover>
        </div>
      </template>
      <EpMaaraysLiitteet v-model="model.liitteet[kieli].liitteet" :isEditing="isEditing" :tyyppi="MAARAYSDOKUMENTTI" yksittainen/>
    </b-form-group>

    <b-form-group :label="$t('muutosmaarayksen-nimi') + isRequired" class="mt-4 w-40">
      <ep-input v-model="model.nimi" :isEditing="isEditing"/>
    </b-form-group>

    <b-form-group :label="$t('asiasana')" class="mt-4">
      <EpMaaraysAsiasanat v-model="model.asiasanat[kieli].asiasana" :asiasanat="kielenAsiasanat" :isEditing="isEditing"/>
    </b-form-group>

    <b-form-group :label="$t('kuvaus')" class="mt-4">
      <ep-content v-model="model.kuvaus" layout="simplified_w_links" :is-editable="isEditing"/>
    </b-form-group>

    <b-form-group class="mt-4">
      <template #label>
        <div class="d-flex">
          <span>{{$t('liitteet') + ' (pdf)'}}</span>
          <EpInfoPopover class="ml-2" unique-id="12">{{ $t('pdf-tiedoston-maksimikoko', { koko: fileMaxSize }) }}</EpInfoPopover>
        </div>
      </template>
      <EpMaaraysLiitteet v-model="model.liitteet[kieli].liitteet" :isEditing="isEditing" :tyyppi="LIITE" nimisyote/>
    </b-form-group>

    <hr class="my-4"/>

    <h3>{{$t('muutosmaarayksen-kieliversioiden-yhteiset-tiedot')}}</h3>

    <b-form-group :label="$t('muutosmaarays-astuu-voimaan') + isRequired" class="mt-4 d-flex">
      <ep-datepicker v-model="model.voimassaoloAlkaa" :isEditing="isEditing" />
    </b-form-group>

    <b-form-group :label="$t('muutosmaarayksen-diaarinumero') + isRequired" class="mt-4 w-40">
      <ep-input v-model="model.diaarinumero" :isEditing="isEditing" type="string"/>
    </b-form-group>

    <b-form-group :label="$t('maarays-annettu') + isRequired" class="mt-4 d-flex">
      <ep-datepicker v-model="model.maarayspvm" :isEditing="isEditing" />
    </b-form-group>

    <b-form-group :label="$t('liittyyko-maarays-toiseen-maaraykseen') + isRequired" class="mt-4">
      <EpMaaraysLiittyyMuuttaaValinta
      v-model="model"
      :isEditing="isEditing"
      :maarayksetNimella="maarayksetNimella"
      :disabloidutValinnat="disabloidutMuuttaaValinnat"/>
    </b-form-group>

  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed, ref, watch } from 'vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { MaaraysDto, MaaraysDtoLiittyyTyyppiEnum, MaaraysKevytDto, MaaraysLiiteDtoTyyppiEnum } from '@shared/api/eperusteet';
import EpMaaraysLiittyyMuuttaaValinta from '@/components/maaraykset/EpMaaraysLiittyyMuuttaaValinta.vue';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import EpMaaraysAsiasanat from '@/components/maaraykset/EpMaaraysAsiasanat.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpMaaraysLiitteet from '@/components/maaraykset/EpMaaraysLiitteet.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { Kieli } from '@shared/tyypit';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import EpInfoBanner from '@shared/components/EpInfoBanner/EpInfoBanner.vue';
import { $t } from '@shared/utils/globals';

const MAARAYSDOKUMENTTI = MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI;
const LIITE = MaaraysLiiteDtoTyyppiEnum.LIITE;

const props = defineProps<{
  modelValue: MaaraysDto;
  isEditing?: boolean;
  asiasanat: { [key: string]: string[]; };
  maarayksetNimella: MaaraysKevytDto[];
}>();

const emit = defineEmits(['update:modelValue']);

const fileMaxSize = 10;
const tabindex = ref(0);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const isRequired = computed(() => {
  return props.isEditing ? ' *' : '';
});

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const kielenAsiasanat = computed(() => {
  if (!props.asiasanat || _.isEmpty(props.asiasanat[kieli.value])) {
    return [];
  }

  return props.asiasanat[kieli.value];
});

const disabloidutMuuttaaValinnat = computed(() => {
  return [MaaraysDtoLiittyyTyyppiEnum.EILIITY];
});

const kielet = computed(() => {
  return UiKielet;
});

watch(tabindex, (index) => {
  Kielet.setSisaltoKieli(Kieli[kielet.value[index]]);
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
