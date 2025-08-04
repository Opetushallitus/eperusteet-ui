<template>
  <b-modal
    ref="rakenneModal"
    size="xl"
    :cancel-title="$t('peruuta')"
  >
    <template #modal-header>
      <h2 v-if="muokkaus">
        {{ $t('muokkaa-ryhmaa') }}: {{ $kaanna(nimi) }}
      </h2>
      <h2 v-else>
        {{ $t('lisaa-ryhma') }}
      </h2>

      <EpKielivalinta />
    </template>

    <template #modal-footer>
      <div class="d-flex justify-content-end w-100">
        <ep-button
          v-if="muokkaus"
          icon="delete"
          variant="link"
          class="flex-grow-1"
          @click="remove"
        >
          {{ $t('poista') }}
        </ep-button>
        <ep-button
          variant="link"
          @click="cancel"
        >
          {{ $t('peruuta') }}
        </ep-button>
        <ep-button
          :disabled="invalid"
          @click="save"
        >
          {{ $t('tallenna') }}
        </ep-button>
      </div>
    </template>

    <template #default>
      <div v-if="isRyhma">
        <b-form-group :label="$t('ryhma') + ' *'">
          <b-form-radio
            v-model="tyyppi"
            class="ml-1"
            value="osaamisala"
            name="tyyppi"
          >
            {{ $t('osaamisala') }}
          </b-form-radio>
          <b-form-radio
            v-model="tyyppi"
            class="ml-1"
            value="tutkintonimike"
            name="tyyppi"
          >
            {{ $t('tutkintonimike') }}
          </b-form-radio>
          <b-form-radio
            v-model="tyyppi"
            class="ml-1 mt-2"
            value="rakenne-moduuli-pakollinen"
            name="tyyppi"
          >
            {{ $t('rakenne-moduuli-pakollinen') }}
          </b-form-radio>
          <b-form-radio
            v-model="tyyppi"
            class="ml-1"
            value="rakenne-moduuli-valinnainen"
            name="tyyppi"
          >
            {{ $t('rakenne-moduuli-valinnainen') }}
          </b-form-radio>
          <b-form-radio
            v-model="tyyppi"
            class="ml-1"
            value="rakenne-moduuli-ammatilliset"
            name="tyyppi"
          >
            {{ $t('rakenne-moduuli-ammatilliset') }}
          </b-form-radio>
          <b-form-radio
            v-model="tyyppi"
            class="ml-1"
            value="rakenne-moduuli-yhteiset"
            name="tyyppi"
          >
            {{ $t('rakenne-moduuli-yhteiset') }}
          </b-form-radio>
          <b-form-radio
            v-model="tyyppi"
            class="ml-1 mt-2"
            value="rakenne-moduuli-paikalliset"
            name="tyyppi"
          >
            {{ $t('rakenne-moduuli-paikalliset') }}
          </b-form-radio>
        </b-form-group>

        <b-form-group
          v-if="tyyppi ==='osaamisala'"
          :label="$t('osaamisala') + ' *'"
        >
          <div class="mb-2">
            <span v-if="selectableOsaamisalat.length === 0">{{ $t('ei-valittavia-osaamisaloja') }} </span>
            <span v-else>{{ $t('valitse-osaamisala') }} </span>
            <span>{{ $t('uusia-osaamisaloja-voit-luoda') }} </span>
            <a
              class="btn-link"
              @click="cancel()"
            >{{ $t('tutkinnon-muodostumisen') }} </a>
            <span>{{ $t('nakymasta') }}</span>
          </div>
          <b-form-radio
            v-for="(osaamisala, index) in selectableOsaamisalat"
            :key="&quot;osaamisala&quot;+index"
            v-model="innerModel.osaamisala"
            class="ml-1"
            :value="osaamisala"
            name="osaamisalaValinta"
          >
            {{ $kaanna(osaamisala.nimi) }}
          </b-form-radio>
        </b-form-group>

        <b-form-group
          v-if="tyyppi ==='tutkintonimike'"
          :label="$t('tutkintonimike') + ' *'"
        >
          <div class="mb-2">
            <span v-if="selectableOsaamisalat.length === 0">{{ $t('ei-valittavia-tutkintonimikkeita') }} </span>
            <span v-else>{{ $t('valitse-tutkintonimike') }} </span>
            <span>{{ $t('uusia-tutkintonimikkeita-voit-luoda') }} </span>
            <a
              class="btn-link"
              @click="cancel()"
            >{{ $t('tutkinnon-muodostumisen') }} </a>
            <span>{{ $t('nakymasta') }}</span>
          </div>
          <b-form-radio
            v-for="(tutkintonimike, index) in selectableTutkintonimikkeet"
            :key="&quot;tutkintonimike&quot;+index"
            v-model="innerModel.tutkintonimike"
            class="ml-1"
            :value="tutkintonimike"
            name="tutkintonimikeValinta"
          >
            {{ $kaanna(tutkintonimike.nimi) }}
          </b-form-radio>
        </b-form-group>

        <b-form-group
          v-if="tyyppi ==='rakenne-moduuli-paikalliset'"
          :label="$t('nimi') + ' *'"
        >
          <b-form-radio
            v-model="nimiValinta"
            class="ml-1"
            value="paikallinen"
            name="nimiValinta"
          >
            {{ $t(nimiValintaTekstit['paikallinen']) }}
          </b-form-radio>
          <b-form-radio
            v-model="nimiValinta"
            class="ml-1"
            value="tutkinnonosato"
            name="nimiValinta"
          >
            {{ $t(nimiValintaTekstit['tutkinnonosato']) }}
          </b-form-radio>
          <b-form-radio
            v-model="nimiValinta"
            class="ml-1"
            value="korkeakoulu"
            name="nimiValinta"
          >
            {{ $t(nimiValintaTekstit['korkeakoulu']) }}
          </b-form-radio>
          <b-form-radio
            v-model="nimiValinta"
            class="ml-1"
            value="yhteinen"
            name="nimiValinta"
          >
            {{ $t(nimiValintaTekstit['yhteinen']) }}
          </b-form-radio>
          <b-form-radio
            v-model="nimiValinta"
            class="ml-1"
            value="muu"
            name="nimiValinta"
          >
            {{ $t(nimiValintaTekstit['muu']) }}
          </b-form-radio>

          <ep-input
            v-if="nimiValinta === 'muu' || tyyppi !=='rakenne-moduuli-paikalliset'"
            v-model="innerModel.nimi"
            class="mt-1 ml-4"
            is-editing
          />
          <ep-input
            v-else
            class="mt-1 ml-4"
            is-editing
            value=""
            :disabled="true"
          />
        </b-form-group>

        <b-form-group
          v-if="innerModel.muodostumisSaanto"
          :label="$t('laajuus')"
        >
          <div class="d-flex align-items-center">
            <div>
              <ep-input
                v-model="innerModel.muodostumisSaanto.laajuus.minimi"
                type="number"
                is-editing
              />
            </div>
            <div
              v-if="innerModel.muodostumisSaanto.laajuus.maksimi"
              class="ml-2"
            >
              -
            </div>
            <div
              v-if="innerModel.muodostumisSaanto.laajuus.maksimi"
              class="ml-2"
            >
              <ep-input
                v-model="innerModel.muodostumisSaanto.laajuus.maksimi"
                type="number"
                is-editing
              />
            </div>
            <div class="ml-2">
              {{ $t('osaamispiste') }}
            </div>
          </div>
          <ep-toggle
            :value="!!innerModel.muodostumisSaanto.laajuus.maksimi"
            switch
            @input="toggleMaksimi"
          >
            {{ $t('aseta-myos-maksimiarvo') }}
          </ep-toggle>
        </b-form-group>
      </div>
      <div v-else>
        <b-form-group :label="$t('pakollisuus')">
          <ep-toggle
            v-model="pakollinenModel"
            switch
          >
            {{ $t('tutkinnon-osa-on-pakollinen') }}
          </ep-toggle>
        </b-form-group>
      </div>
      <b-form-group :label="$t('kuvaus')">
        <ep-content
          v-model="kuvausModel"
          :is-editable="true"
          layout="normal"
        />
      </b-form-group>
    </template>
  </b-modal>
</template>

<script setup lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import * as _ from 'lodash';
import { Kieli } from '@shared/tyypit';
import { Kielet } from '@shared/stores/kieli';
import { ref, computed, watch, inject, useTemplateRef } from 'vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  tutkinnonOsatMap: {
    type: Object,
    required: false,
  },
  muokkaus: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'save', 'remove']);

const nimiValinta = ref(null);
const tyyppi = ref(null);
const tempModel = ref(null);
const oldMaksimi = ref(1);
const rakenneModal = useTemplateRef('rakenneModal');

const osaamisalat = inject('osaamisalat', []);
const tutkintonimikkeet = inject('tutkintonimikkeet', []);

const tyyppiRoolit = {
  'rakenne-moduuli-pakollinen': 'määritelty',
  'rakenne-moduuli-valinnainen': 'määritelty',
  'rakenne-moduuli-ammatilliset': 'määritelty',
  'rakenne-moduuli-yhteiset': 'vieras',
  'rakenne-moduuli-paikalliset': 'määrittelemätön',
};

const innerModel = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const defaultTyyppi = computed(() => {
  if (props.modelValue.rooli === 'osaamisala') {
    return 'osaamisala';
  }
  else if (props.modelValue.rooli === 'tutkintonimike') {
    return 'tutkintonimike';
  }

  const rakennetyypit = [
    'osaamisala',
    'tutkintonimike',
    'rakenne-moduuli-valinnainen',
    'rakenne-moduuli-ammatilliset',
    'rakenne-moduuli-yhteiset',
    'rakenne-moduuli-paikalliset',
    'rakenne-moduuli-pakollinen',
  ];
  for (const rt of rakennetyypit) {
    if (props.modelValue?.nimi && props.modelValue.nimi[Kielet.getUiKieli.value] === $t(rt)) {
      return rt;
    }
  }

  return 'rakenne-moduuli-paikalliset';
});

const nimiValintaTekstit = computed(() => {
  return {
    'paikallinen': 'peruste-rakenne-nimi-paikallisiin',
    'tutkinnonosato': 'peruste-rakenne-nimi-tutkinnon-osa-toisesta',
    'korkeakoulu': 'peruste-rakenne-nimi-korkeakouluopinnot',
    'yhteinen': 'peruste-rakenne-nimi-yhteisten-tutkinnon-osien',
    'muu': 'peruste-rakenne-nimi-jokin-muu',
  };
});

const isRyhma = computed(() => {
  return !props.muokkaus || !!props.modelValue.rooli;
});

const tosa = computed(() => {
  if (!props.modelValue._tutkinnonOsaViite) {
    return null;
  }
  if (props.tutkinnonOsatMap) {
    return props.tutkinnonOsatMap[props.modelValue._tutkinnonOsaViite];
  }
  return null;
});

const nimi = computed(() => {
  if (isRyhma.value) {
    return props.modelValue.nimi;
  }
  else {
    return tosa.value?.nimi;
  }
});

const selectableOsaamisalat = computed(() => {
  return _.map(osaamisalat, osaamisala => {
    return {
      nimi: osaamisala.nimi,
      osaamisalakoodiArvo: osaamisala.osaamisala.osaamisalakoodiArvo,
      osaamisalakoodiUri: osaamisala.osaamisala.osaamisalakoodiUri,
    };
  });
});

const selectableTutkintonimikkeet = computed(() => {
  return _.map(tutkintonimikkeet, tutkintonimike => {
    return {
      nimi: tutkintonimike.nimi,
      arvo: tutkintonimike.tutkintonimike.arvo,
      uri: tutkintonimike.tutkintonimike.uri,
    };
  });
});

const invalid = computed(() => {
  if (tosa.value) {
    return false;
  }

  if (tyyppi.value === 'osaamisala') {
    return !innerModel.value.osaamisala?.osaamisalakoodiUri;
  }
  else if (tyyppi.value === 'tutkintonimike') {
    return !innerModel.value.tutkintonimike?.uri;
  }

  if (innerModel.value.nimi) {
    return _.isEmpty(innerModel.value.nimi[Kielet.getSisaltoKieli.value]) || tyyppi.value === null;
  }
  return true;
});

const getNimi = (key) => {
  return {
    fi: $t(key, {}, { locale: Kieli.fi }),
    sv: $t(key, {}, { locale: Kieli.sv }),
    en: $t(key, {}, { locale: Kieli.en }),
  };
};

const setDefaultNimi = () => {
  if (tyyppi.value === 'rakenne-moduuli-paikalliset') {
    for (const nimiteksti of _.keys(nimiValintaTekstit.value)) {
      if (props.modelValue?.nimi?.fi === $t(nimiValintaTekstit.value[nimiteksti], 'fi')) {
        nimiValinta.value = nimiteksti;
      }
    }

    if (!nimiValinta.value) {
      nimiValinta.value = 'muu';
    }
  }
};

const show = (isNew) => {
  (rakenneModal.value as any).show();
  if (isNew) {
    tyyppi.value = null;
    innerModel.value.tutkintonimike = null;
    innerModel.value.osaamisala = null;
  }
  else {
    tyyppi.value = defaultTyyppi.value;
  }

  if (tyyppi.value !== 'rakenne-moduuli-paikalliset') {
    nimiValinta.value = null;
  }

  tempModel.value = _.cloneDeep(innerModel.value);
  setDefaultNimi();

  emit('update:modelValue',
    {
      ...innerModel.value,
      ...(innerModel.value.tutkintonimike
        && {
          tutkintonimike: _.find(selectableTutkintonimikkeet.value, tutkintonimike => innerModel.value.tutkintonimike.uri === tutkintonimike.uri),
        }),
      ...((!innerModel.value.muodostumisSaanto || innerModel.value.muodostumisSaanto === null)
        && {
          muodostumisSaanto: {
            laajuus: {
              minimi: null,
              maksimi: null,
            },
          },
        }),
    });
};

const save = () => {
  if (tyyppi.value === 'osaamisala') {
    innerModel.value = {
      ...innerModel.value,
      rooli: 'osaamisala',
      nimi: _.get(_.find(osaamisalat, osaamisala => osaamisala.osaamisala.osaamisalakoodiUri === innerModel.value.osaamisala.osaamisalakoodiUri), 'nimi'),
    };
  }
  else if (tyyppi.value === 'tutkintonimike') {
    innerModel.value = {
      ...innerModel.value,
      rooli: 'tutkintonimike',
      nimi: _.get(_.find(tutkintonimikkeet, tutkintonimike => tutkintonimike.tutkintonimike.uri === innerModel.value.tutkintonimike.uri), 'nimi'),
    };
  }
  else if (isRyhma.value && tyyppi.value && tyyppiRoolit[tyyppi.value]) {
    innerModel.value = {
      ...innerModel.value,
      rooli: tyyppiRoolit[tyyppi.value],
    };
  }

  emit('save');
  (rakenneModal.value as any).hide();
};

const remove = () => {
  emit('remove');
  (rakenneModal.value as any).hide();
};

const cancel = () => {
  emit('update:modelValue', tempModel.value);
  (rakenneModal.value as any).hide();
};

const toggleRange = () => {
  innerModel.value.useRange = !innerModel.value.useRange;
  if (innerModel.value.useRange) {
    innerModel.value.ryhma.muodostumisSaanto.laajuus.maksimi = 0;
  }
  else {
    delete innerModel.value.ryhma.muodostumisSaanto.laajuus.maksimi;
  }
};

const toggleMaksimi = (toggled) => {
  if (!toggled) {
    if (innerModel.value.muodostumisSaanto.laajuus.maksimi) {
      oldMaksimi.value = innerModel.value.muodostumisSaanto.laajuus.maksimi;
    }
    innerModel.value.muodostumisSaanto.laajuus.maksimi = null;
  }
  else {
    innerModel.value.muodostumisSaanto.laajuus = {
      ...innerModel.value.muodostumisSaanto.laajuus,
      maksimi: oldMaksimi.value,
    };
  }
};

watch(nimiValinta, (newVal, oldVal) => {
  nimiChanged(newVal, oldVal);
});

const nimiChanged = (newVal, oldVal) => {
  if (!newVal || !oldVal) {
    return;
  }

  if (nimiValinta.value) {
    if (nimiValinta.value !== 'muu') {
      emit('update:modelValue', { ...innerModel.value, nimi: getNimi(nimiValintaTekstit.value[nimiValinta.value]) });
    }
    else {
      emit('update:modelValue', { ...innerModel.value, nimi: null });
    }
  }
};

watch(tyyppi, (newVal, oldVal) => {
  if (!newVal || !oldVal) {
    return;
  }

  let osaamisala = innerModel.value.osaamisala;
  if (tyyppi.value === 'osaamisala' && _.isNil(innerModel.value.osaamisala)) {
    osaamisala = {};
  }
  else if (tyyppi.value !== 'osaamisala') {
    osaamisala = null;
  }

  if (tyyppi.value && tyyppi.value !== 'rakenne-moduuli-paikalliset') {
    emit('update:modelValue', {
      ...innerModel.value,
      nimi: getNimi(tyyppi.value),
      osaamisala,
    });
  }
  else if (tyyppi.value && tyyppi.value === 'rakenne-moduuli-paikalliset') {
    nimiChanged(nimiValinta.value, nimiValinta.value);
  }
  else if (oldVal) {
    emit('update:modelValue', { ...innerModel.value, nimi: null });
  }
});

const pakollinenModel = computed({
  get() {
    return innerModel.value.pakollinen;
  },
  set(value) {
    emit('update:modelValue', { ...innerModel.value, pakollinen: value });
  },
});

const kuvausModel = computed({
  get() {
    return innerModel.value.kuvaus;
  },
  set(value) {
    emit('update:modelValue', { ...innerModel.value, kuvaus: value });
  },
});

defineExpose({
  show,
});
</script>
