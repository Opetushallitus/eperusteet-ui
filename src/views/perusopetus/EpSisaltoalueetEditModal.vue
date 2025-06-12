<template>
  <div>
    <ep-button v-if="isEditing" icon="edit" @click="avaa" variant="link" class="muokkaa mb-3">
      {{$t('muokkaa-sisaltoalueita')}}
    </ep-button>

    <ep-content layout="normal" v-if="model.sisaltoalueinfo && model.sisaltoalueinfo.teksti" v-model="model.sisaltoalueinfo.teksti" :is-editable="false"> </ep-content>
    <div v-for="(sisaltoalue, index) in model.sisaltoalueet" :key="'sisaltoalue' + index" class="mt-4">
      <h4>{{ $kaanna(sisaltoalue.nimi)}}</h4>
      <ep-content layout="normal" v-if="sisaltoalue.kuvaus" v-model="sisaltoalue.kuvaus" :is-editable="false"> </ep-content>
    </div>

    <b-modal
      ref="EpSisaltoalueetEditModal"
      size="xl">

      <template #modal-header>
        <div class="d-flex justify-content-between w-100">
          <div>{{ title }}</div>
          <ep-kielivalinta />
        </div>
      </template>

      <h4>{{$t('sisaltoalueen-otsikko')}}</h4>
      <ep-input v-model="model.sisaltoalueinfo.otsikko" :is-editing="true"></ep-input>

      <h4 class="mt-4">{{$t('sisaltoalueen-kuvaus')}}</h4>
      <ep-content layout="normal" v-model="model.sisaltoalueinfo.teksti" :is-editable="true"> </ep-content>

      <draggable
        v-bind="sisaltoalueetDragOptions"
        tag="div"
        v-model="model.sisaltoalueet">

        <div v-for="(sisaltoalue, index) in model.sisaltoalueet" :key="'sisaltoalue' + index" class="mt-4">
          <div class="d-flex" >
            <div class="order-handle mr-3">
              <EpMaterialIcon>drag_indicator</EpMaterialIcon>
            </div>
            <h4>{{ $t('sisaltoalueen-nimi') }}</h4>
          </div>
          <div class="ml-4">
            <ep-input v-model="sisaltoalue.nimi" :is-editing="true"></ep-input>

            <h4 class="mt-4">{{ $t('sisaltoalueen-kuvaus') }}</h4>
            <ep-content layout="normal" v-model="sisaltoalue.kuvaus" :is-editable="true"> </ep-content>
          </div>

          <div class="d-flex justify-content-between mt-1 ml-3">
            <ep-button variant="outline-primary" icon="add" v-if="model.sisaltoalueet && index+1 === model.sisaltoalueet.length" @click="lisaaSisaltoalue()">
              {{ $t('lisaa-sisaltoalue') }}
            </ep-button>
            <div v-else/>

            <ep-button variant="link" icon="delete" @click="poistaSisaltoalue(sisaltoalue)">
              {{ $t('poista-sisaltoalue') }}
            </ep-button>
          </div>
        </div>
      </draggable>

      <ep-button variant="outline-primary" icon="add" v-if="model.sisaltoalueet && model.sisaltoalueet.length === 0" @click="lisaaSisaltoalue()" class="mt-3">
        {{ $t('lisaa-sisaltoalue') }}
      </ep-button>

      <template #modal-footer>
        <div>
          <ep-button @click="peruuta" variant="link">{{ $t('peruuta')}}</ep-button>
          <ep-button :showSpinner="tallennetaan" @click="tallenna">{{ $t('tallenna')}}</ep-button>
        </div>
      </template>

    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import * as _ from 'lodash';
import { computed, ref } from 'vue';
import draggable from 'vuedraggable';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { Kielet } from '@shared/stores/kieli';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { PerusopetusOppiaineStore } from '@/stores/PerusopetusOppiaineStore';
import { OppiaineenVuosiluokkaKokonaisuusDto } from '@shared/api/eperusteet';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $kaanna, $t, $fail } from '@shared/utils/globals';
import { useTemplateRef } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object as () => OppiaineenVuosiluokkaKokonaisuusDto,
    required: true,
  },
  vuosiluokat: {
    type: String,
    required: false,
  },
  isEditing: {
    type: Boolean,
    required: false,
    default: false,
  },
  oppiaineId: {
    type: [String, Number],
    required: true,
  },
  perusteId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const tempModel = ref<OppiaineenVuosiluokkaKokonaisuusDto | null>(null);
const tallennetaan = ref(false);
const EpSisaltoalueetEditModal = useTemplateRef('EpSisaltoalueetEditModal');

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const title = computed(() => {
  if (model.value.sisaltoalueinfo?.otsikko && model.value.sisaltoalueinfo?.otsikko[kieli.value]) {
    return $kaanna(model.value.sisaltoalueinfo.otsikko);
  }

  return $t('sisaltoalueet-vuosiluokilla-' + props.vuosiluokat);
});

const sisaltoalueetDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    group: {
      name: 'sisaltoalueet',
    },
  };
});

const avaa = () => {
  tempModel.value = _.cloneDeep(model.value);
  EpSisaltoalueetEditModal.value.show();
};

const sulje = () => {
  tallennetaan.value = false;
  EpSisaltoalueetEditModal.value.hide();
};

const tallenna = async () => {
  tallennetaan.value = true;
  try {
    model.value = await PerusopetusOppiaineStore.updateOppiaineenVuosiluokkakokonaisuus(props.perusteId, props.oppiaineId, model.value);
    sulje();
  }
  catch (e) {
    $fail($t('virhe-palvelu-virhe') as string);
  }
  finally {
    tallennetaan.value = false;
  }
};

const peruuta = () => {
  model.value = tempModel.value!;
  sulje();
};

const lisaaSisaltoalue = () => {
  model.value.sisaltoalueet = [
    ...model.value.sisaltoalueet!,
    {},
  ];
};

const poistaSisaltoalue = (poistettavaSisaltoalue) => {
  model.value.sisaltoalueet = _.reject(model.value.sisaltoalueet, poistettavaSisaltoalue);
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.muokkaa {
  :deep(.btn) {
    padding-left: 0px;
  }
}
</style>
