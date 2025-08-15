<template>
  <EpEditointi :store="store">
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
        <span v-if="!isOppimaara">{{ $t('nimeton-oppiaine') }}</span>
        <span v-if="isOppimaara">{{ $t('nimeton-oppimaara') }}</span>
      </h2>
    </template>

    <template #default="{ data, isEditing }">
      <b-row>
        <b-col
          v-if="isEditing"
          cols="8"
        >
          <b-form-group :label="!isOppimaara ? $t('oppiaineen-nimi') : $t('oppimaaran-nimi')">
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
            :sisalto-avaimet="['tehtava']"
          />

          <b-form-group :label="$t('tavoitealueet-kaikilla-vuosiluokilla')">
            <EpTavoitealueetEditModal
              v-model="storeData"
              :is-editing="isEditing"
              :peruste-id="perusteId"
              :oppiaine-id="oppiaineId"
            />
          </b-form-group>

          <hr>

          <b-form-group
            v-if="isEditing"
            class="mt-4 mb-4"
            :label="$t('vuosiluokat')"
          >
            <EpToggleGroup
              v-model="valitutVuosiluokkakokonaisuudet"
              :items="valittavatVuosiluokkakokonaisuudet"
            >
              <template #default="{ item }">
                <div class="mb-1">
                  {{ item.nimi }}
                </div>
              </template>
            </EpToggleGroup>
          </b-form-group>

          <b-tabs v-if="valitutVuosiluokkakokonaisuudet.length > 0">
            <b-tab
              v-for="(vlk, index) in data.vuosiluokkakokonaisuudet"
              :key="'vlk' + index"
              :title="valitutVuosiluokkakokonaisuudetById[vlk._vuosiluokkaKokonaisuus].nimi"
            >
              <EpOppiaineenVuosiluokkakokonaisuus
                v-model="data.vuosiluokkakokonaisuudet[index]"
                :is-editing="isEditing"
                :vuosiluokat="valitutVuosiluokkakokonaisuudetById[vlk._vuosiluokkaKokonaisuus].vuosiluokat"
                :support-data="vlkSupportData"
                :peruste-id="perusteId"
                :oppiaine-id="oppiaineId"
              />
            </b-tab>

            <hr>
          </b-tabs>

          <template v-if="!isOppimaara">
            <b-form-group
              v-if="!isEditing || (data.oppimaarat && data.oppimaarat.length > 0)"
              :label="$t('oppimaarat')"
            >
              <VueDraggable
                v-bind="oppiaineetDragOptions"
                v-model="data.oppimaarat"
                tag="div"
              >
                <div
                  v-for="oppimaara in data.oppimaarat"
                  :key="'oppimaara'+oppimaara.id"
                  class="taulukko-rivi-varitys p-3 d-flex"
                >
                  <EpMaterialIcon
                    v-if="isEditing"
                    class="order-handle mr-2"
                  >
                    drag_indicator
                  </EpMaterialIcon>
                  <router-link :to="{ name: 'perusopetusoppiaine', params: { oppiaineId: oppimaara.id } }">
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
        </b-col>
      </b-row>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import * as _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { PerusopetusOppiaineStore } from '@/stores/PerusopetusOppiaineStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { VueDraggable } from 'vue-draggable-plus';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpSisaltoTekstikappaleet from '@/components/EpSisaltoTekstikappaleet.vue';
import EpOppiaineenVuosiluokkakokonaisuus from '@/views/perusopetus/EpOppiaineenVuosiluokkakokonaisuus.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpTavoitealueetEditModal from '@/views/perusopetus/EpTavoitealueetEditModal.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna, $bvModal } from '@shared/utils/globals';
import EpToggleGroup from '@shared/components/forms/EpToggleGroup.vue';
import { unref } from 'vue';

const props = defineProps<{
  perusteStore: PerusteStore;
  oppiaineId: any;
  uusi?: 'uusi' | null;
}>();

const router = useRouter();
const store = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

// Initialize koodisto
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

// Watch for changes in oppiaineId
watch(() => props.oppiaineId, async () => {
  const oppiaineStore = new PerusopetusOppiaineStore(
    perusteId.value!,
    props.oppiaineId,
    props.perusteStore,
    props.uusi === 'uusi',
  );
  store.value = new EditointiStore(oppiaineStore);
}, { immediate: true });

const isOppimaara = computed(() => {
  return !!storeData.value?._oppiaine;
});

const storeData = computed({
  get() {
    return store.value?.data;
  },
  set(data) {
    store.value?.setData(data);
  },
});

const lisaaOppimaara = async () => {
  await PerusopetusOppiaineStore.setOppiaineKoosteinen(perusteId.value, props.oppiaineId);
  const newOppiaine = await PerusopetusOppiaineStore.create(perusteId.value, props.oppiaineId);
  await props.perusteStore.updateNavigation();
  await EditointiStore.cancelAll();
  router.push({
    name: 'perusopetusoppiaine',
    params: {
      oppiaineId: _.toString(newOppiaine.id),
      uusi: 'uusi',
    },
  });
};


const isEditing = computed(() => {
  return store.value?.isEditing;
});

const getVuosiluokkaNumerot = (vuosiluokat) => {
  return _.chain(vuosiluokat)
    .map(vlk => _.split(vlk, '_')[1])
    .map(_.toNumber)
    .sortBy()
    .value();
};

const valittavatVuosiluokkakokonaisuudet = computed(() => {
  return _.sortBy(_.map(store.value?.supportData.perusteenVuosiluokkakokonaisuudet, valittavaVlk => {
    return {
      id: _.toString(valittavaVlk.id),
      vuosiluokat: _.min(getVuosiluokkaNumerot(valittavaVlk.vuosiluokat)) + '-' + _.max(getVuosiluokkaNumerot(valittavaVlk.vuosiluokat)),
      nimi: $t('vuosiluokat') + ' ' + _.min(getVuosiluokkaNumerot(valittavaVlk.vuosiluokat)) + '-' + _.max(getVuosiluokkaNumerot(valittavaVlk.vuosiluokat)),
    };
  }), 'nimi');
});

const valittavatVuosiluokkakokonaisuudetById = computed(() => {
  return _.keyBy(unref(valittavatVuosiluokkakokonaisuudet), 'id');
});

const vuosiluokkakokonaisuudet = computed(() => {
  return store.value?.data?.vuosiluokkakokonaisuudet;
});

const valitutVuosiluokkakokonaisuudet = ref([]);

// Initialize valitutVuosiluokkakokonaisuudet
watch(vuosiluokkakokonaisuudet, (newValue) => {
  if (newValue) {
    valitutVuosiluokkakokonaisuudet.value = _.filter(
      valittavatVuosiluokkakokonaisuudet.value,
      valittavaVlk => !!_.find(newValue, vlk => vlk._vuosiluokkaKokonaisuus === _.toString(valittavaVlk.id)),
    );
  }
}, { immediate: true });

const valitutVuosiluokkakokonaisuudetById = computed(() => {
  return _.keyBy(valitutVuosiluokkakokonaisuudet.value, 'id');
});

let tempVuosiluokkaChange = [];

const vlkChange = async () => {
  const poistettavatVlk = _.find(tempVuosiluokkaChange, vlk => !_.includes(vuosiluokkakokonaisuudet.value, vlk));
  if (poistettavatVlk) {
    const edellisetVlk = tempVuosiluokkaChange;
    const varmistaPoisto = await $bvModal.msgBoxConfirm(
      $t('vuosiluokkakokonaisuuden-poisto-varmistus-teksti'), {
        title: $t('vahvista-poisto'),
        okTitle: $t('poista'),
        cancelTitle: $t('peruuta'),
        size: 'lg',
      });

    if (!varmistaPoisto) {
      store.value?.setData({
        ...storeData.value,
        vuosiluokkakokonaisuudet: edellisetVlk,
      });
    }

    if (varmistaPoisto) {
      await PerusopetusOppiaineStore.deleteOppiaineenVuosiluokkakokonaisuus(perusteId.value, props.oppiaineId, poistettavatVlk);
    }

    return;
  }

  _.forEach(vuosiluokkakokonaisuudet.value, async vlk => {
    if (!_.includes(tempVuosiluokkaChange, vlk)) {
      const tallennettu = await PerusopetusOppiaineStore.createOppiaineenVuosiluokkakokonaisuus(perusteId.value, props.oppiaineId, vlk);
      store.value?.setData({
        ...storeData.value,
        vuosiluokkakokonaisuudet: _.map(vuosiluokkakokonaisuudet.value, storeVlk => {
          if (_.get(storeVlk, '_vuosiluokkaKokonaisuus') === _.get(tallennettu, '_vuosiluokkaKokonaisuus')) {
            return tallennettu;
          }
          return storeVlk;
        }),
      });
    }
  });
};

// Handler for valitutVuosiluokkakokonaisuudet changes
watch(valitutVuosiluokkakokonaisuudet, async (valitutVlk) => {
  tempVuosiluokkaChange = vuosiluokkakokonaisuudet.value;

  _.forEach(valitutVlk, valittuVlk => {
    if (!_.find(vuosiluokkakokonaisuudet.value, vlk => vlk._vuosiluokkaKokonaisuus === valittuVlk.id)) {
      store.value?.setData({
        ...storeData.value,
        vuosiluokkakokonaisuudet: _.sortBy([
          ...vuosiluokkakokonaisuudet.value,
          {
            _vuosiluokkaKokonaisuus: valittuVlk.id,
            vapaatTekstit: [],
            sisaltoalueinfo: {},
            tavoitteet: [],
            sisaltoalueet: [],
          },
        ], vlk => {
          return valittavatVuosiluokkakokonaisuudetById.value[vlk._vuosiluokkaKokonaisuus].nimi;
        }),
      });
    }
  });

  _.forEach(vuosiluokkakokonaisuudet.value, async poistettavaVlk => {
    if (!_.find(valitutVlk, valittuVlk => valittuVlk.id === poistettavaVlk._vuosiluokkaKokonaisuus)) {
      store.value?.setData({
        ...storeData.value,
        vuosiluokkakokonaisuudet: _.filter(vuosiluokkakokonaisuudet.value, vlk => vlk._vuosiluokkaKokonaisuus !== poistettavaVlk._vuosiluokkaKokonaisuus),
      });
    }
  });

  await vlkChange();
});

const vlkSupportData = computed(() => {
  return {
    ...store.value!.supportData,
    kohdealueet: store.value!.data.kohdealueet,
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
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

</style>
