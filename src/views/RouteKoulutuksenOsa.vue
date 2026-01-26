<template>
  <EpEditointi
    v-if="store"
    :store="store"
    :versionumero="versionumero"
  >
    <template #header="{ data }">
      <h2 class="m-0">
        {{ $kaanna(data.nimiKoodi ? data.nimiKoodi.nimi : data.nimi) || $t('nimeton-koulutuksen-osa') }}
      </h2>
    </template>
    <template #default="{ data, isEditing, validation }">
      <b-row class="mb-4">
        <b-col>
          <b-form-group
            :label="$t('koulutustyyppi') + (isEditing ? ' *' : '')"
            required
          >
            <p
              v-if="isEditing"
              class="font-size-08"
            >
              {{ $t('koulutustyyppi-info') }}
            </p>
            <template v-if="isEditing">
              <EpRadio
                v-for="type in koulutusOsanKoulutustyypit"
                :key="type"
                v-model="data.koulutusOsanKoulutustyyppi"
                class="ml-1"
                :value="type"
                name="koulutustyyppi"
                :validation="validation.koulutusOsanKoulutustyyppi"
              >
                {{ $t(type) }}
              </EpRadio>
            </template>
            <template v-else>
              {{ $t(data.koulutusOsanKoulutustyyppi) }}
            </template>
            <p
              v-if="!isEditing && !data.koulutusOsanKoulutustyyppi"
              class="font-italic"
            >
              {{ $t('ei-asetettu') }}
            </p>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-4">
        <b-col md="6">
          <b-form-group
            :label="$t('koulutuksen-osan-nimi') + (isEditing ? ' *' : '')"
            required
          >
            <EpKoodistoSelect
              v-model="data.nimiKoodi"
              :store="koodisto"
              :is-editing="isEditing"
              :nayta-arvo="false"
              @add="onNimiKoodiAdd()"
            >
              <template #default="{ open }">
                <b-input-group>
                  <b-form-input
                    v-if="data.nimi && !data.nimiKoodi"
                    class="font-italic"
                    :value="$kaanna(data.nimi)"
                    disabled
                  />
                  <b-form-input
                    v-else
                    :value="data.nimiKoodi ? $kaanna(data.nimiKoodi.nimi) : ''"
                    disabled
                  />
                  <b-input-group-append>
                    <b-button
                      variant="primary"
                      @click="open"
                    >
                      {{ $t('hae-koodistosta') }}
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </template>
              <template #empty>
                <div v-if="data.nimi">
                  {{ $kaanna(data.nimi) }}
                </div>
              </template>
            </EpKoodistoSelect>
          </b-form-group>
        </b-col>
        <b-col md="4">
          <b-form-group
            :label="$t('laajuus') + (isEditing ? ' *' : '')"
            required
          >
            <div
              v-if="isEditing || !isEditing && laajuusAnnettu"
              class="d-flex align-items-center"
            >
              <EpInput
                v-model="data.laajuusMinimi"
                :is-editing="isEditing"
                :validation="validation.laajuusMinimi"
                type="number"
                :min="0"
              />
              <span :class="isEditing ? 'mx-3' : 'mx-1'">-</span>
              <EpInput
                v-model="data.laajuusMaksimi"
                :is-editing="isEditing"
                :validation="validation.laajuusMaksimi"
                type="number"
                :min="data.laajuusMinimi"
              />
              <span class="ml-2">{{ $t('viikkoa') }}</span>
            </div>
            <p
              v-else-if="!isEditing"
              class="font-italic"
            >
              {{ $t('ei-asetettu') }}
            </p>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-4">
        <b-col>
          <b-form-group
            :label="$t('opintojen-tyyppi') + (isEditing ? ' *' : '')"
            required
          >
            <template v-if="isEditing">
              <EpRadio
                v-for="type in koulutusOsanTyypit"
                :key="type"
                v-model="data.koulutusOsanTyyppi"
                class="ml-1"
                :value="type"
                name="koulutusOsanTyyppi"
                :validation="validation.koulutusOsanTyyppi"
              >
                {{ $t(type) }}
              </EpRadio>
            </template>
            <template v-else>
              {{ $t(data.koulutusOsanTyyppi) }}
            </template>
            <p
              v-if="!isEditing && !data.koulutusOsanTyyppi"
              class="font-italic"
            >
              {{ $t('ei-asetettu') }}
            </p>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-4">
        <b-col md="10">
          <b-form-group :label="$t('kuvaus')">
            <EpContent
              v-if="isEditing || !isEditing && data.kuvaus"
              v-model="data.kuvaus"
              layout="normal"
              :is-editable="isEditing"
              :kuva-handler="kuvaHandler"
            />
            <EpAlert
              v-if="!isEditing && !data.kuvaus"
              :text="$t('ei-sisaltoa')"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <b-col md="10">
          <h3 class="mb-4">
            {{ $t('tavoitteet') }}
          </h3>
          <b-form-group :label="$t('opiskelija')">
            <template v-if="isEditing">
              <VueDraggable
                v-bind="tavoitteetOptions"
                v-model="data.tavoitteet"
                tag="div"
              >
                <b-row
                  v-for="(tavoite, i) in data.tavoitteet"
                  :key="tavoite.id"
                  class="pb-2"
                >
                  <b-col cols="11">
                    <EpInput
                      v-model="data.tavoitteet[i]"
                      :is-editing="isEditing"
                      :disabled="tavoite.uri !== undefined"
                    >
                      <template #left>
                        <div class="order-handle m-2">
                          <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                        </div>
                      </template>
                    </EpInput>
                  </b-col>
                  <b-col
                    v-if="isEditing"
                    cols="1"
                  >
                    <div
                      class="default-icon clickable mt-2"
                      @click="onRemoveListItem(tavoite, 'tavoitteet')"
                    >
                      <EpMaterialIcon icon-shape="outlined">
                        delete
                      </EpMaterialIcon>
                    </div>
                  </b-col>
                </b-row>
              </VueDraggable>
              <EpButton
                v-if="isEditing"
                variant="outline"
                icon="add"
                @click="onAddListItem('tavoitteet')"
              >
                {{ $t('lisaa-tavoite') }}
              </EpButton>
            </template>
            <template v-else-if="data.tavoitteet.length > 0">
              <ul>
                <li
                  v-for="tavoite in data.tavoitteet"
                  :key="tavoite.id"
                >
                  {{ $kaanna(tavoite) }}
                </li>
              </ul>
            </template>
            <p
              v-else-if="!isEditing"
              class="font-italic"
            >
              {{ $t('ei-asetettu') }}
            </p>
          </b-form-group>
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <b-col md="10">
          <b-form-group>
            <template #label>
              <h3>{{ $t('laaja-alainen-osaaminen') }}</h3>
            </template>
            <EpContent
              v-if="isEditing || !isEditing && data.laajaAlaisenOsaamisenKuvaus"
              v-model="data.laajaAlaisenOsaamisenKuvaus"
              layout="normal"
              :is-editable="isEditing"
              :kuva-handler="kuvaHandler"
            />
            <EpAlert
              v-if="!isEditing && !data.laajaAlaisenOsaamisenKuvaus"
              :text="$t('ei-sisaltoa')"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <b-col md="10">
          <b-form-group>
            <template #label>
              <h3>{{ $t('keskeinen-sisalto') }}</h3>
            </template>
            <EpContent
              v-if="isEditing || !isEditing && data.keskeinenSisalto"
              v-model="data.keskeinenSisalto"
              layout="normal"
              :is-editable="isEditing"
              :kuva-handler="kuvaHandler"
            />
            <EpAlert
              v-if="!isEditing && !data.keskeinenSisalto"
              :text="$t('ei-sisaltoa')"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <b-col md="10">
          <b-form-group>
            <template #label>
              <h3>{{ $t('arviointi') }}</h3>
            </template>
            <EpContent
              v-if="isEditing || !isEditing && data.arvioinninKuvaus"
              v-model="data.arvioinninKuvaus"
              layout="normal"
              :is-editable="isEditing"
              :kuva-handler="kuvaHandler"
            />
            <EpAlert
              v-if="!isEditing && !data.arvioinninKuvaus"
              :text="$t('ei-sisaltoa')"
            />
          </b-form-group>
        </b-col>
      </b-row>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';
import * as _ from 'lodash';
import { VueDraggable } from 'vue-draggable-plus';
import { PerusteStore } from '@/stores/PerusteStore';
import { KoulutuksenOsaStore } from '@/stores/KoulutuksenOsaStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { getKoodistoSivutettuna, KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import {
  KoulutuksenOsaDtoKoulutusOsanKoulutustyyppiEnum,
  KoulutuksenOsaDtoKoulutusOsanTyyppiEnum,
} from '@shared/api/eperusteet';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna } from '@shared/utils/globals';
import EpRadio from '@shared/components/forms/EpRadio.vue';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const route = useRoute();
const store = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const koulutuksenosaId = computed(() => {
  return route.params.koulutuksenosaId;
});

const kuvaHandler = inject('kuvaHandler');

const koulutusOsanKoulutustyypit = computed((): string[] => {
  return [
    _.toLower(KoulutuksenOsaDtoKoulutusOsanKoulutustyyppiEnum.TUTKINTOKOULUTUKSEENVALMENTAVA),
    _.toLower(KoulutuksenOsaDtoKoulutusOsanKoulutustyyppiEnum.PERUSOPETUS),
    _.toLower(KoulutuksenOsaDtoKoulutusOsanKoulutustyyppiEnum.LUKIOKOULUTUS),
    _.toLower(KoulutuksenOsaDtoKoulutusOsanKoulutustyyppiEnum.AMMATILLINENKOULUTUS),
  ];
});

const koulutusOsanTyypit = computed((): string[] => {
  return [
    _.toLower(KoulutuksenOsaDtoKoulutusOsanTyyppiEnum.YHTEINEN),
    _.toLower(KoulutuksenOsaDtoKoulutusOsanTyyppiEnum.VALINNAINEN),
  ];
});

const defaultDragOptions = computed(() => {
  return {
    animation: 300,
    emptyInsertThreshold: 10,
    handle: '.order-handle',
    disabled: !store.value?.isEditing,
    ghostClass: 'dragged',
  };
});

const tavoitteetOptions = computed(() => {
  return {
    ...defaultDragOptions.value,
    group: {
      name: 'tavoitteet',
    },
  };
});

const laajuusAnnettu = computed(() => {
  return !_.isNull(store.value?.data.laajuusMinimi) && !_.isNull(store.value?.data.laajuusMaksimi);
});

// Initialize koodisto
const koodisto = new KoodistoSelectStore({
  koodisto: 'koulutuksenosattuva',
  async query(query: string, sivu = 0, koodisto: string) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const tkstore = new KoulutuksenOsaStore(
    perusteId.value!,
    Number(koulutuksenosaId.value),
    versionumero.value,
  );
  store.value = new EditointiStore(tkstore);
};

const onAddListItem = (array: string): void => {
  if (!store.value) return;

  store.value.setData({
    ...store.value.data,
    [array]: [
      ..._.get(store.value.data, array),
      {},
    ],
  });
};

const onRemoveListItem = (rowToRemove: any, array: string) => {
  if (!store.value) return;

  store.value.setData({
    ...store.value.data,
    [array]: _.filter(_.get(store.value.data, array), rivi => rivi !== rowToRemove),
  });
};

const storeData = computed({
  get() {
    return store.value?.data;
  },
  set(data) {
    store.value?.setData(data);
  },
});

const onNimiKoodiAdd = () => {
  storeData.value = {
    ...storeData.value,
    nimi: getNimiValueFromNimiKooodi(storeData.value.nimiKoodi),
  };
};

const getNimiValueFromNimiKooodi = (nimiKoodi: any) => {
  if (!nimiKoodi?.nimi) return {};

  const julkaisukielet = props.perusteStore.julkaisukielet.value;
  const sourceLang = _.includes(julkaisukielet as string[], 'fi') ? 'fi' : julkaisukielet[0];
  return julkaisukielet.reduce((obj, key) => ({ ...obj, [key]: nimiKoodi.nimi?.[sourceLang] }), {});
};

// Watch for changes in koulutuksenosaId
watch(koulutuksenosaId, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

// Watch for changes in versionumero
watch(versionumero, async () => {
  await fetch();
});
</script>

<style scoped lang="scss">

</style>
