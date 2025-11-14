<template>
  <b-modal
    id="osaamismerkkiModal"
    ref="osaamismerkkiModal"
    class="backdrop"
    :no-close-on-backdrop="true"
    :no-enforce-focus="true"
    :lazy="true"
    size="xl"
    :hide-footer="true"
  >
    <template #modal-header>
      <div class="row w-100">
        <div class="col">
          <span
            v-if="osaamismerkki.id"
            class="mr-2"
          >{{ $t('muokkaa-osaamismerkkia') }}</span>
          <span
            v-else
            class="mr-2"
          >{{ $t('lisaa-osaamismerkki') }}</span>
        </div>
        <div>
          <EpKielivalinta />
        </div>
        <div
          class="close-btn clickable ml-3 pt-1"
          @click="sulje"
        >
          <EpMaterialIcon
            aria-hidden="false"
            :aria-label="$t('sulje')"
          >
            close
          </EpMaterialIcon>
        </div>
      </div>
    </template>

    <div class="mb-2">
      <b-row
        v-if="osaamismerkki.id"
        no-gutters
      >
        <b-col lg="8">
          <b-form-group :label="$t('tila')">
            <div class="d-flex">
              <EpToggle
                v-model="isJulkinen"
                checkbox
              >
                {{ $t('naytetaan-julkisena') }}
              </EpToggle>
              <span
                v-if="osaamismerkki.muokattu"
                class="muokattu-text ml-1"
              >{{ muokkausText + $sdt(osaamismerkki.muokattu) }}</span>
            </div>
            <div />
          </b-form-group>
        </b-col>

        <b-col lg="4">
          <b-form-group
            v-if="osaamismerkki.koodiUri"
            :label="$t('koodi')"
          >
            <span>{{ koodi }}</span>
          </b-form-group>
        </b-col>
      </b-row>

      <b-form-group :label="$t('nimi') + ' *'">
        <EpInput
          v-model="osaamismerkki.nimi"
          :is-editing="true"
        />
      </b-form-group>

      <b-form-group :label="$t('kuvaus')">
        <EpInput
          v-model="osaamismerkki.kuvaus"
          :is-editing="true"
        />
      </b-form-group>

      <b-form-group :label="$t('teema') + ' *'">
        <EpMultiSelect
          v-model="osaamismerkki.kategoria"
          :is-editing="true"
          :options="osaamismerkkiKategoriat"
          :placeholder="$t('kaikki')"
        >
          <template #singleLabel="{ option }">
            {{ $kaanna(option.nimi) }}
          </template>
          <template #option="{ option }">
            {{ $kaanna(option.nimi) }}
          </template>
          <template #tag="{ option }">
            {{ $kaanna(option.nimi) }}
          </template>
        </EpMultiSelect>
      </b-form-group>

      <b-form-group :label="$t('voimassaolo') + ' *'">
        <div class="d-flex align-items-center">
          <EpDatepicker
            v-model="osaamismerkki.voimassaoloAlkaa"
            :is-editing="true"
          />
          <div class="ml-2 mr-2">
            -
          </div>
          <EpDatepicker
            v-model="osaamismerkki.voimassaoloLoppuu"
            :is-editing="true"
          />
        </div>
      </b-form-group>
    </div>

    <b-form-group :label="$t('osaamistavoitteet') + ' *'">
      <VueDraggable
        v-bind="defaultDragOptions"
        v-model="osaamismerkki.osaamistavoitteet"
        tag="div"
      >
        <div
          v-if="osaamismerkki.osaamistavoitteet?.length > 0"
          class="mb-1 font-italic"
        >
          <span>{{ $t('osaamismerkin-suorittaja') }}...</span>
        </div>
        <div
          v-for="(tavoite, i) in osaamismerkki.osaamistavoitteet"
          :key="'tavoite'+i"
          class="row mb-2"
        >
          <div class="col">
            <EpInput
              v-model="tavoite.osaamistavoite"
              :is-editing="true"
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
              variant="link"
              icon="delete"
              @click="poistaTavoite(tavoite)"
            />
          </div>
        </div>
      </VueDraggable>
      <EpButton
        variant="outline-primary"
        icon="add"
        @click="lisaaTavoite"
      >
        {{ $t('lisaa-osaamistavoite') }}
      </EpButton>
    </b-form-group>

    <b-form-group :label="$t('arviointikriteerit') + ' *'">
      <VueDraggable
        v-bind="defaultDragOptions"
        v-model="osaamismerkki.arviointikriteerit"
        tag="div"
      >
        <div
          v-if="osaamismerkki.arviointikriteerit?.length > 0"
          class="mb-1 font-italic"
        >
          <span>{{ $t('osaamismerkin-suorittaja') }}...</span>
        </div>
        <div
          v-for="(kriteeri, i) in osaamismerkki.arviointikriteerit"
          :key="'kriteeri'+i"
          class="row mb-2"
        >
          <div class="col">
            <EpInput
              v-model="kriteeri.arviointikriteeri"
              :is-editing="true"
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
              variant="link"
              icon="delete"
              @click="poistaKriteeri(kriteeri)"
            />
          </div>
        </div>
      </VueDraggable>
      <EpButton
        variant="outline-primary"
        icon="add"
        @click="lisaaKriteeri"
      >
        {{ $t('lisaa-arviointikriteeri') }}
      </EpButton>
    </b-form-group>

    <div class="float-right">
      <EpButton
        variant="link"
        @click="sulje"
      >
        {{ $t('peruuta') }}
      </EpButton>
      <EpButton
        v-if="osaamismerkki.id"
        :show-spinner="tallennetaan"
        :disabled="isJulkinen"
        @click="poistaOsaamismerkki"
      >
        {{ $t('poista') }}
      </EpButton>
      <EpButton
        class="ml-2"
        :show-spinner="tallennetaan"
        :disabled="invalid"
        @click="tallenna"
      >
        {{ $t('tallenna') }}
      </EpButton>
    </div>
  </b-modal>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef, reactive } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { OsaamismerkitStore } from '@/stores/OsaamismerkitStore';
import * as _ from 'lodash';
import { OsaamismerkkiDto, OsaamismerkkiDtoTilaEnum } from '@shared/generated/eperusteet';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { Kieli } from '@shared/tyypit';
import { useVuelidate } from '@vuelidate/core';
import { notNull, requiredLokalisoituTeksti } from '@shared/validators/required';
import { required } from '@vuelidate/validators';
import { $t, $kaanna, $sdt, $success, $fail } from '@shared/utils/globals';
import EpToggle from '@shared/components/forms/EpToggle.vue';

const props = defineProps<{
  store: OsaamismerkitStore;
}>();

const osaamismerkkiModal = useTemplateRef('osaamismerkkiModal');
const osaamismerkki = ref<OsaamismerkkiDto>({
  osaamistavoitteet: [],
  arviointikriteerit: [],
});
const tallennetaan = ref(false);

const defaultDragOptions = {
  animation: 300,
  emptyInsertThreshold: 10,
  handle: '.order-handle',
  ghostClass: 'dragged',
  disabled: false,
};

const createValidationStructure = (tila: OsaamismerkkiDtoTilaEnum) => {
  const kielet = tila === OsaamismerkkiDtoTilaEnum.JULKAISTU ? [Kieli.fi, Kieli.sv] : [Kieli.fi];
  return {
    osaamismerkki: {
      nimi: requiredLokalisoituTeksti(kielet),
      kategoria: notNull(),
      voimassaoloAlkaa: notNull(),
      osaamistavoitteet: {
        $each: {
          osaamistavoite: requiredLokalisoituTeksti(kielet),
        },
        required,
      },
      arviointikriteerit: {
        $each: {
          arviointikriteeri: requiredLokalisoituTeksti(kielet),
        },
        required,
      },
    },
  };
};

const state = reactive({
  rules: createValidationStructure(OsaamismerkkiDtoTilaEnum.LAADINTA),
});

const v$ = useVuelidate(state.rules, { osaamismerkki });

const init = () => {
  osaamismerkki.value = {
    osaamistavoitteet: [],
    arviointikriteerit: [],
    tila: OsaamismerkkiDtoTilaEnum.LAADINTA,
  };
  state.rules = createValidationStructure(OsaamismerkkiDtoTilaEnum.LAADINTA);
};

const avaaModal = (merkki) => {
  if (merkki) {
    osaamismerkki.value = _.cloneDeep(merkki);
    state.rules = createValidationStructure(osaamismerkki.value.tila!);
  }
  else {
    init();
  }
  (osaamismerkkiModal.value as any).show();
};

const tallenna = async () => {
  tallennetaan.value = true;
  try {
    await props.store.updateOsaamismerkki(osaamismerkki.value);
    tallennetaan.value = false;
    $success($t('osaamismerkin-paivitys-onnistui') as string);
    await props.store.updateOsaamismerkkiQuery(props.store.options.value);
    sulje();
  }
  catch (err) {
    tallennetaan.value = false;
    $fail($t('osaamismerkin-paivitys-epaonnistui') as string);
  }
};

const poistaOsaamismerkki = async () => {
  try {
    await props.store.deleteOsaamismerkki(osaamismerkki.value.id);
    tallennetaan.value = false;
    $success($t('osaamismerkin-poistaminen-onnistui') as string);
    await props.store.updateOsaamismerkkiQuery(props.store.options.value);
    sulje();
  }
  catch (err) {
    tallennetaan.value = false;
    $fail($t('osaamismerkin-poistaminen-epaonnistui') as string);
  }
};

const sulje = () => {
  osaamismerkki.value = {};
  (osaamismerkkiModal.value as any).hide();
};

const poistaTavoite = (poistettavaTavoite) => {
  osaamismerkki.value.osaamistavoitteet = _.filter(osaamismerkki.value.osaamistavoitteet, (tavoite) => tavoite !== poistettavaTavoite);
};

const lisaaTavoite = () => {
  osaamismerkki.value.osaamistavoitteet?.push({
    osaamistavoite: undefined,
  });
};

const poistaKriteeri = (poistettavaKriteeri) => {
  osaamismerkki.value.arviointikriteerit = _.filter(osaamismerkki.value.arviointikriteerit, (kriteeri) => kriteeri !== poistettavaKriteeri);
};

const lisaaKriteeri = () => {
  osaamismerkki.value.arviointikriteerit?.push({
    arviointikriteeri: undefined,
  });
};

const isJulkinen = computed({
  get: () => osaamismerkki.value.tila === OsaamismerkkiDtoTilaEnum.JULKAISTU,
  set: (tila) => {
    osaamismerkki.value.tila = tila ? OsaamismerkkiDtoTilaEnum.JULKAISTU : OsaamismerkkiDtoTilaEnum.LAADINTA;
    state.rules = createValidationStructure(osaamismerkki.value.tila!);
  },
});

const osaamismerkkiKategoriat = computed(() => {
  return props.store.kategoriat.value;
});

const invalid = computed(() => {
  return v$.value.$invalid;
});

const muokkausText = computed(() => {
  return ' - ' + $t('muokannut-viimeksi') + ': ' + osaamismerkki.value.muokkaaja + ' ';
});

const koodi = computed(() => {
  return osaamismerkki.value.koodiUri ? osaamismerkki.value.koodiUri.split('_')[1] : null;
});

defineExpose({
  avaaModal,
});
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.muokattu-text {
  color: $gray-lighten-12;
}
</style>
