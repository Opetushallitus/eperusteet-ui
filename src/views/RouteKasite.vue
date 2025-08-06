<template>
  <ep-sub-view :header="$t('kasitteet')">
    <ep-spinner v-if="!termit" />
    <div v-else>
      <div class="d-flex justify-content-between">
        <ep-search
          v-model="query"
          class="mb-3"
          :placeholder="$t('etsi')"
        />
        <ep-button
          v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
          variant="outline"
          icon="add"
          @click="avaaMuokkausModal()"
        >
          {{ $t('lisaa-kasite') }}
        </ep-button>
      </div>
      <div
        v-if="termit.length > 0"
        class="kasitelista m-3"
      >
        <div
          v-for="(termi) in termitFiltered"
          :key="'termi-' + termi.id"
          class="row align-items-start"
          :class="{open: !termi.closed}"
        >
          <div
            class="col col-3 font-weight-bold pl-3"
            v-html="$kaanna(termi.termi)"
          />
          <div class="col col-6 pl-3">
            <ep-content
              :model-value="termi.selitys"
              layout="normal"
            />
          </div>
          <div class="col col-3 text-right toiminnot">
            <button
              class="btn btn-link"
              @click="avaaPoistoModal(termi)"
            >
              <EpMaterialIcon>delete</EpMaterialIcon>
            </button>
            <button
              class="btn btn-link"
              @click="avaaMuokkausModal(termi)"
            >
              <EpMaterialIcon>edit</EpMaterialIcon>
            </button>
            <button
              class="btn btn-link"
              @click="toggleTermi(termi)"
            >
              <EpMaterialIcon v-if="termi.closed">
                expand_more
              </EpMaterialIcon>
              <EpMaterialIcon v-else>
                expand_less
              </EpMaterialIcon>
            </button>
          </div>
        </div>
      </div>

      <div v-else>
        {{ $t('ei-termeja') }}
      </div>
    </div>

    <b-modal
      id="kasitteenPoistoModal"
      ref="kasitteenPoistoModal"
      class="backdrop"
      :lazy="true"
      size="lg"
      @ok="poistaKasite"
    >
      <span class="mr-2">{{ $t('haluatko-poistaa-kasitteen') }}</span>
      <template #modal-cancel>
        {{ $t('peruuta') }}
      </template>
      <template #modal-ok>
        {{ $t('poista') }}
      </template>
    </b-modal>

    <b-modal
      id="kasitteenLuontiModal"
      ref="kasitteenLuontiModal"
      class="backdrop"
      :no-close-on-backdrop="true"
      :no-enforce-focus="true"
      :lazy="true"
      :ok-disabled="validation.$invalid"
      size="lg"
      @ok="tallennaKasite"
    >
      <template #modal-header>
        <div class="row w-100">
          <div class="col">
            <span class="mr-2">{{ kasite.id ? $t('muokkaa-kasitetta') : $t('lisaa-uusi-kasite') }}</span>
          </div>
          <div class="col text-right">
            <ep-kielivalinta />
          </div>
        </div>
      </template>

      <ep-form-content name="kasite-termi">
        <ep-input
          v-model="kasite.termi"
          type="localized"
          help="kasite-termi-ohje"
          :validation="validation.termi"
          :is-editing="true"
        />
      </ep-form-content>
      <ep-form-content name="kasite-selitys">
        <ep-content
          v-model="kasite.selitys"
          help="kasite-selitys-ohje"
          :validation="validation.selitys"
          :is-editable="true"
          layout="normal"
        />
      </ep-form-content>

      <ep-form-content name="alaviitteessa">
        <ep-toggle v-model="kasite.alaviite">
          {{ $t('nayta-alaviitteessa') }}
        </ep-toggle>
      </ep-form-content>

      <template #modal-cancel>
        {{ $t('peruuta') }}
      </template>
      <template #modal-ok>
        {{ kasite.id ? $t('tallenna') : $t('lisaa-kasite') }}
      </template>
    </b-modal>
  </ep-sub-view>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, watch, onMounted, useTemplateRef, getCurrentInstance } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { Kielet } from '@shared/stores/kieli';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpField from '@shared/components/forms/EpField.vue';
import { TermitStore } from '@/stores/TermitStore';
import { TermiDto } from '@shared/api/eperusteet';
import EpSubView from '@shared/components/EpSubView/EpSubView.vue';
import { kasiteValidator } from '@shared/validators/kasite';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $success, $fail } from '@shared/utils/globals';
import { PerusteStore } from '@/stores/PerusteStore';
import { nextTick } from 'vue';


const props = defineProps<{
  termitStore: TermitStore;
  perusteStore: PerusteStore;
}>();

const kasitteenPoistoModal = useTemplateRef('kasitteenPoistoModal');
const kasitteenLuontiModal = useTemplateRef('kasitteenLuontiModal');

const query = ref('');
const kasite = ref<TermiDto>({});
const toggled = ref<number[]>([]);

const rules = computed(() => ({
  kasite: {
    ...kasiteValidator([
      Kielet.getSisaltoKieli.value,
    ]),
  },
}));

const v$ = useVuelidate(rules, { kasite });
const validation = computed(() => v$.value.kasite);

const termit = computed(() => {
  return props.termitStore.termit.value;
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const termitToggled = computed(() => {
  return _.map(termit.value, termi => {
    return {
      ...termi,
      closed: !_.includes(toggled.value, termi.id),
    };
  });
});

const termitFiltered = computed(() => {
  return _.filter(termitToggled.value, termi => Kielet.search(query.value, termi.termi) || Kielet.search(query.value, termi.selitys));
});

const onProjektiChange = async () => {
  if (perusteId.value) {
    props.termitStore.init(perusteId.value);
  }
};

const toggleTermi = (termi: any) => {
  if (_.includes(toggled.value, termi.id)) {
    toggled.value = _.reject(toggled.value, id => id === termi.id);
  }
  else {
    toggled.value = [...toggled.value, termi.id];
  }
};

const avaaMuokkausModal = (termi?: TermiDto) => {
  // if (!termi) {
  //   kasite.value = {};
  // }
  // else {
  //   kasite.value = _.cloneDeep(termi);
  // }
  (kasitteenLuontiModal.value as any).show();
};

const avaaPoistoModal = (kasiteItem: any) => {
  kasite.value = _.cloneDeep(kasiteItem);
  (kasitteenPoistoModal.value as any).show();
};

const poistaKasite = async () => {
  try {
    await props.termitStore.delete(perusteId.value!, kasite.value);
    $success($t('kasite-poistettu') as string);
  }
  catch (err) {
    $fail($t('kasite-poisto-epaonnistui') as string);
  }
};

const tallennaKasite = async () => {
  try {
    await props.termitStore.save(perusteId.value!, kasite.value);
    await nextTick();
    $success($t('kasite-tallennettu') as string);
  }
  catch (err) {
    console.error(err);
    $fail($t('kasite-tallennus-epaonnistui') as string);
  }
};

// Initialize component when projekti changes
onMounted(async () => {
  await onProjektiChange();
});

// Watch for changes in perusteId
watch(() => perusteId.value, async () => {
  await onProjektiChange();
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables';

  .kasitelista {
    .row:nth-child(odd) {
      background-color: $table-odd-row-bg-color;
    }

    .row{

      .col:not(.toiminnot) {
        padding-top: 10px;
        padding-bottom: 10px;
      }

      :deep(p) {
        margin: 0;
      }

      .btn {
        color: $black;
      }

      :deep(.btn-link:focus, .btn-link:active) {
        outline: none !important;
      }
    }

    .row:not(.open) {
      min-width: auto;
      overflow: hidden;

      height: 2.5em;
      white-space: nowrap;
      text-overflow: ellipsis;

      :deep(p) {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        height: 2.5em;
      }

    }
  }
</style>
