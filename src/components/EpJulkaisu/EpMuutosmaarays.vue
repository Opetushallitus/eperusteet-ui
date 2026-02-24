<template>
  <EpSpinner v-if="!asiasanat || !maarayksetNimella" />
  <div v-else>
    <EpInfoBanner class="mb-3">
      {{ $t('lisaa-muutosmaarayksen-kieliversiot-samaan-muutosmaaraykseen') }}
    </EpInfoBanner>

    <Tabs
      value="0"
      class="mb-3"
      @update:value="onKieliTabChange"
    >
      <TabList>
        <Tab
          v-for="(kieli, idx) in kielet"
          :key="'kieli' + kieli"
          :value="String(idx)"
        >
          {{ $t('translatiivi-' + kieli) }}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel
          v-for="(kieli, idx) in kielet"
          :key="'panel-kieli' + kieli"
          :value="String(idx)"
        >
          <div class="tab-content-wrapper" />
        </TabPanel>
      </TabPanels>
    </Tabs>

    <EpFormGroup>
      <template #label>
        <div class="flex">
          <span>{{ $t('lataa-uusi-muutosmaarays') + isRequired }}</span>
          <EpInfoPopover
            class="ml-2"
            unique-id="11"
          >
            {{ $t('pdf-tiedoston-maksimikoko', { koko: fileMaxSize }) }}
          </EpInfoPopover>
        </div>
      </template>
      <EpMaaraysLiitteet
        v-model="model.liitteet[kieli].liitteet"
        :is-editing="isEditing"
        :tyyppi="MAARAYSDOKUMENTTI"
        yksittainen
      />
    </EpFormGroup>

    <EpFormGroup
      :label="$t('muutosmaarayksen-nimi') + isRequired"
      class="mt-4 w-40"
    >
      <ep-input
        v-model="model.nimi"
        :is-editing="isEditing"
      />
    </EpFormGroup>

    <EpFormGroup
      :label="$t('asiasana')"
      class="mt-4"
    >
      <EpMaaraysAsiasanat
        v-model="model.asiasanat[kieli].asiasana"
        :asiasanat="kielenAsiasanat"
        :is-editing="isEditing"
      />
    </EpFormGroup>

    <EpFormGroup
      :label="$t('kuvaus')"
      class="mt-4"
    >
      <ep-content
        v-model="model.kuvaus"
        layout="simplified_w_links"
        :is-editable="isEditing"
      />
    </EpFormGroup>

    <EpFormGroup class="mt-4">
      <template #label>
        <div class="flex">
          <span>{{ $t('liitteet') + ' (pdf)' }}</span>
          <EpInfoPopover
            class="ml-2"
            unique-id="12"
          >
            {{ $t('pdf-tiedoston-maksimikoko', { koko: fileMaxSize }) }}
          </EpInfoPopover>
        </div>
      </template>
      <EpMaaraysLiitteet
        v-model="model.liitteet[kieli].liitteet"
        :is-editing="isEditing"
        :tyyppi="LIITE"
        nimisyote
      />
    </EpFormGroup>

    <hr class="my-4">

    <h3>{{ $t('muutosmaarayksen-kieliversioiden-yhteiset-tiedot') }}</h3>

    <EpFormGroup
      :label="$t('muutosmaarays-astuu-voimaan') + isRequired"
      class="mt-4 flex"
    >
      <ep-datepicker
        v-model="model.voimassaoloAlkaa"
        :is-editing="isEditing"
      />
    </EpFormGroup>

    <EpFormGroup
      :label="$t('muutosmaarayksen-diaarinumero') + isRequired"
      class="mt-4 w-40"
    >
      <ep-input
        v-model="model.diaarinumero"
        :is-editing="isEditing"
        type="string"
      />
    </EpFormGroup>

    <EpFormGroup
      :label="$t('maarays-annettu') + isRequired"
      class="mt-4 flex"
    >
      <ep-datepicker
        v-model="model.maarayspvm"
        :is-editing="isEditing"
      />
    </EpFormGroup>

    <EpFormGroup
      :label="$t('liittyyko-maarays-toiseen-maaraykseen') + isRequired"
      class="mt-4"
    >
      <EpMaaraysLiittyyMuuttaaValinta
        v-model="model"
        :is-editing="isEditing"
        :maaraykset-nimella="maarayksetNimella"
        :disabloidut-valinnat="disabloidutMuuttaaValinnat"
      />
    </EpFormGroup>
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
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

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

function onKieliTabChange(index: string | number) {
  Kielet.setSisaltoKieli(Kieli[kielet.value[index]]);
}

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

</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

// :deep(.p-tabs-nav) {
//   margin-left: 0;
//   padding-left: 0;
// }

// :deep(.p-tab) {
//   margin-left: 0 !important;
// }

// :deep(.p-tabpanels) {
//   padding: 1rem 0;
// }
</style>
