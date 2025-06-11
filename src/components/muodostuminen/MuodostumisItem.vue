<template>
  <div class="d-flex flex-column h-100 moduuli mb-3" :style="style">
    <div class="d-flex align-items-center flex-grow-1 h-100">
      <div class="pl-1" v-if="hasChildren">
        <b-button variant="link" @click="toggleOpen">
          <EpMaterialIcon v-if="isOpen">expand_less</EpMaterialIcon>
          <EpMaterialIcon v-else>expand_more</EpMaterialIcon>
        </b-button>
      </div>
      <div class="flex-grow-1 h-100 p-2 nimi">
        <EpColorIndicator :size="10" :backgroundColor="tutkinnonOsaColor" class="ml-2 mr-2" v-if="tosa"/>
        {{ $kaanna(nimi) }} <span v-if="koodiArvo">({{koodiArvo}})</span>
      </div>
      <div style="width: 100px;" class="text-center">
        <b-button variant="none" :class="{ 'text-danger': !validity.isValid }" v-b-popover.hover="$t('laskettu-laajuus') + ': ' + laskettu">
          <span v-if="laajuusMinimi > 0 || laajuusMaksimi > 0">
            {{ laajuusMinimi }}
          </span>
          <span v-if="laajuusMaksimi > 0">
            -
            {{ laajuusMaksimi }}
          </span>
        </b-button>
      </div>
      <div style="width: 80px" class="clearfix">
        <div class="float-right">
          <b-dropdown
            v-if="isEditing"
            size="lg"
            variant="link"
            toggle-class="text-decoration-none"
            no-caret>
            <template v-slot:button-content>
              <EpMaterialIcon>more_horiz</EpMaterialIcon>
              <span class="sr-only">{{ $t('muokkaa-ryhmaa') }}</span>
            </template>
            <b-dropdown-item-button @click="edit">{{ $t('muokkaa') }}</b-dropdown-item-button>
            <b-dropdown-item-button @click="remove">{{ $t('poista') }}</b-dropdown-item-button>

            <template v-if="isRyhma">
              <b-dropdown-item-button @click="copy">{{ $t('kopioi-leikelaudalle') }}</b-dropdown-item-button>
              <b-dropdown-divider v-if="isRyhma"></b-dropdown-divider>
              <b-dropdown-text v-if="isRyhma">
                <ep-button icon="add" variant="outline" @click="liitaTosa">{{ $t('liita-tutkinnon-osa') }}</ep-button>
                <ep-button icon="add" variant="outline" @click="lisaaRyhma">{{ $t('lisaa-ryhma') }}</ep-button>
              </b-dropdown-text>
            </template>
          </b-dropdown>
        </div>
      </div>
    </div>
    <div v-if="modelValue.kuvaus" class="text-muted kuvaus-wrapper">
      <div v-if="showDescription" class="kuvaus">
        <ep-content v-model="modelValue.kuvaus" :is-editable="false" layout="normal"></ep-content>
      </div>
      <div class="text-center description-button">
        <b-button variant="link" @click="toggleDescription()">
          <EpMaterialIcon>more_horiz</EpMaterialIcon>
        </b-button>
      </div>
    </div>
    <EpRakenneModal v-model="innerModel" ref="eprakennemodal" @remove="remove" :tutkinnonOsatMap="tutkinnonOsatMap" muokkaus/>

    <EpRakenneModal v-model="uusi.ryhma" ref="eprakennemodalNew" @save="addUusi(modelValue)"/>

    <TutkinnonosatAddModal ref="tutkinnonosatModal" :tutkinnonosat="tutkinnonosat" @save="lisaaTutkinnonosat" />

  </div>
</template>

<script setup lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { ref, computed, watch, onMounted, useTemplateRef } from 'vue';
import _ from 'lodash';
import { DefaultRyhma, ryhmaTemplate } from './utils';
import EpRakenneModal from '@/components/muodostuminen/EpRakenneModal.vue';
import TutkinnonosatAddModal from '@/components/muodostuminen/TutkinnonosatAddModal.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { ColorMap, rakenneNodecolor } from '@shared/utils/perusterakenne';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  depth: {
    type: Number,
    default: 0,
  },
  tutkinnonOsatMap: {
    type: Object,
    required: true,
  },
  pakollinen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'remove', 'copy']);

const showDescription = ref(false);
const uusi = ref(DefaultRyhma);

const eprakennemodal = useTemplateRef('eprakennemodal');
const eprakennemodalNew = useTemplateRef('eprakennemodalNew');
const tutkinnonosatModal = useTemplateRef('tutkinnonosatModal');

watch(() => props.pakollinen, () => {
  innerModel.value = { ...innerModel.value, pakollinen: props.pakollinen };
}, { immediate: true });

const innerModel = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const hasChildren = computed(() => {
  return props.modelValue.osat?.length > 0;
});

const isOpen = computed(() => {
  if (innerModel.value.isOpen === undefined) {
    innerModel.value = {
      ...innerModel.value,
      isOpen: true,
    };
  }

  return innerModel.value.isOpen;
});

const toggleOpen = () => {
  innerModel.value = {
    ...innerModel.value,
    isOpen: !innerModel.value.isOpen,
  };
};

const tosa = computed(() => {
  if (!props.modelValue._tutkinnonOsaViite) {
    return null;
  }
  return props.tutkinnonOsatMap[props.modelValue._tutkinnonOsaViite];
});

const osanLaajuusRecursive = (osa) => {
  return _(osa.osat)
    .map(osa => {
      return osanLaajuusRecursive(osa) + _.max([osa?.muodostumisSaanto?.laajuus?.minimi, osa?.muodostumisSaanto?.laajuus?.maksimi])
          || (osa._tutkinnonOsaViite && props.tutkinnonOsatMap[osa._tutkinnonOsaViite] && props.tutkinnonOsatMap[osa._tutkinnonOsaViite].laajuus)
          || 0;
    })
    .filter()
    .sum();
};

const laskettu = computed(() => {
  if (isRyhma.value) {
    return osanLaajuusRecursive(props.modelValue);
  }
  else {
    return laajuusMinimi.value;
  }
});

onMounted(() => {
  if (!props.modelValue.muodostumisSaanto) {
    props.modelValue.muodostumisSaanto = {
      laajuus: {
        minimi: 0,
        maksimi: null,
      },
    };
  }

  if (!props.modelValue.muodostumisSaanto?.laajuus) {
    props.modelValue.muodostumisSaanto.laajuus = {
      minimi: 0,
      maksimi: null,
    };
  }
});

const laajuusValidointi = computed(() => {
  if (isRyhma.value) {
    return laajuusMaksimi.value || laajuusMinimi.value;
  }
  else {
    return 0;
  }
});

const isPaikallinen = computed(() => {
  return props.modelValue?.rooli === 'määrittelemätön';
});

const validity = computed(() => {
  if (isRyhma.value) {
    return {
      isValid: isPaikallinen.value || laskettu.value >= laajuusValidointi.value,
    };
  }
  else {
    return { isValid: true };
  }
});

const nimi = computed(() => {
  if (isRyhma.value) {
    return props.modelValue.nimi;
  }
  else if (tosa.value) {
    return tosa.value.nimi;
  }
  return '';
});

const koodiArvo = computed(() => {
  if (innerModel.value.tutkintonimike?.arvo) {
    return innerModel.value.tutkintonimike?.arvo;
  }

  if (innerModel.value.tutkinnonosa?.tutkinnonOsa?.koodi?.arvo) {
    return innerModel.value.tutkinnonosa?.tutkinnonOsa?.koodi?.arvo;
  }

  if (tosa.value?.tutkinnonOsa?.koodi?.arvo) {
    return tosa.value?.tutkinnonOsa?.koodi?.arvo;
  }

  if (innerModel.value.osaamisala?.osaamisalakoodiArvo) {
    return innerModel.value.osaamisala?.osaamisalakoodiArvo;
  }

  return '';
});

const laajuus = computed(() => {
  return props.modelValue.muodostumisSaanto?.laajuus;
});

const laajuusMinimi = computed(() => {
  if (isRyhma.value) {
    return laajuus.value?.minimi;
  }
  else {
    return tosa.value?.laajuus;
  }
});

const laajuusMaksimi = computed(() => {
  if (isRyhma.value) {
    return laajuus.value?.maksimi;
  }
  else {
    return null;
  }
});

const style = computed(() => {
  return {
    'min-height': (isRyhma.value ? 52 : 42) + 'px',
    ...(!tosa.value && { 'border-left': '9px solid ' + color.value }),
    'border-bottom-left-radius': '4px',
    'border-top-left-radius': '4px',
  };
});

const color = computed(() => {
  return rakenneNodecolor(props.modelValue, props.pakollinen);
});

const tutkinnonOsaColor = computed(() => {
  if (props.pakollinen) {
    return ColorMap['pakollinen'];
  }

  return ColorMap['valinnainen'];
});

const isRyhma = computed(() => {
  return !!props.modelValue.rooli;
});

const remove = () => {
  emit('remove');
};

const edit = () => {
  (eprakennemodal.value as any).show();
};

const toggleDescription = (toggle?) => {
  if (toggle !== undefined) {
    showDescription.value = toggle;
  }
  else {
    showDescription.value = !showDescription.value;
  }
};

const addUusi = (root) => {
  const template = ryhmaTemplate(uusi.value.tyyppi);
  if (uusi.value) {
    root.osat = [{
      ...template,
      ...uusi.value.ryhma,
    }, ...root.osat];
  }
};

const lisaaRyhma = () => {
  uusi.value = _.cloneDeep(DefaultRyhma);
  (eprakennemodalNew.value as any).show(true);
};

const liitaTosa = () => {
  (tutkinnonosatModal.value as any).show();
};

const tutkinnonosat = computed(() => {
  return _.chain(props.tutkinnonOsatMap)
    .keys()
    .map(tosaViite => {
      return {
        ...props.tutkinnonOsatMap[tosaViite],
        _tutkinnonOsaViite: tosaViite,
      };
    })
    .value();
});

const lisaaTutkinnonosat = (tutkinnonosat) => {
  props.modelValue.osat = [
    ...props.modelValue.osat,
    ..._.map(tutkinnonosat, tosa => {
      return {
        kuvaus: null,
        vieras: null,
        tunniste: null,
        pakollinen: false,
        erikoisuus: null,
        _tutkinnonOsaViite: tosa._tutkinnonOsaViite,
      };
    }),
  ];
};

const copy = () => {
  emit('copy');
};

defineExpose({
  edit,
  toggleDescription,
  innerModel,
});
</script>

<style scoped lang="scss">
.children {
  background: #f2f2f2;
}

.muodostumisnode {
  background: #f0f4fb;
}

.moduuli {
  background: #fff;

  .nimi {
    font-weight: 600;
  }
}

.kuvaus-wrapper {
  .kuvaus {
    padding: 0.5rem 1rem 0 1rem;
    margin-bottom: -20px;
  }

  .description-button {
    max-height: 20px;
    margin-top: -8px;
    .btn {
      padding: 0;
      margin: 0;
    }
  }
}

.colorblock {
  content: " ";
  display: block;
  height: 100%;
  width: 8px;
}
</style>
