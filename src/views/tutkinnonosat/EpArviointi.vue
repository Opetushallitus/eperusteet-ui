<template>
  <b-form-group>
    <template #label>
      <div>
        <div v-if="isEditing" class="mb-2">{{$t('ammattitaitovaatimus-tekemisena')}}</div>
        <EpInput :isEditing="isEditing" v-model="arvioinninKohdeAlue.otsikko" :class="{'mb-3': isEditing }"/>
      </div>
    </template>
    <VueDraggable v-bind="defaultDragOptions"
               tag="div"
               v-model="arvioinninKohdeAlue.arvioinninKohteet">
      <div class="ml-3 mt-2 d-flex" v-for="(arvioinninKohde, arvindex) in arvioinninKohdeAlue.arvioinninKohteet" :key="'arvioinninKohde' + arvindex">
        <div v-if="isEditing" class="order-handle">
          <EpMaterialIcon>drag_indicator</EpMaterialIcon>
        </div>
        <div class="w-100">
          <div class="mb-2">
            <div class="mb-1 font-weight-600" v-if="isEditing || !!$kaanna(arvioinninKohde.otsikko)">
              <span v-if="isEditing">{{$t('ryhmittelyotsikko-vapaaehtoinen')}}</span>
              <span v-if="!isEditing">{{$t('ryhmittelyotsikko')}}</span>
            </div>
            <EpInput :isEditing="isEditing" v-model="arvioinninKohde.otsikko" />
          </div>
          <div class="mb-3">
            <div class="mb-1 font-weight-600" v-if="isEditing || !!$kaanna(arvioinninKohde.selite)">{{$t('arvioinnin-kohde')}}</div>
            <EpInput :isEditing="isEditing" v-model="arvioinninKohde.selite" />
          </div>

          <template v-if="!arvioinninKohde._arviointiAsteikko">
            <div class="font-weight-600">{{$t('arviointi-asteikon-valinta')}}</div>
            <b-form-radio-group v-model="arvioinninKohde._arviointiAsteikko" stacked @input="arviointiVaihdos(arvioinninKohde)" class="mt-2">
              <b-form-radio
                class="mt-2"
                v-for="arviointiasteikko in arviointiasteikot"
                name="arviointiasteikko"
                :value="arviointiasteikko.id"
                :key="'arviointiasteikko-' + arviointiasteikko.id">

              <span v-for="(osaamistaso, index) in arviointiasteikko.osaamistasot" :key="'osaamistaso' + osaamistaso.id">
                <span v-if="index > 0"> / </span>
                {{$kaanna(osaamistaso.otsikko)}}
              </span>

              </b-form-radio>
            </b-form-radio-group>
          </template>

          <template v-else>
            <OsaamistasonKriteeri
              class="mb-3 ml-0 p-1 taulukko-rivi-varitys"
              v-for="(osaamistasonkriteeri, osaamistasoIndex) in arvioinninKohde.osaamistasonKriteerit"
              :key="'osaamistasonkriteeri'+osaamistasonkriteeri._osaamistaso"
              v-model="arvioinninKohde.osaamistasonKriteerit[osaamistasoIndex]"
              :isEditing="isEditing"
              :arviointiasteikko="arviointiasteikotKeyById[arvioinninKohde._arviointiAsteikko]"
            />
          </template>

          <div class="d-flex mb-2 mt-4" :class="{'justify-content-end' : !arvioinninKohde._arviointiAsteikko, 'justify-content-between': arvioinninKohde._arviointiAsteikko}">
            <EpButton v-if="isEditing && arvioinninKohde._arviointiAsteikko" variant="link" icon="refresh" @click="poistaArviointiasteikko(arvioinninKohde)">
              {{$t('vaihda-arviointiasteikko')}}
            </EpButton>

            <EpButton v-if="isEditing" variant="link" icon="delete" @click="poistaArvioinninKohde(arvioinninKohde)">
              {{$t('poista-ryhmittelyotsikko')}}
            </EpButton>
          </div>

          <hr v-if="arvindex < arvioinninKohdeAlue.arvioinninKohteet.length - 1" class="mb-2"/>
        </div>
      </div>
    </VueDraggable>
    <hr v-if="isEditing" class="mb-2"/>
    <div class="d-flex justify-content-between">
      <EpButton v-if="isEditing" variant="outline" icon="add" @click="lisaaArvionninkohde">{{$t('lisaa-ryhmittelyotsikko')}}</EpButton>
      <slot name="poisto" />
    </div>
  </b-form-group>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { VueDraggable } from 'vue-draggable-plus';
import { computed } from 'vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import OsaamistasonKriteeri from '@/views/tutkinnonosat/OsaamistasonKriteeri.vue';
import { Kielet } from '@shared/stores/kieli';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  modelValue: any;
  isEditing: boolean;
  arviointiasteikot: any;
}>();

const emit = defineEmits(['update:modelValue']);

const arvioinninKohdeAlue = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const arviointiasteikotKeyById = computed(() => {
  return _.keyBy(_.map(props.arviointiasteikot, arviointiasteikko => {
    return {
      ...arviointiasteikko,
      osaamistasot: _.keyBy(arviointiasteikko.osaamistasot, 'id'),
    };
  }), 'id');
});

function lisaaArvionninkohde() {
  arvioinninKohdeAlue.value.arvioinninKohteet = [
    ...arvioinninKohdeAlue.value.arvioinninKohteet,
    {
      selite: {
        [kieli.value]: $t('opiskelija') },
    },
  ];
}

function poistaArvioinninKohde(poistettavaKohde: any) {
  arvioinninKohdeAlue.value.arvioinninKohteet = _.filter(arvioinninKohdeAlue.value.arvioinninKohteet, arvioinninKohde => arvioinninKohde !== poistettavaKohde);
}

function arviointiVaihdos(muokattavaArvioinninKohde: any) {
  arvioinninKohdeAlue.value.arvioinninKohteet = _.map(arvioinninKohdeAlue.value.arvioinninKohteet, arvioinninKohde => {
    if (arvioinninKohde === muokattavaArvioinninKohde) {
      const arviointiasteikko = arviointiasteikotKeyById.value[arvioinninKohde._arviointiAsteikko];
      return {
        ...arvioinninKohde,
        osaamistasonKriteerit: _.map(arviointiasteikko.osaamistasot, osaamistaso => ({
          _osaamistaso: _.toString(osaamistaso.id),
          kriteerit: [],
        })),
      };
    }

    return arvioinninKohde;
  });
}

function poistaArviointiasteikko(arvioinninKohde: any) {
  arvioinninKohde._arviointiAsteikko = null;
}

const defaultDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
  };
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
