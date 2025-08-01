<template>
  <EpEditointi
    :store="store"
    :versionumero="versionumero"
  >
    <template #header="{ data }">
      <h2 v-if="data.nimi">
        {{ $kaanna(data.nimi) }}
      </h2>
      <h2
        v-else
        class="font-italic"
      >
        {{ $t('nimeton') }}
      </h2>
    </template>

    <template #default="{ data, isEditing }">
      <div class="col-11 pl-0">
        <div
          v-if="isEditing"
          class="mt-1"
        >
          <h3>{{ $t('vaiheen-nimi') }} *</h3>
          <ep-input
            v-model="data.nimi"
            :is-editing="true"
          />
        </div>

        <hr
          v-if="isEditing"
          class="mt-5"
        >

        <EpSisaltoTekstikappaleet
          v-model="storeData"
          :is-editing="isEditing"
          :sisalto-avaimet="['paikallisestiPaatettavatAsiat', 'siirtymaEdellisesta', 'siirtymaSeuraavaan', 'tehtava']"
        />

        <template v-if="vaiheId">
          <b-form-group :label="$t('oppiaineet')">
            <VueDraggable
              v-bind="oppiaineetDragOptions"
              v-model="data.oppiaineet"
              tag="div"
            >
              <div
                v-for="oppiaine in data.oppiaineet"
                :key="'oppiaine'+oppiaine.id"
                class="oppiaine p-3 d-flex"
              >
                <EpMaterialIcon
                  v-if="isEditing"
                  class="order-handle mr-2"
                >
                  drag_indicator
                </EpMaterialIcon>
                <router-link :to="{ name: 'aipeoppiaine', params: { oppiaineId: oppiaine.id } }">
                  {{ $kaanna(oppiaine.nimi) || $t('nimeton-oppiaine') }}
                </router-link>
              </div>
            </VueDraggable>
          </b-form-group>

          <ep-button
            v-if="!isEditing"
            v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
            variant="outline-primary"
            icon="add"
            @click="lisaaOppiaine"
          >
            {{ $t('lisaa-oppiaine') }}
          </ep-button>

          <hr>
        </template>

        <b-form-group
          class="mt-4"
          :label="$t('opetuksen-tavoitealueet')"
        >
          <div v-if="isEditing">
            <VueDraggable
              v-bind="defaultDragOptions"
              v-model="data.opetuksenKohdealueet"
              tag="div"
            >
              <b-row
                v-for="(kohdealue, index) in data.opetuksenKohdealueet"
                :key="'tavoite'+index"
                class="pb-2"
              >
                <b-col cols="11">
                  <ep-input
                    v-model="kohdealue.nimi"
                    :is-editing="isEditing"
                  >
                    <template #left>
                      <div class="order-handle m-2">
                        <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                      </div>
                    </template>
                  </ep-input>
                </b-col>
                <b-col
                  v-if="isEditing"
                  cols="1"
                >
                  <div
                    class="default-icon clickable mt-2"
                    @click="poistaKohdealue(kohdealue)"
                  >
                    <EpMaterialIcon>delete</EpMaterialIcon>
                  </div>
                </b-col>
              </b-row>
            </VueDraggable>

            <ep-button
              v-if="isEditing"
              variant="outline"
              icon="add"
              @click="lisaaKohdealue"
            >
              {{ $t('lisaa-tavoitealue') }}
            </ep-button>
          </div>

          <div v-else>
            <ul>
              <li
                v-for="(kohdealue, index) in data.opetuksenKohdealueet"
                :key="'tavoite'+index"
              >
                {{ $kaanna(kohdealue.nimi) }}
              </li>
            </ul>
          </div>
        </b-form-group>
      </div>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { AipeVaiheStore } from '@/stores/AipeVaiheStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { VueDraggable } from 'vue-draggable-plus';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpSisaltoTekstikappaleet from '@/components/EpSisaltoTekstikappaleet.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $kaanna, $t } from '@shared/utils/globals';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
  vaiheId: {
    type: [String, Number],
    required: false,
  },
});

const route = useRoute();
const router = useRouter();
const store = ref<EditointiStore | null>(null);

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const sisaltoTekstiAvaimet = computed(() => {
  return _.filter(['paikallisestiPaatettavatAsiat', 'siirtymaEdellisesta', 'siirtymaSeuraavaan', 'tehtava'], avain => !!_.get(store.value?.data, avain));
});

const storeData = computed({
  get: () => store.value?.data,
  set: (data) => store.value?.setData(data),
});

const isEditing = computed(() => {
  return store.value?.isEditing;
});

const defaultDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
  };
});

const oppiaineetDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !isEditing.value,
    group: {
      name: 'oppiaineet',
    },
  };
});

const postSave = async () => {
  await props.perusteStore.updateNavigation();
};

const lisaaKohdealue = () => {
  store.value?.setData(
    {
      ...store.value.data.value,
      opetuksenKohdealueet: [
        ...store.value.data.value.opetuksenKohdealueet,
        {},
      ],
    },
  );
};

const poistaKohdealue = (poistettavaKohdealue) => {
  store.value?.setData(
    {
      ...store.value.data.value,
      opetuksenKohdealueet: _.filter(store.value.data.value.opetuksenKohdealueet, kohdealue => kohdealue !== poistettavaKohdealue),
    },
  );
};

const lisaaOppiaine = () => {
  router.push({ name: 'aipeoppiaine', params: { vaiheId: props.vaiheId } });
};

const vaiheChange = async () => {
  const storeInstance = new AipeVaiheStore(perusteId.value!, props.vaiheId, props.perusteStore, versionumero.value);
  store.value = new EditointiStore(storeInstance);
};

watch(() => props.vaiheId, async () => {
  await vaiheChange();
}, { immediate: true });

watch(versionumero, async () => {
  await vaiheChange();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

  .oppiaine:nth-of-type(even) {
    background-color: $table-even-row-bg-color;
  }
  .oppiaine:nth-of-type(odd) {
    background-color: $table-odd-row-bg-color;
  }
</style>
