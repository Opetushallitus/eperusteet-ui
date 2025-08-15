<template>
  <EpEditointi
    :store="store"
    :versionumero="versionumero"
  >
    <template #header="{ data }">
      <h2 v-if="data.koodi">
        {{ $kaanna(data.koodi.nimi) }}
      </h2>
      <h2 v-else-if="data.nimi">
        {{ $kaanna(data.nimi) }}
      </h2>
      <h2
        v-else
        class="font-italic"
      >
        {{ $t('nimeton-oppiaine') }}
      </h2>
    </template>

    <template #default="{ data, isEditing, supportData }">
      <b-row>
        <b-col
          v-if="isEditing"
          cols="8"
        >
          <b-form-group :label="$t('oppiaineen-nimi')">
            <ep-koodisto-select
              v-model="data.koodi"
              :store="koodisto"
              :is-editing="isEditing"
              :nayta-arvo="false"
            >
              <template #default="{ open }">
                <b-input-group>
                  <b-form-input
                    :value="data.koodi ? $kaanna(data.koodi.nimi) : ''"
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
            </ep-koodisto-select>
          </b-form-group>
        </b-col>

        <b-col cols="3">
          <b-form-group :label="$t('koodi')">
            <span v-if="data.koodi">
              {{ data.koodi.arvo }}
            </span>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col cols="11">
          <EpSisaltoTekstikappaleet
            v-model="storeData"
            :is-editing="isEditing"
            :sisalto-avaimet="['tehtava', 'tyotavat', 'ohjaus', 'arviointi', 'sisaltoalueinfo']"
          />

          <template v-if="!data['_oppiaine'] && oppiaineId && (!data.kurssit || data.kurssit.length == 0)">
            <b-form-group :label="$t('oppimaarat')">
              <VueDraggable
                v-bind="oppiaineetDragOptions"
                v-model="data.oppimaarat"
                tag="div"
              >
                <div
                  v-for="oppimaara in data.oppimaarat"
                  :key="'oppimaara'+oppimaara.id"
                  class="listaus p-3 d-flex"
                >
                  <EpMaterialIcon
                    v-if="isEditing"
                    class="order-handle mr-2"
                  >
                    drag_indicator
                  </EpMaterialIcon>
                  <router-link :to="{ name: 'aipeoppiaine', params: { oppiaineId: oppimaara.id } }">
                    {{ $kaanna(oppimaara.nimi) || $t('nimeton-oppimaara') }}
                  </router-link>
                </div>
              </VueDraggable>
            </b-form-group>

            <ep-button
              v-if="!isEditing"
              v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
              variant="outline-primary"
              icon="add"
              @click="lisaaOppimaara"
            >
              {{ $t('lisaa-oppimaara') }}
            </ep-button>
          </template>

          <template v-if="oppiaineId && (!data.oppimaarat || data.oppimaarat.length == 0)">
            <b-form-group
              :label="$t('kurssit')"
              class="mt-4"
            >
              <VueDraggable
                v-bind="kurssitDragOptions"
                v-model="data.kurssit"
                tag="div"
              >
                <div
                  v-for="kurssi in data.kurssit"
                  :key="'kurssi'+kurssi.id"
                  class="listaus p-3 d-flex"
                >
                  <EpMaterialIcon
                    v-if="isEditing"
                    class="order-handle mr-2"
                  >
                    drag_indicator
                  </EpMaterialIcon>
                  <router-link :to="{ name: 'aipekurssi', params: { kurssiId: kurssi.id } }">
                    {{ $kaanna(kurssi.nimi) || $t('nimeton-kurssi') }}
                  </router-link>
                </div>
              </VueDraggable>
            </b-form-group>

            <ep-button
              v-if="!isEditing"
              v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
              variant="outline-primary"
              icon="add"
              @click="lisaaKurssi"
            >
              {{ $t('lisaa-kurssi') }}
            </ep-button>
          </template>

          <b-form-group
            :label="$t('opetuksen-tavoitteet')"
            class="mt-4 pt-3"
          >
            <VueDraggable
              v-bind="tavoitteetDragOptions"
              v-model="data.tavoitteet"
              tag="div"
            >
              <EpCollapse
                v-for="(tavoite, tavoiteIndex) in data.tavoitteet"
                :key="'tavoite'+tavoiteIndex"
                class="tavoite p-3 mb-4 w-100"
                :border-bottom="false"
                :use-padding="false"
              >
                <template #header>
                  <div class="d-flex">
                    <EpMaterialIcon
                      v-if="isEditing"
                      class="order-handle mr-3"
                    >
                      drag_indicator
                    </EpMaterialIcon>
                    <h4 class="mb-0">
                      {{ $kaanna(tavoite.tavoite) }}
                    </h4>
                  </div>
                </template>

                <EpOppiaineenTavoite
                  v-model="data.tavoitteet[tavoiteIndex]"
                  :is-editing="isEditing"
                  :support-data="supportData"
                  @poista="poistaTavoite(tavoite)"
                />
              </EpCollapse>
            </VueDraggable>

            <ep-button
              v-if="isEditing"
              variant="outline"
              icon="add"
              @click="lisaaTavoite"
            >
              {{ $t('lisaa-tavoite') }}
            </ep-button>
          </b-form-group>
        </b-col>
      </b-row>
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
import { AipeOppiaineStore } from '@/stores/AipeOppiaineStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { VueDraggable } from 'vue-draggable-plus';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpSisaltoTekstikappaleet from '@/components/EpSisaltoTekstikappaleet.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpOppiaineenTavoite from '@/views/aipe/yleiset/EpOppiaineenTavoite.vue';
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
  oppiaineId: {
    type: [String, Number],
    required: false,
  },
  parentId: {
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

const koodisto = new KoodistoSelectStore({
  koodisto: 'oppiaineetyleissivistava2',
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

const storeData = computed({
  get: () => store.value?.data,
  set: (data) => store.value?.setData(data),
});

const isEditing = computed(() => {
  return store.value?.isEditing;
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

const kurssitDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !isEditing.value,
    group: {
      name: 'kurssit',
    },
  };
});

const tavoitteetDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !isEditing.value,
    group: {
      name: 'tavoitteet',
    },
  };
});

const lisaaOppimaara = () => {
  router.push({ name: 'aipeoppimaara', params: { vaiheId: props.vaiheId, parentId: props.oppiaineId } });
};

const lisaaKurssi = () => {
  router.push({ name: 'aipekurssi', params: { vaiheId: props.vaiheId, oppiaineId: props.oppiaineId } });
};

const lisaaTavoite = () => {
  store.value?.setData(
    {
      ...store.value.data,
      tavoitteet: [
        ...store.value.data.tavoitteet,
        {
          laajattavoitteet: [],
          arvioinninkohteet: [],
          sisaltoalueet: [],
          oppiaineenTavoitteenOpetuksenTavoitteet: [],
        },
      ],
    },
  );
};

const poistaTavoite = (poistettavaTavoite) => {
  store.value?.setData(
    {
      ...store.value.data,
      tavoitteet: _.reject(store.value.data.tavoitteet, poistettavaTavoite),
    },
  );
};

const oppiaineChange = async () => {
  const storeInstance = new AipeOppiaineStore(perusteId.value!, props.vaiheId, props.oppiaineId, props.parentId, props.perusteStore, versionumero.value);
  store.value = new EditointiStore(storeInstance);
};

watch(() => props.oppiaineId, async () => {
  await oppiaineChange();
}, { immediate: true });

watch(versionumero, async () => {
  await oppiaineChange();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

  .listaus:nth-of-type(even) {
    background-color: $table-even-row-bg-color;
  }
  .listaus:nth-of-type(odd) {
    background-color: $table-odd-row-bg-color;
  }

  .tavoite {
    @include tile-background-shadow;
    border-radius: 10px;
  }

</style>
