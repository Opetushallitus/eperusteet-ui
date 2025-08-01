<template>
  <div>
    <div
      v-if="muutosmaarays"
      class="mb-5"
    >
      <b-form-group :label="$t('lataa-uusi-muutosmaaraus') + asterisk">
        <ep-tiedosto-lataus
          v-if="!file"
          ref="tiedostoLataus"
          v-model="file"
          :file-types="['application/pdf']"
          :as-binary="true"
        />
        <div v-if="julkaisuLiitteet && julkaisuLiitteet.length > 0">
          <table class="table">
            <thead>
              <tr>
                <th class="w-40">
                  {{ $t('nimi') }}*
                </th>
                <th class="w-20">
                  {{ $t('kieli') }}*
                </th>
                <th class="w-30">
                  {{ $t('tiedosto') }}
                </th>
                <th class="w-10">
                  {{ $t('poista') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(liiteData, index) in julkaisuLiitteet"
                :key="'liite'+index"
              >
                <td>
                  <ep-input
                    v-model="liiteData.nimi"
                    :is-editing="true"
                  />
                </td>
                <td>
                  <ep-multi-select
                    v-model="liiteData.kieli"
                    :options="julkaisukielet"
                    :searchable="false"
                    :clear-on-select="false"
                    :allow-empty="false"
                  >
                    <template #singleLabel="{ option }">
                      {{ $t(option) }}
                    </template>
                    <template #option="{ option }">
                      {{ $t(option) }}
                    </template>
                    <template #tag="{ option }">
                      {{ $t(option) }}
                    </template>
                  </ep-multi-select>
                </td>
                <td class="file-name">
                  <span>{{ liiteData.liite.nimi }}</span>
                </td>
                <td>
                  <ep-button
                    variant="link"
                    icon="delete"
                    @click="poistaLiite(index)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </b-form-group>

      <b-form-group
        :label="$t('muutosmaarays-astuu-voimaan') + asterisk"
        class="mt-4 col-lg-3"
      >
        <ep-datepicker
          v-model="julkaisu.muutosmaaraysVoimaan"
          :is-editing="true"
        />
      </b-form-group>
    </div>

    <b-form-group :label="$t('lyhyt-kuvaus-muutoksesta-hallintanakymaan')">
      <div class="mb-3">
        {{ $t('kuvaus-naytetaan-taman-sivun-muutoshistoriassa') }}
      </div>
      <ep-content
        v-model="julkaisu.tiedote"
        layout="simplified"
        :is-editable="true"
      />
      <ep-toggle
        v-if="!isLatest"
        v-model="julkaisu.julkinen"
        :is-s-witch="false"
        class="mt-4"
        :is-editing="!isLatest"
      >
        {{ $t('julkaisu-naytetaan-julkisen-sivuston-julkaisuhistoriassa') }}
      </ep-toggle>
    </b-form-group>

    <b-form-group
      v-if="julkaisu.julkinen"
      :label="$t('lyhyt-kuvaus-muutoksesta-julkisella-sivustolla')"
      class="mt-4"
    >
      <div class="mb-3">
        {{ $t('kuvaus-naytetaan-perusteen-tiedot-nakyman-muutoshistoriassa') }}
      </div>
      <ep-content
        v-model="julkaisu.julkinenTiedote"
        layout="simplified"
        :is-editable="true"
      />
    </b-form-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useTemplateRef } from 'vue';
import EpTiedostoLataus from '@shared/components/EpTiedosto/EpTiedostoLataus.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import EpInput from '@shared/components/forms/EpInput.vue';
import { useVuelidate } from '@vuelidate/core';
import { notNull } from '@shared/validators/required';
import { requiredIf } from 'vuelidate/lib/validators';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  store: PerusteStore;
  modelValue: any;
  isLatest?: boolean;
  muutosmaarays?: boolean;
}>();

const emit = defineEmits(['setInvalid', 'update:modelValue']);
const file = ref(null);
const tiedostoLataus = useTemplateRef('tiedostoLataus');

const julkaisu = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const rules = computed(() => ({
  julkaisu: {
    liitteet: {
      $each: {
        nimi: notNull(),
        kieli: notNull(),
      },
      required: requiredIf(() => julkaisu.muutosmaaraysVoimaan),
    },
    muutosmaaraysVoimaan: {
      required: requiredIf(() => julkaisu.liitteet.length > 0),
    },
  },
}));

const v$ = useVuelidate(rules, { julkaisu: julkaisu });

const checkValidity = () => {
  emit('setInvalid', v$.value.$invalid);
};

const lisaaLiite = () => {
  julkaisuLiitteet.value.push({
    data: window.btoa(file.value.binary),
    kieli: '',
    nimi: file.value.file.name,
    liite: {
      nimi: file.value.file.name,
      tyyppi: 'julkaisumuutosmaarays',
    },
  });
  file.value = null;
  (tiedostoLataus.value as any).resetFile();
};

const poistaLiite = async (index) => {
  julkaisuLiitteet.value.splice(index, 1);
};

const perusteId = computed(() => {
  return props.store.perusteId.value;
});

const julkaisukielet = computed(() => {
  return props.store.julkaisukielet.value;
});

const julkaisuLiitteet = computed(() => {
  return julkaisu.liitteet;
});

const isMuutosmaaraysDataRequired = computed(() => {
  return julkaisuLiitteet.value.length > 0 || julkaisu.muutosmaaraysVoimaan;
});

const asterisk = computed(() => {
  return isMuutosmaaraysDataRequired.value ? '*' : '';
});

watch(file, () => {
  if (file.value) {
    lisaaLiite();
  }
});

watch(julkaisuLiitteet, () => {
  checkValidity();
}, { deep: true });

watch(() => julkaisu.value.muutosmaaraysVoimaan, () => {
  checkValidity();
});
</script>

<style lang="scss" scoped>

:deep(table) {
  table-layout: fixed;
}

.w-10 {
  width: 10%;
}

.w-20 {
  width: 20%;
}

.w-30 {
  width: 30%;
}

.file-name {
  vertical-align: middle;
  overflow: auto;
}

</style>
