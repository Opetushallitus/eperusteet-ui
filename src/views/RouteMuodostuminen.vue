<template>
  <div>
    <ep-spinner v-if="(!store || !peruste || !tutkinnonOsatRaw)" />
    <EpEditointi
      v-else
      :store="store"
      :allow-save="tarkistaTallennusLeikelauta"
      :allow-cancel="tarkistaPeruutusLeikelauta"
    >
      <template #header>
        <h2>{{ $t('tutkinnon-muodostuminen') }}</h2>
      </template>
      <template #default="{ data, isEditing }">
        <div>
          <div class="upper mb-3">
            <b-form-group :label="$t('rakenteen-kuvaus')">
              <ep-content
                v-model="data.rakenne.kuvaus"
                layout="normal"
                :is-editable="isEditing"
              />
            </b-form-group>
          </div>
          <div class="lower">
            <h5>
              <span>{{ $kaanna(peruste.nimi) }}</span>
              <span class="ml-2 text-nowrap">
                <span :class="{ 'text-danger': laskettuLaajuus < vaadittuLaajuus }">
                  {{ laskettuLaajuus }}
                </span>
                / {{ vaadittuLaajuus }} {{ laajuustyyppi }}</span>
              <ep-button
                v-if="isEditing"
                variant="link"
                icon="edit"
                @click="editMuodostuminen"
              />
            </h5>
            <div class="filters">
              <ep-search
                v-model="query"
                :placeholder="$t('etsi-rakenteesta')"
              />
            </div>
            <div class="tree mt-3">
              <div class="drag-area p-3 d-flex">
                <div class="flex-grow-1">
                  <div class="d-flex actions pb-3 justify-content-between">
                    <ep-button
                      variant="link"
                      @click="toggleDescription"
                    >
                      {{ $t('nayta-ryhmien-kuvaukset') }}
                    </ep-button>
                    <ep-button
                      v-if="isEditing"
                      variant="outline"
                      icon="add"
                      @click="addRyhma"
                    >
                      {{ $t('lisaa-ryhma-rakenteeseen') }}
                    </ep-button>
                    <EpRakenneModal
                      ref="eprakennemodalUusiRyhma"
                      v-model="uusi.ryhma"
                      @save="addUusi(data.rakenne)"
                    />
                  </div>
                  <div class="drag-area-left mr-3">
                    <div class="d-flex align-items-center mb-1">
                      <div class="flex-shrink-1 font-weight-bold">
                        {{ $t('rakenne') }}
                        <span
                          class="btn-link"
                          @click="toggleRakenne"
                        >({{ $t('avaa') }} / {{ $t('sulje') }})</span>
                      </div>
                      <div class="flex-grow-1" />
                      <div
                        style="width: 100px"
                        class="text-center font-weight-bold"
                      >
                        {{ $t('osaamispiste') }}
                      </div>
                      <div style="width: 80px" />
                    </div>
                    <ep-spinner v-if="!data" />
                    <div
                      v-else-if="data.rakenne.osat.length === 0"
                      class="p-3 helptext text-muted text-center"
                    >
                      <span v-if="!isEditing">
                        {{ $t('luo-tutkinnolle-rakenne-muokkaamalla-ohje') }}
                      </span>
                      <span v-else>
                        {{ $t('luo-tutkinnolle-rakenne-ohje') }}
                      </span>
                    </div>
                    <MuodostumisNode
                      ref="root"
                      v-model="data.rakenne.osat"
                      :is-editing="isEditing"
                      :tutkinnon-osat-map="tutkinnonOsatMap"
                      :copy-to-clip-board="copy"
                    />
                  </div>
                </div>
                <div
                  v-if="isEditing"
                  class="drag-area-right"
                >
                  <div class="menu p-3">
                    <h5 class="font-weight-600">
                      {{ $t('leikelauta') }}
                    </h5>
                    <div class="mt-3">
                      <VueDraggable
                        v-bind="optionsLeikelauta"
                        v-model="leikelauta"
                        tag="div"
                        class="leikelauta"
                        :class="{'empty': leikelauta.length === 0}"
                        @add="onLeikelautaAdd"
                      >
                        <div
                          v-for="lauta in leikelautaWithColor"
                          :key="'leikelauta' + (lauta.tunniste || lauta.uuid)"
                          class="mb-1 d-flex justify-content-center align-items-center draggable kopioitava"
                        >
                          <div
                            class="colorblock"
                            :style="{ height: '54px', background: lauta.color }"
                          />
                          <div class="flex-grow-1 paaryhma-label pl-2 noselect">
                            {{ $kaanna(lauta.nimi) }}
                            <div v-if="lauta.osat && lauta.osat.length > 0">
                              ({{ lauta.osat.length }}
                              <span v-if="lauta.osat.length === 1">{{ $t('ryhma') }}</span>
                              <span v-else>{{ $t('ryhmaa') }}</span>)
                            </div>
                          </div>
                        </div>
                      </VueDraggable>
                    </div>

                    <h5 class="mt-4 font-weight-600">
                      {{ $t('paaryhmat') }}
                    </h5>
                    <div class="mt-3">
                      <VueDraggable
                        v-bind="optionsPaaryhma"
                        :model-value="paaryhmat"
                        tag="div"
                        class="paaryhmat"
                      >
                        <div
                          v-for="ryhma in paaryhmat"
                          :key="ryhma.uuid"
                          class="mb-1 d-flex justify-content-center paaryhma align-items-center draggable"
                        >
                          <div
                            class="colorblock"
                            :style="{ height: '44px', background: colorMap[ryhma.kind] }"
                          />
                          <div class="flex-grow-1 paaryhma-label pl-2 noselect">
                            {{ $t(ryhma.label) }}
                          </div>
                        </div>
                      </VueDraggable>
                    </div>

                    <h5 class="mt-4 font-weight-600">
                      {{ $t('tutkinnon-osat') }}
                    </h5>
                    <div class="mt-3">
                      <ep-search
                        v-model="queryTutkinnonOsa"
                        :placeholder="$t('etsi-tutkinnon-osaa')"
                      />
                      <div class="ml-1 mt-1">
                        <ep-toggle
                          v-model="showUnusedTutkinnonOsat"
                          :is-s-witch="false"
                        >
                          <span class="noselect">
                            {{ $t('nayta-kayttamattomat') }}
                          </span>
                        </ep-toggle>
                      </div>
                      <VueDraggable
                        v-bind="optionsTutkinnonOsat"
                        :model-value="tutkinnonosatPaged"
                        tag="div"
                      >
                        <div
                          v-for="tosa in tutkinnonosatPaged"
                          :key="tosa.id"
                          class="mb-1 d-flex align-items-center p-2 pr-3 m-1 tosa draggable tosa"
                        >
                          <div
                            v-if="isEditing"
                            class="grip mr-2"
                          >
                            <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                          </div>
                          <div class="flex-grow-1">
                            {{ $kaanna(tosa.nimi) }} <span v-if="tosa.tutkinnonOsa.koodiArvo">({{ tosa.tutkinnonOsa.koodiArvo }})</span>
                          </div>
                          <div class="laajuus">
                            {{ tosa.laajuus }}
                          </div>
                        </div>
                      </VueDraggable>
                      <b-pagination
                        v-if="tutkinnonOsat && tutkinnonOsat.length > 0"
                        v-model="tutkinnonosatSivu"
                        :total-rows="tutkinnonOsat.length"
                        :per-page="sivukoot"
                        aria-controls="tutkinnonosat"
                        align="center"
                      />
                    </div>

                    <h5 class="mt-4 font-weight-600">
                      {{ $t('osaamisalat') }}
                    </h5>
                    <div>
                      <ep-button
                        icon="add"
                        variant="outline"
                        class="mb-2"
                        @click="lisaaOsaamisala"
                      >
                        {{ $t('lisaa-osaamisala') }}
                      </ep-button>
                      <VueDraggable
                        v-bind="optionsKoodit"
                        :model-value="osaamisalatPaged"
                        tag="div"
                      >
                        <div
                          v-for="(ryhma, index) in osaamisalatPaged"
                          :key="'osaamisala' + index"
                          class="mb-1 d-flex justify-content-center align-items-center draggable osaamisalat"
                        >
                          <div
                            class="colorblock"
                            :style="{ border:'1px solid ' + colorMap['osaamisala'], background: colorMap['osaamisala'] }"
                          >
                            <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                          </div>
                          <ep-koodisto-select
                            v-if="isEditing"
                            :store="osaamisalaStore"
                            :value="index"
                            class="w-100"
                            @add="osaamisalaKoodiLisays"
                          >
                            <template #default="{ open }">
                              <b-input-group class="w-100 d-flex">
                                <ep-input
                                  v-if="!ryhma.osaamisala.osaamisalakoodiUri.startsWith('temporary')"
                                  class="koodi-input flex-grow-1"
                                  :value="$kaanna(ryhma.nimi) + ' (' + ryhma.osaamisala.osaamisalakoodiArvo + ')'"
                                  :placeholder="$kaanna(ryhma.nimi) + ' (' + ryhma.osaamisala.osaamisalakoodiArvo + ')'"
                                  :is-editing="true"
                                  :disabled="true"
                                />
                                <ep-input
                                  v-else
                                  v-model="ryhma.nimi"
                                  class="koodi-input flex-grow-1"
                                  :placeholder="$kaanna(ryhma.nimi)"
                                  :is-editing="true"
                                  :disabled="false"
                                  :change="() => osaamisalaNimiChange(ryhma, index)"
                                />
                                <b-input-group-append>
                                  <b-button
                                    variant="primary"
                                    @click="open"
                                  >
                                    {{ $t('hae') }}
                                  </b-button>
                                </b-input-group-append>
                              </b-input-group>
                            </template>
                          </ep-koodisto-select>
                          <div class="flex-shrink pl-2">
                            <ep-button
                              v-if="isEditing"
                              :id="'poista-osaamisala-' + index"
                              variant="link"
                              icon="delete"
                              :disabled="ryhma.osaamisala.rakenteessa"
                              @click="poistaOsaamisala(index)"
                            />
                            <b-popover
                              v-if="ryhma.osaamisala.rakenteessa"
                              :target="'poista-osaamisala-' + index"
                              triggers="hover"
                              placement="top"
                            >
                              {{ $t('ei-voi-poistaa-koska-loytyy-rakenteesta') }}
                            </b-popover>
                          </div>
                        </div>
                      </VueDraggable>
                      <b-pagination
                        v-if="osaamisalat && osaamisalat.length > 0"
                        v-model="osaamisalatSivu"
                        :total-rows="osaamisalat.length"
                        :per-page="sivukoot"
                        aria-controls="osaamisalat"
                        align="center"
                      />
                    </div>

                    <h5 class="mt-4 font-weight-600">
                      {{ $t('tutkintonimikkeet') }}
                    </h5>
                    <div>
                      <ep-button
                        icon="add"
                        variant="outline"
                        class="mb-2"
                        @click="lisaaTutkintonimike"
                      >
                        {{ $t('lisaa-tutkintonimike') }}
                      </ep-button>

                      <VueDraggable
                        v-bind="optionsKoodit"
                        :model-value="tutkintonimikkeetPaged"
                        tag="div"
                      >
                        <div
                          v-for="(ryhma, index) in tutkintonimikkeetPaged"
                          :key="ryhma.tutkintonimike.uri"
                          class="mb-1 d-flex justify-content-center align-items-center draggable tutkintonimikkeet"
                        >
                          <div
                            class="colorblock"
                            :style="{ border:'1px solid ' + colorMap['tutkintonimike'], background: colorMap['tutkintonimike'] }"
                          >
                            <EpMaterialIcon size="20px">
                              drag_indicator
                            </EpMaterialIcon>
                          </div>
                          <ep-koodisto-select
                            v-if="isEditing"
                            :store="tutkintonimikeStore"
                            :value="index"
                            class="w-100"
                            @add="tutkintonimikeKoodiLisays"
                          >
                            <template #default="{ open }">
                              <b-input-group class="w-100 d-flex">
                                <ep-input
                                  v-if="!ryhma.tutkintonimike.uri.startsWith('temporary')"
                                  class="koodi-input flex-grow-1"
                                  :value="$kaanna(ryhma.nimi) + ' (' + ryhma.tutkintonimike.arvo + ')'"
                                  :placeholder="$kaanna(ryhma.nimi) + ' (' + ryhma.tutkintonimike.arvo + ')'"
                                  :is-editing="true"
                                  :disabled="true"
                                />
                                <ep-input
                                  v-else
                                  v-model="ryhma.nimi"
                                  class="koodi-input flex-grow-1"
                                  :placeholder="$kaanna(ryhma.nimi)"
                                  :is-editing="true"
                                  :disabled="!ryhma.tutkintonimike.uri.startsWith('temporary')"
                                  :change="() => tutkintonimikeNimiChange(ryhma, index)"
                                />
                                <b-input-group-append>
                                  <b-button
                                    variant="primary"
                                    @click="open"
                                  >
                                    {{ $t('hae') }}
                                  </b-button>
                                </b-input-group-append>
                              </b-input-group>
                            </template>
                          </ep-koodisto-select>
                          <div class="flex-shrink pl-2">
                            <ep-button
                              v-if="isEditing"
                              :id="'poista-tutkintonimike-' + index"
                              variant="link"
                              icon="delete"
                              :disabled="ryhma.tutkintonimike.rakenteessa"
                              @click="poistaTutkintonimike(index)"
                            />
                            <b-popover
                              v-if="ryhma.tutkintonimike.rakenteessa"
                              :target="'poista-tutkintonimike-' + index"
                              triggers="hover"
                              placement="top"
                            >
                              {{ $t('ei-voi-poistaa-koska-loytyy-rakenteesta') }}
                            </b-popover>
                          </div>
                        </div>
                      </VueDraggable>
                      <b-pagination
                        v-if="tutkintonimikkeet && tutkintonimikkeet.length > 0"
                        v-model="tutkintonimikkeetSivu"
                        :total-rows="tutkintonimikkeet.length"
                        :per-page="sivukoot"
                        aria-controls="tutkintonimikkeet"
                        align="center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <b-modal
          ref="editModal"
          size="lg"
        >
          <template #modal-header>
            <h2>{{ $t('muokkaa') }}: {{ $kaanna({}) }}</h2>
          </template>

          <template #default>
            <div>
              <b-form-group :label="$t('laajuus')">
                <div class="d-flex align-items-center">
                  <div>
                    <ep-input
                      v-model="data.rakenne.muodostumisSaanto.laajuus.minimi"
                      type="number"
                      is-editing
                    />
                  </div>
                  <div class="ml-2">
                    {{ $t('osaamispiste') }}
                  </div>
                </div>
              </b-form-group>
            </div>
          </template>
        </b-modal>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, provide } from 'vue';
import { useRoute } from 'vue-router';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpJarjesta from '@shared/components/EpJarjesta/EpJarjesta.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import MuodostumisNode from '@/components/muodostuminen/MuodostumisNode.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { MuodostuminenStore } from '@/stores/MuodostuminenStore';
import { Koodisto } from '@shared/api/eperusteet';
import { usePerusteprojekti } from './PerusteprojektiRoute';
import { BrowserStore } from '@shared/stores/BrowserStore';
import _ from 'lodash';
import { VueDraggable } from 'vue-draggable-plus';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { v4 as genUuid } from 'uuid';
import { Kielet } from '@shared/stores/kieli';
import EpRakenneModal from '@/components/muodostuminen/EpRakenneModal.vue';
import { DefaultRyhma, ryhmaTemplate, ColorMap, RakenneMainType, rakenneNodecolor } from '@/components/muodostuminen/utils';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { KayttajaStore } from '@/stores/kayttaja';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { TyoryhmaStore } from '@/stores/TyoryhmaStore';
import { inject } from 'vue';
import { $bvModal, $kaanna, $filterBy } from '@shared/utils/globals';
import { unref } from 'vue';

const props = defineProps<{
  browserStore: BrowserStore;
  tutkinnonOsaStore: TutkinnonOsaStore;
  perusteStore: PerusteStore;
  kayttajaStore: KayttajaStore;
  tiedotteetStore: TiedotteetStore;
  muokkaustietoStore: MuokkaustietoStore;
  aikatauluStore: AikatauluStore;
  tyoryhmaStore: TyoryhmaStore;
}>();

const route = useRoute();

const query = ref('');
const queryTutkinnonOsa = ref('');
const showUnusedTutkinnonOsat = ref(false);
const store = ref<EditointiStore | null>(null);
const uusi = ref<any | null>(_.cloneDeep(DefaultRyhma));
const naytaKuvaukset = ref(false);
const naytaRakenne = ref(true);
const nimiValinta = ref<'paikallinen' | 'tutkinnonosato' | 'korkeakoulu' | 'yhteinen' | 'muu' | null>(null);
const osaamisalatSivu = ref(1);
const tutkintonimikkeetSivu = ref(1);
const tutkinnonosatSivu = ref(1);
const sivukoot = ref(5);
const leikelauta = ref<any[]>([]);
const root = ref<any>(null);
const eprakennemodalUusiRyhma = ref<any>(null);
const editModal = ref<any>(null);

const {
  isInitializing,
  perusteId,
} = usePerusteprojekti({
  perusteStore: props.perusteStore,
  kayttajaStore: props.kayttajaStore,
  tiedotteetStore: props.tiedotteetStore,
  muokkaustietoStore: props.muokkaustietoStore,
  aikatauluStore: props.aikatauluStore,
  tyoryhmaStore: props.tyoryhmaStore,
});

const osaamisalaStore = new KoodistoSelectStore({
  koodisto: 'osaamisala',
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

const tutkintonimikeStore = new KoodistoSelectStore({
  koodisto: 'tutkintonimikkeet',
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

// Computed properties
const peruste = computed(() => {
  return props.perusteStore.peruste.value;
});

const tutkinnonOsatRaw = computed(() => {
  return props.tutkinnonOsaStore.tutkinnonOsat.value;
});

const tutkinnonOsatMap = computed(() => {
  return _.keyBy(tutkinnonOsatRaw.value, 'id');
});

const laajuustyyppi = computed(() => {
  return 'osp';
});

const vaadittuLaajuus = computed(() => {
  return store.value?.data?.rakenne.muodostumisSaanto?.laajuus?.minimi;
});

const laskettuLaajuus = computed(() => {
  return _(store.value?.data?.rakenne.osat)
    .map(osa => osa.muodostumisSaanto?.laajuus?.maksimi || osa.muodostumisSaanto?.laajuus?.minimi || tutkinnonOsatMap.value[osa._tutkinnonOsaViite]?.laajuus || 0)
    .filter()
    .sum();
});

const colorMap = computed(() => {
  return ColorMap;
});

const browserEvents = computed(() => {
  return {
    focused: props.browserStore.activeElement.value,
    key: props.browserStore.latestKeypress.value,
  };
});

const paaryhmat = computed((): RakenneMainType[] => {
  return [{
    kind: 'pakollinen',
    label: 'rakenne-moduuli-pakollinen',
    uuid: genUuid(),
    create: () => ({
      ...ryhmaTemplate('rakenne-moduuli-pakollinen'),
    }),
  }, {
    kind: 'valinnainen',
    label: 'rakenne-moduuli-valinnainen',
    uuid: genUuid(),
    create: () => ({
      ...ryhmaTemplate('rakenne-moduuli-valinnainen'),
    }),
  }, {
    kind: 'ammatilliset',
    label: 'rakenne-moduuli-ammatilliset',
    uuid: genUuid(),
    create: () => ({
      ...ryhmaTemplate('rakenne-moduuli-ammatilliset'),
    }),
  }, {
    kind: 'yhteiset',
    label: 'rakenne-moduuli-yhteiset',
    uuid: genUuid(),
    create: () => ({
      ...ryhmaTemplate('rakenne-moduuli-yhteiset'),
    }),
  }, {
    kind: 'paikalliset',
    label: 'rakenne-moduuli-paikalliset',
    uuid: genUuid(),
    create: () => ({
      ...ryhmaTemplate('rakenne-moduuli-paikalliset'),
    }),
  }];
});

const optionsKoodit = computed(() => {
  return {
    ...defaultOptions.value,
    disabled: !isEditing.value,
    group: {
      name: 'rakennepuu',
      pull: 'clone' as const,
      put: false,
    },
    clone(original) {
      return {
        ...original,
        muodostumisSaanto: {
          laajuus: {},
        },
      };
    },
  };
});

const optionsTutkinnonOsat = computed(() => {
  return {
    ...defaultOptions.value,
    disabled: !isEditing.value,
    group: {
      name: 'rakennepuu',
      pull: 'clone' as const,
      put: false,
    },
    clone(original) {
      return {
        kuvaus: null,
        vieras: null,
        tunniste: null,
        pakollinen: false,
        erikoisuus: null,
        _tutkinnonOsaViite: '' + original.id,
      };
    },
  };
});

const isEditing = computed(() => {
  return !!store.value?.isEditing;
});

const optionsPaaryhma = computed(() => {
  return {
    ...defaultOptions.value,
    disabled: !isEditing.value,
    group: {
      name: 'rakennepuu',
      pull: 'clone' as const,
    },
    clone(original) {
      if (original.create) {
        return original.create();
      }
    },
  };
});

const optionsLeikelauta = computed(() => {
  return {
    ...defaultOptions.value,
    disabled: !isEditing.value,
    group: {
      name: 'rakennepuu',
    },
    emptyInsertThreshold: 10,
  };
});

const defaultOptions = computed(() => {
  return {
    sort: false,
    scrollSensitivity: 100,
    forceFallback: true,
  };
});

const liitetytOsat = computed(() => {
  if (!store.value) {
    return null;
  }
  const osat = [] as any[];
  const walk = (node) => {
    if (node) {
      if (node._tutkinnonOsaViite) {
        osat.push(node);
      }
      _.forEach(node.osat, walk);
    }
  };
  walk(store.value.data.rakenne);
  return _.keyBy(osat, '_tutkinnonOsaViite');
});

const kayttamattomatTutkinnonOsat = computed(() => {
  if (!liitetytOsat.value) {
    return [];
  }
  return _.filter(tutkinnonOsatRaw.value, osa => !liitetytOsat.value![osa.id!]);
});

const tutkinnonOsat = computed(() => {
  return _(showUnusedTutkinnonOsat.value
    ? kayttamattomatTutkinnonOsat.value : tutkinnonOsatRaw.value)
    .filter($filterBy('nimi', queryTutkinnonOsa.value))
    .sortBy(tosa => $kaanna(tosa.nimi as any))
    .value();
});

const tutkintonimikkeet = computed(() => {
  return _.map(store.value?.data?.tutkintonimikkeet, tutkintonimike => {
    return {
      ...ryhmaTemplate('tutkintonimike'),
      nimi: tutkintonimike.nimi,
      tutkintonimike: {
        nimi: tutkintonimike.nimi,
        uri: tutkintonimike.tutkintonimikeUri,
        arvo: tutkintonimike.tutkintonimikeArvo,
        rakenteessa: _.some(rakenteenOsat.value, osa => osa.tutkintonimike && osa.tutkintonimike.uri === tutkintonimike.tutkintonimikeUri),
      },
    };
  });
});

const rakenteenOsat = computed(() => {
  return recursiveFlattenRakenneOsat(store.value?.data.rakenne.osat);
});

const osaamisalat = computed(() => {
  return _.map(store.value?.data?.osaamisalat, osaamisala => {
    return {
      ...ryhmaTemplate('osaamisala'),
      nimi: osaamisala.nimi,
      osaamisala: {
        nimi: osaamisala.nimi,
        'osaamisalakoodiArvo': osaamisala.arvo,
        'osaamisalakoodiUri': osaamisala.uri,
        rakenteessa: _.some(rakenteenOsat.value, osa => osa.osaamisala && osa.osaamisala.osaamisalakoodiUri === osaamisala.uri),
      },
    };
  });
});

const osaamisalatPaged = computed(() => {
  return pageSliced(unref(osaamisalat), unref(osaamisalatSivu));
});

const tutkintonimikkeetPaged = computed(() => {
  return pageSliced(unref(tutkintonimikkeet), unref(tutkintonimikkeetSivu));
});

const tutkinnonosatPaged = computed(() => {
  return pageSliced(unref(tutkinnonOsat), unref(tutkinnonosatSivu));
});

const leikelautaWithColor = computed(() => {
  return _.map(unref(leikelauta), lauta => {
    return {
      ...lauta,
      color: rakenneNodecolor(lauta, false),
    };
  });
});

// Methods
function onInput({ focused, key }) {
  if (focused && key) {
    const uuid = focused.getAttribute('moduuli');
    if (uuid) {
      const dir = {
        ArrowDown: 'down',
        ArrowUp: 'up',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      }[key.code];
      if (key.ctrlKey && dir) {
        root.value.move(uuid, dir);
      }
    }
  }
}

function onLeikelautaAdd(evt) {
  leikelauta.value = _.map(leikelauta.value, leike => {
    return {
      ...recursiveClone(leike),
    };
  });
}

function editMuodostuminen() {
  editModal.value.show();
}

async function onProjektiChange(projektiId: number) {
  if (perusteId.value) {
    const storeInstance = new MuodostuminenStore(perusteId.value);
    store.value = new EditointiStore(storeInstance);
    props.tutkinnonOsaStore.fetch();
  }
}

function toggleDescription() {
  naytaKuvaukset.value = !naytaKuvaukset.value;
  root.value.toggleDescription(naytaKuvaukset.value);
}

function addUusi(root) {
  const template = ryhmaTemplate(uusi.value.tyyppi);
  if (uusi.value) {
    root.osat = [{
      ...template,
      ...uusi.value.ryhma,
    }, ...root.osat];
    uusi.value = _.cloneDeep(DefaultRyhma);
  }
}

function addRyhma() {
  eprakennemodalUusiRyhma.value.show(true);
}

function tutkintonimikeSivutettuIndeksi(tutkintonimikeIndex) {
  return tutkintonimikeIndex + (tutkintonimikkeetSivu.value - 1) * sivukoot.value;
}

function tutkintonimikeNimiChange(ryhma, tutkintonimikeIndex) {
  store.value?.setData(
    {
      ...store.value.data,
      tutkintonimikkeet: _.map(store.value.data.tutkintonimikkeet,
        (tutkintonimike, index) => index === tutkintonimikeSivutettuIndeksi(tutkintonimikeIndex) ? { ...tutkintonimike, nimi: ryhma.nimi } : tutkintonimike),
    });
}

function lisaaTutkintonimike() {
  store.value?.setData(
    {
      ...store.value.data,
      tutkintonimikkeet: [
        ...store.value.data.tutkintonimikkeet,
        {
          nimi: {},
          tutkintonimikeUri: 'temporary_tutkintonimikkeet_' + genUuid(),
        },
      ],
    });
}

function tutkintonimikeKoodiLisays(koodi, tutkintonimikeIndex) {
  store.value?.setData(
    {
      ...store.value.data,
      tutkintonimikkeet: _.map(store.value.data.tutkintonimikkeet,
        (tutkintonimike, index) => index === tutkintonimikeSivutettuIndeksi(tutkintonimikeIndex)
          ? {
            nimi: koodi.nimi,
            'tutkintonimikeUri': koodi.uri,
            'tutkintonimikeArvo': koodi.arvo,
          }
          : tutkintonimike),
    });
}

function osaamisalaNimiChange(ryhma, osaamisalaIndex) {
  store.value?.setData(
    {
      ...store.value.data,
      osaamisalat: _.map(store.value.data.osaamisalat,
        (osaamisala, index) => index === osaamisalaSivutettuIndeksi(osaamisalaIndex) ? { ...osaamisala, nimi: ryhma.nimi } : osaamisala),
    });
}

function lisaaOsaamisala() {
  store.value?.setData(
    {
      ...store.value.data,
      osaamisalat: [
        ...store.value.data.osaamisalat,
        {
          nimi: {},
          uri: 'temporary_osaamisala_' + genUuid(),
        },
      ],
    });
}

function osaamisalaSivutettuIndeksi(osaamisalaIndex) {
  return osaamisalaIndex + (osaamisalatSivu.value - 1) * sivukoot.value;
}

function osaamisalaKoodiLisays(koodi, osaamisalaIndex) {
  store.value?.setData(
    {
      ...store.value.data,
      osaamisalat: _.map(store.value.data.osaamisalat,
        (osaamisala, index) => index === osaamisalaSivutettuIndeksi(osaamisalaIndex) ? koodi : osaamisala),
    });
}

function poistaOsaamisala(osaamisalaIndex) {
  store.value?.setData(
    {
      ...store.value.data,
      osaamisalat: _.filter(store.value.data.osaamisalat, (osaamisala, index) => index !== osaamisalaSivutettuIndeksi(osaamisalaIndex)),
    });
}

function poistaTutkintonimike(tutkintonimikeIndex) {
  store.value?.setData(
    {
      ...store.value.data,
      tutkintonimikkeet: _.filter(store.value.data.tutkintonimikkeet, (tutkintonimike, index) => index !== tutkintonimikeSivutettuIndeksi(tutkintonimikeIndex)),
    });
}

function recursiveFlattenRakenneOsat(osat) {
  return _.flatMap(osat, osa => osa.osat ? [osa, ...recursiveFlattenRakenneOsat(osa.osat)] : osa);
}

function pageSliced(array, page) {
  return _.slice(array, (page - 1) * sivukoot.value, ((page - 1) * sivukoot.value) + sivukoot.value);
}

function toggleRakenne() {
  naytaRakenne.value = !naytaRakenne.value;
  store.value?.setData(
    {
      ...store.value.data,
      rakenne: {
        ...store.value.data.rakenne,
        osat: _.map(store.value.data.rakenne.osat, osa => toggleOsa(osa, naytaRakenne.value)),
      },
    });
}

function toggleOsa(osa, isOpen) {
  return {
    ...osa,
    isOpen,
    osat: _.map(osa.osat, lapsi => toggleOsa(lapsi, isOpen)),
  };
}

function copy(val) {
  const clone = _.cloneDeep(val);
  leikelauta.value = [
    ...leikelauta.value,
    recursiveClone(clone),
  ];
}

function recursiveClone(clone) {
  return {
    ...clone,
    ...(clone.uuid && { uuid: genUuid() }),
    ...(clone.tunniste && { tunniste: genUuid() }),
    osat: _.map(clone.osat, osa => recursiveClone(osa)),
  };
}

async function tarkistaTallennusLeikelauta() {
  if (_.size(leikelauta.value) > 0) {
    const ok = await $bvModal.msgBoxConfirm(
      Kielet.kaannaOlioTaiTeksti('leikelauta-varoitus'), {
        title: Kielet.kaannaOlioTaiTeksti('vahvista-tallennus'),
        okTitle: Kielet.kaannaOlioTaiTeksti('tallenna'),
        cancelTitle: Kielet.kaannaOlioTaiTeksti('peruuta'),
        size: 'lg',
      });

    if (ok) {
      leikelauta.value = [];
    }

    return ok;
  }

  return true;
}

async function tarkistaPeruutusLeikelauta() {
  if (_.size(leikelauta.value) > 0) {
    const ok = await $bvModal.msgBoxConfirm(
      Kielet.kaannaOlioTaiTeksti('leikelauta-varoitus'), {
        title: Kielet.kaannaOlioTaiTeksti('vahvista-peruutus'),
        okTitle: Kielet.kaannaOlioTaiTeksti('vahvista-peruutus'),
        cancelTitle: Kielet.kaannaOlioTaiTeksti('peruuta'),
        size: 'lg',
      });

    if (ok) {
      leikelauta.value = [];
    }

    return ok;
  }

  return true;
}

// Watchers
watch(browserEvents, (newVal) => {
  onInput(newVal);
});

// Lifecycle hooks
onMounted(async () => {
  const projektiIdNumber = _.parseInt(route.params.projektiId as string);
  if (projektiIdNumber) {
    await onProjektiChange(projektiIdNumber);
  }
});

// Provide values for child components
provide('kayttamattomatTutkinnonOsat', kayttamattomatTutkinnonOsat);
provide('tutkintonimikkeet', tutkintonimikkeet);
provide('osaamisalat', osaamisalat);
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
.tree {
  background: #f2f2f2;

  .drag-area {
    .drag-area-left {
      .helptext {
        background: #eceaea;
        min-height: 20px;
        border: 1px dashed #cfcece;
      }

    }

    .drag-area-right {
      .tosa {
        background: #f9fbfe;
      }

      .menu {
        background: #fff;
        width: 400px;

        .paaryhma {
          height: 44px;
          background: #f0f4fb;
          border-bottom-right-radius: 4px;
          border-top-right-radius: 4px;
        }

        .kopioitava {
          height: 54px;
          background: #ffffff;
          border-bottom-right-radius: 4px;
          border-top-right-radius: 4px;
        }
      }
    }
  }
}

.leikelauta {
  padding: 10px;
  background: #f7f7f7;
  border:1px solid #e0e0e1;
  border-radius: 5px;

  &.empty {
    height: 80px;
  }
}

.draggable, :deep(.draggable) {
  cursor: grab;
  user-select: none;

  &.paaryhma, &.kopioitava {
    .colorblock {
      border-bottom-left-radius: 4px;
      border-top-left-radius: 4px;
      width: 8px;
      display: block;
    }

    .paaryhma-label {
      border: 0;
    }
  }

  .colorblock {
    width: 25px;
    color: $white;
    border-bottom-left-radius: 8px;
    border-top-left-radius: 8px;
    border-right: 0;
  }

  .paaryhma-label {
    border: 1px solid $gray-lighten-3;
    border-left: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.tosa {
    .grip {
      color: $blue-lighten-6;
    }
  }

  &.osaamisalat .colorblock, &.tutkintonimikkeet .colorblock{
    padding: 0.5rem 0.3rem 0.45rem 0 !important;
  }

  .koodi-input :deep(input){
    border-radius: 0;
    border-right: 0;
    border-left: 0;
  }
}

.actions {

  :deep(.ep-button .btn-link) {
    padding-left: 0 !important;
    .teksti{
      padding-left: 0 !important;
    }
  }

}

</style>
