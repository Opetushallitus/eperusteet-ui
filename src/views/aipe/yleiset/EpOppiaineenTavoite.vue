<template>
  <div>
    <h4
      v-if="isEditing"
      class="mt-4"
    >
      {{ $t('tavoitteen-nimi') }}
    </h4>
    <ep-input
      v-if="isEditing"
      v-model="model.tavoite"
      :is-editing="isEditing"
    />

    <b-form-group
      class="mt-4"
      :label="$t('opetuksen-tavoitteet')"
    >
      <VueDraggable
        v-bind="defaultDragOptions"
        v-model="model.oppiaineenTavoitteenOpetuksenTavoitteet"
        tag="div"
      >
        <div
          v-for="(tavoite, i) in model.oppiaineenTavoitteenOpetuksenTavoitteet"
          :key="'tavoite'+i"
          class="row mb-2"
        >
          <div class="col">
            <EpInput
              v-model="tavoite.tavoite"
              :is-editing="isEditing"
              class="input-wrapper"
            >
              <template #left>
                <div class="order-handle m-2">
                  <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                </div>
              </template>
            </EpInput>
          </div>
          <div class="col-1">
            <EpButton
              v-if="isEditing"
              variant="link"
              icon="delete"
              @click="poistaOsaamisenTavoite(tavoite)"
            />
          </div>
        </div>
      </VueDraggable>
      <EpButton
        v-if="isEditing"
        variant="outline-primary"
        icon="add"
        @click="lisaaOsaamisenTavoite"
      >
        {{ $t('lisaa-osaamistavoite') }}
      </EpButton>
    </b-form-group>

    <h4 class="mt-4">
      {{ $t('tavoitteista-johdetut-oppimisen-tavoitteet') }}
    </h4>
    <ep-content
      v-model="model.tavoitteistaJohdetutOppimisenTavoitteet"
      layout="normal"
      :is-editable="isEditing"
    />

    <h4 class="mt-4">
      {{ $t('tavoitealue') }}
    </h4>
    <b-row>
      <b-col cols="10">
        <ep-select
          v-if="isEditing"
          v-model="kohdealue"
          :items="supportData.kohdealueet"
          :is-editing="isEditing"
          :enable-empty-option="true"
          :placeholder="'valitse'"
          :empty-option-disabled="true"
        >
          <template #default="{ item }">
            {{ $kaanna(item.nimi) }}
          </template>
        </ep-select>
        <div v-else>
          <span v-if="kohdealue">{{ $kaanna(kohdealue.nimi) }}</span>
          <span
            v-else
            class="disabled-text"
          >{{ $t('ei-asetettu') }}</span>
        </div>
      </b-col>
      <b-col cols="2">
        <ep-button
          v-if="isEditing"
          variant="link"
          @click="kohdealue=null"
        >
          {{ $t('tyhjenna-valinta') }}
        </ep-button>
      </b-col>
    </b-row>

    <h4 class="mt-4">
      {{ $t('laaja-alainen-osaaminen') }}
    </h4>
    <ep-collapse
      v-for="(lao, index) in laajaAlaisetOsaamiset"
      :key="'lao' + index"
      class="mb-3"
      :border-bottom="false"
      :use-padding="false"
      chevron-location="left"
      :expanded-by-default="false"
    >
      <template #header>
        <div class="d-flex">
          <div>{{ $kaanna(lao.nimi) }}</div>
          <div
            v-if="isEditing"
            class="default-icon clickable ml-3 mt-1"
            @click="poistaLaajaAlainenOsaaminen(lao)"
          >
            <EpMaterialIcon>delete</EpMaterialIcon>
          </div>
        </div>
      </template>
      <ep-content
        v-model="lao.kuvaus"
        class="ml-4 pl-1"
        layout="normal"
        :is-editable="false"
      />
    </ep-collapse>

    <b-dropdown
      v-if="isEditing"
      :text="$t('lisaa-laaja-alainen-osaaminen')"
      variant="primary"
    >
      <b-dropdown-item-button
        v-for="(laaja, index) in laajaAlaisetOsaamisetValinnat"
        :key="index+'addlaaja'"
        :disabled="laaja.valittu"
        @click="lisaaLaajaAlainenOsaaminen(laaja)"
      >
        {{ $kaanna(laaja.nimi) }}
      </b-dropdown-item-button>
    </b-dropdown>

    <template v-if="sisaltoalueetValinnat">
      <h4 class="mt-4">
        {{ $t('sisaltoalueet') }}
      </h4>
      <ep-collapse
        v-for="(sisaltoalue, index) in sisaltoalueet"
        :key="'sisaltoalue' + index"
        class="mb-3"
        :border-bottom="false"
        :use-padding="false"
        chevron-location="left"
        :expanded-by-default="false"
      >
        <template #header>
          <div class="d-flex">
            <div>{{ $kaanna(sisaltoalue.nimi) }}</div>
            <div
              v-if="isEditing"
              class="default-icon clickable ml-3 mt-1"
              @click="poistaSisaltoalue(sisaltoalue)"
            >
              <EpMaterialIcon>delete</EpMaterialIcon>
            </div>
          </div>
        </template>
        <ep-content
          v-model="sisaltoalue.kuvaus"
          class="ml-4 pl-1"
          layout="normal"
          :is-editable="false"
        />
      </ep-collapse>

      <b-dropdown
        v-if="isEditing"
        :text="$t('lisaa-sisaltoalue')"
        variant="primary"
      >
        <b-dropdown-item-button
          v-for="(sisaltoalue, index) in sisaltoalueetValinnat"
          :key="index+'addSisaltoalue'"
          :disabled="sisaltoalue.valittu"
          @click="lisaaSisaltoalue(sisaltoalue)"
        >
          {{ $kaanna(sisaltoalue.nimi) }}
        </b-dropdown-item-button>
      </b-dropdown>
    </template>

    <h4 class="mt-4">
      {{ $t('arvoinnin-kohde') }}
    </h4>
    <ep-input
      v-model="model.arvioinninKuvaus"
      :is-editing="isEditing"
    />

    <div
      v-if="isEditing"
      class="mt-4"
    >
      <h4>{{ $t('osaamisen-arvioinnin-otsikko') }}</h4>
      <ep-input
        v-model="model.arvioinninOtsikko"
        :is-editing="isEditing"
      />
    </div>
    <h4
      v-else
      class="mt-4"
    >
      {{ $kaanna(model.arvioinninOtsikko) }}
    </h4>

    <b-row class="mt-4 border-bottom-2 mx-1">
      <b-col cols="4">
        <h5>{{ $t('arviointitaulukko-arvosana-otsikko') }}</h5>
      </b-col>
      <b-col cols="8">
        <h5>{{ $t('arviointitaulukko-osaaminen-otsikko') }}</h5>
      </b-col>
    </b-row>

    <template v-if="isEditing">
      <b-row
        v-for="(arvioinninkohde, index) in model.arvioinninkohteet"
        :key="'arvio'+index"
        class="mt-2 mx-1 py-2 border-bottom"
      >
        <b-col cols="4">
          <ep-select
            v-model="arvioinninkohde.arvosana"
            :items="arvosanat"
            :is-editing="isEditing"
            :enable-empty-option="true"
            :placeholder="'valitse'"
            :empty-option-disabled="true"
          >
            <template #default="{ item }">
              {{ $t('osaamisen-kuvaus-arvosanalle_' + item) }}
            </template>
          </ep-select>
        </b-col>
        <b-col cols="7">
          <ep-input
            v-model="arvioinninkohde.osaamisenKuvaus"
            :is-editing="isEditing"
          />
        </b-col>
        <b-col
          cols="1"
          class="text-center"
        >
          <div
            class="default-icon clickable mt-2"
            @click="poistaArviointi(arvioinninkohde)"
          >
            <EpMaterialIcon
              icon-shape="outlined"
              :color="'inherit'"
            >
              delete
            </EpMaterialIcon>
          </div>
        </b-col>
      </b-row>
    </template>

    <template v-else>
      <b-row
        v-for="(arvioinninkohde, index) in arvioinninKohteetSorted"
        :key="'arvio'+index"
        class="mt-2 mx-1 py-2 listaus"
      >
        <b-col cols="4">
          <div>{{ $t('osaamisen-kuvaus-arvosanalle_' + arvioinninkohde.arvosana) }}</div>
        </b-col>
        <b-col cols="7">
          {{ $kaanna(arvioinninkohde.osaamisenKuvaus) }}
        </b-col>
      </b-row>
    </template>

    <ep-button
      v-if="isEditing"
      class="mt-3"
      variant="outline"
      icon="add"
      @click="lisaaArvosanaRivi"
    >
      {{ $t('lisaa-rivi') }}
    </ep-button>

    <h4 class="mt-4">
      {{ $t('vapaa-tekstisisalto') }}
    </h4>
    <ep-content
      v-if="isEditing || (model.vapaaTeksti && model.vapaaTeksti[sisaltokieli] && model.vapaaTeksti[sisaltokieli].length > 0)"
      v-model="model.vapaaTeksti"
      layout="normal"
      :is-editable="isEditing"
    />
    <div
      v-else
      class="disabled-text"
    >
      {{ $t('ei-sisaltoa') }}
    </div>

    <div
      v-if="isEditing"
      class="text-right"
    >
      <ep-button
        variant="link"
        icon="delete"
        @click="poistaTavoite"
      >
        {{ $t('poista-tavoite') }}
      </ep-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import _ from 'lodash';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { Kielet } from '@shared/stores/kieli';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { VueDraggable } from 'vue-draggable-plus';
import { $kaanna } from '@shared/utils/globals';

interface OppiaineenTavoiteSupportData {
  kohdealueet: any[];
  laajaAlaisetOsaamiset: any[];
  sisaltoalueet?: any[];
}

const props = defineProps<{
  modelValue: any;
  supportData: OppiaineenTavoiteSupportData;
  isEditing?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'poista']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const kohdealue = computed({
  get() {
    return _.find(props.supportData.kohdealueet, kohdealue => _.toString(kohdealue.id) === _.first(model.value.kohdealueet));
  },
  set(val: any) {
    if (val) {
      model.value.kohdealueet = [_.toString(val.id)];
    }
    else {
      model.value.kohdealueet = [];
    }
  },
});

const laajaAlaisetOsaamisetValinnat = computed(() => {
  return _.map(props.supportData.laajaAlaisetOsaamiset, lao => {
    return {
      ...lao,
      valittu: _.includes(model.value.laajattavoitteet, _.toString(lao.id)),
    };
  });
});

const laajaAlaisetOsaamiset = computed(() => {
  return _.filter(props.supportData.laajaAlaisetOsaamiset, lao => _.includes(model.value.laajattavoitteet, _.toString(lao.id)));
});

const lisaaLaajaAlainenOsaaminen = (lao) => {
  model.value.laajattavoitteet = [
    ...model.value.laajattavoitteet,
    _.toString(lao.id),
  ];
};

const poistaLaajaAlainenOsaaminen = (lao) => {
  model.value.laajattavoitteet = _.filter(model.value.laajattavoitteet, laajatavoite => laajatavoite !== _.toString(lao.id));
};

const sisaltoalueetValinnat = computed(() => {
  if (props.supportData.sisaltoalueet) {
    return _.map(props.supportData.sisaltoalueet, sisaltoalue => {
      return {
        ...sisaltoalue,
        valittu: _.includes(model.value.sisaltoalueet, _.toString(sisaltoalue.id)),
      };
    });
  }
  return [];
});

const sisaltoalueet = computed(() => {
  return _.filter(props.supportData.sisaltoalueet, sisaltoalue => _.includes(model.value.sisaltoalueet, _.toString(sisaltoalue.id)));
});

const lisaaSisaltoalue = (sisaltoalue) => {
  model.value.sisaltoalueet = [
    ...model.value.sisaltoalueet,
    _.toString(sisaltoalue.id),
  ];
};

const poistaSisaltoalue = (poistettavaSisaltoalue) => {
  model.value.sisaltoalueet = _.filter(model.value.sisaltoalueet, sisaltoalue => sisaltoalue !== _.toString(poistettavaSisaltoalue.id));
};

const arvosanat = computed(() => {
  return [10, 9, 8, 7, 6, 5, 1];
});

const lisaaArvosanaRivi = () => {
  model.value.arvioinninkohteet = [
    ...model.value.arvioinninkohteet,
    {},
  ];
};

const sisaltokieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const poistaArviointi = (arviointi) => {
  model.value.arvioinninkohteet = _.filter(model.value.arvioinninkohteet, arvioinninkohde => arvioinninkohde !== arviointi);
};

const poistaTavoite = () => {
  emit('poista', model.value);
};

const arvioinninKohteetSorted = computed(() => {
  return _.sortBy(model.value.arvioinninkohteet, 'arvosana');
});

const poistaOsaamisenTavoite = (poistettavaTavoite) => {
  model.value.oppiaineenTavoitteenOpetuksenTavoitteet = _.filter(model.value.oppiaineenTavoitteenOpetuksenTavoitteet, (tavoite) => tavoite !== poistettavaTavoite);
};

const lisaaOsaamisenTavoite = () => {
  model.value.oppiaineenTavoitteenOpetuksenTavoitteet?.push({ tavoite: undefined });
};

const defaultDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
  };
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

  .listaus:nth-of-type(even) {
    background-color: $table-even-row-bg-color;
  }
  .listaus:nth-of-type(odd) {
    background-color: $table-odd-row-bg-color;
  }

</style>
