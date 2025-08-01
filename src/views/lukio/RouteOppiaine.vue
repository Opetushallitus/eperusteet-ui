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
        {{ $t('nimeton-oppiaine') }}
      </h2>
    </template>

    <template #default="{ data, isEditing }">
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
          <hr>

          <EpCollapse
            :collapsable="!isEditing"
            :use-padding="false"
          >
            <template #header>
              <h4>{{ $t('oppiaineen-tehtava') }}</h4>
            </template>
            <ep-content
              v-model="data.tehtava.kuvaus"
              layout="normal"
              :is-editable="isEditing"
            />
          </EpCollapse>

          <EpCollapse
            :collapsable="!isEditing"
            :use-padding="false"
          >
            <template #header>
              <h4>{{ $t('laaja-alaisen-osaamisen-osa-alueet') }}</h4>
            </template>
            <ep-content
              v-model="data.laajaAlaisetOsaamiset.kuvaus"
              layout="normal"
              :is-editable="isEditing"
            />
          </EpCollapse>

          <EpCollapse
            :collapsable="!isEditing"
            :use-padding="false"
          >
            <template #header>
              <h4>{{ $t('tavoitteet') }}</h4>
            </template>

            <h5>{{ $t('tavoitteiden-kuvaus') }}</h5>
            <ep-content
              v-model="data.tavoitteet.kuvaus"
              layout="normal"
              :is-editable="isEditing"
            />

            <div v-if="isEditing">
              <VueDraggable
                v-bind="tavoitealueDragOptions"
                v-model="data.tavoitealueet"
                tag="div"
              >
                <div
                  v-for="(tavoitealue, tavoitealueIndex) in data.tavoitteet.tavoitealueet"
                  :key="'tavoite'+tavoitealueIndex"
                  class="mt-4 p-2 tavoitealue editing"
                >
                  <div class="d-flex">
                    <div class="order-handle m-2">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                    <div class="mt-2 w-100">
                      <div class="row">
                        <div class="col-11">
                          <div class="font-weight-bold mb-2">
                            {{ $t('tavoitealueen-nimi') }}
                          </div>
                          <ep-input
                            v-model="tavoitealue.nimi"
                            :is-editing="true"
                          />

                          <div class="mt-3 mb-2 font-weight-bold">
                            {{ $t('kohde') }}
                          </div>
                          <ep-input
                            v-model="tavoitealue.kohde"
                            :is-editing="true"
                          />
                        </div>
                      </div>

                      <div class="mt-3 mb-2 font-weight-bold">
                        {{ $t('tavoitteet') }}
                      </div>
                      <EpTavoitealueTavoitteet v-model="tavoitealue.tavoitteet">
                        <template #default="{tavoiteIndex}">
                          <EpInput
                            v-model="tavoitealue.tavoitteet[tavoiteIndex]"
                            :is-editing="true"
                            class="input-wrapper"
                          >
                            <template #left>
                              <div class="order-handle m-2">
                                <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                              </div>
                            </template>
                          </EpInput>
                        </template>
                        <template #footer>
                          <EpButton
                            icon="delete"
                            class="mr-5"
                            variant="link"
                            @click="poistaTavoitealue(tavoitealue)"
                          >
                            {{ $t('poista-tavoitealue') }}
                          </EpButton>
                        </template>
                      </EpTavoitealueTavoitteet>
                    </div>
                  </div>
                </div>
              </VueDraggable>

              <EpButton
                class="mt-4"
                variant="outline"
                icon="add"
                @click="lisaaTavoitealue()"
              >
                {{ $t('lisaa-tavoitealue') }}
              </EpButton>
            </div>

            <div v-if="!isEditing">
              <div
                v-for="(tavoitealue, tavoitealueIndex) in data.tavoitteet.tavoitealueet"
                :key="'tavoite'+tavoitealueIndex"
                class="tavoitealue"
              >
                <div class="font-weight-bold">
                  {{ $kaanna(tavoitealue.nimi) }}
                </div>
                <div>{{ $kaanna(tavoitealue.kohde) }}</div>
                <ul>
                  <li
                    v-for="tavoite in tavoitealue.tavoitteet"
                    :key="'tavoite'+tavoite._id"
                  >
                    {{ $kaanna(tavoite) }}
                  </li>
                </ul>
              </div>
            </div>
          </EpCollapse>

          <EpCollapse
            :collapsable="!isEditing"
            :use-padding="false"
          >
            <template #header>
              <h4>{{ $t('osaamisen-arviointi') }}</h4>
            </template>
            <ep-content
              v-model="data.arviointi.kuvaus"
              layout="normal"
              :is-editable="isEditing"
            />
          </EpCollapse>

          <EpCollapse
            :collapsable="!isEditing"
            :use-padding="false"
          >
            <template #header>
              <h4>{{ $t('moduulit') }}</h4>
            </template>

            <h5>{{ $t('pakollisten-moduulien-kuvaus') }}</h5>
            <ep-content
              v-if="isEditing || data.pakollisetModuulitKuvaus"
              v-model="data.pakollisetModuulitKuvaus"
              layout="normal"
              :is-editable="isEditing"
            />
            <template v-if="!isEditing">
              <router-link
                v-for="(moduuli, mindex) in pakollisetModuulit"
                :key="'pmoduuli'+mindex"
                :to="{ name: 'moduuli', params: { moduuliId: moduuli.id } }"
              >
                <EpModuuli
                  :moduuli="moduuli"
                  class="mb-2"
                />
              </router-link>
            </template>

            <EpButton
              v-if="!isEditing"
              v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
              class="mt-4"
              variant="outline"
              icon="add"
              @click="lisaaModuuli(true)"
            >
              {{ $t('lisaa-pakollinen-moduuli') }}
            </EpButton>

            <h5 class="mt-5">
              {{ $t('valinnaisten-moduulien-kuvaus') }}
            </h5>
            <ep-content
              v-if="isEditing || data.pakollisetModuulitKuvaus"
              v-model="data.valinnaisetModuulitKuvaus"
              layout="normal"
              :is-editable="isEditing"
            />
            <template v-if="!isEditing">
              <router-link
                v-for="(moduuli, mindex) in valinnaisetModuulit"
                :key="'vmoduuli'+mindex"
                :to="{ name: 'moduuli', params: { moduuliId: moduuli.id } }"
              >
                <EpModuuli
                  :moduuli="moduuli"
                  class="mb-2"
                />
              </router-link>
            </template>
            <EpButton
              v-if="!isEditing"
              v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
              class="mt-4"
              variant="outline"
              icon="add"
              @click="lisaaModuuli(false)"
            >
              {{ $t('lisaa-valinnainen-moduuli') }}
            </EpButton>
          </EpCollapse>

          <EpCollapse
            v-if="!data._oppiaine || !data.id"
            :collapsable="!isEditing"
            :use-padding="false"
            :border-bottom="false"
            class="mt-4"
          >
            <template #header>
              <h4>{{ $t('oppimaarat') }}</h4>
            </template>

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
                <router-link :to="{ name: 'lukio_oppiaine', params: { oppiaineId: oppimaara.id } }">
                  {{ $kaanna(oppimaara.nimi) || $t('nimeton-oppimaara') }}
                </router-link>
              </div>
            </VueDraggable>

            <EpButton
              v-if="!isEditing"
              v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
              class="mt-2"
              variant="outline"
              icon="add"
              @click="lisaaOppimaara()"
            >
              {{ $t('lisaa-oppimaara') }}
            </EpButton>
          </EpCollapse>
        </b-col>
      </b-row>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { VueDraggable } from 'vue-draggable-plus';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { LukioOppiaineStore } from '@/stores/LukioOppiaineStore';
import EpTavoitealueTavoitteet from '@shared/components/EpTavoitesisaltoalue/EpTavoitealueTavoitteet.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpModuuli from '@shared/components/EpModuuli/EpModuuli.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
  oppiaineId?: any;
  parentId?: any;
}>();

const router = useRouter();
const route = useRoute();

const store = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const koodisto = new KoodistoSelectStore({
  koodisto: 'oppiaineetjaoppimaaratlops2021',
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

// Watch for oppiaineId changes
watch(() => props.oppiaineId, async () => {
  const lukioOppiaineStore = new LukioOppiaineStore(
    perusteId.value!,
    props.oppiaineId,
    props.parentId,
    props.perusteStore,
    null,
  );
  store.value = new EditointiStore(lukioOppiaineStore);
}, { immediate: true });

const storeData = computed({
  get() {
    return store.value?.data;
  },
  set(data) {
    store.value?.setData(data);
  },
});

const poistaTavoitealue = (poistettavaTavoitealue) => {
  store.value?.setData({
    ...store.value.data.value,
    tavoitteet: {
      ...store.value.data.value.tavoitteet,
      tavoitealueet: _.filter(store.value.data.value.tavoitteet.tavoitealueet, tavoitealue => tavoitealue !== poistettavaTavoitealue),
    },
  });
};

const lisaaTavoitealue = () => {
  store.value?.setData({
    ...store.value.data.value,
    tavoitteet: {
      ...store.value.data.value.tavoitteet,
      tavoitealueet: [
        ...store.value.data.value.tavoitteet.tavoitealueet,
        {
          tavoitteet: [],
        },
      ],
    },
  });
};

const isEditing = computed(() => {
  return store.value?.isEditing;
});

const tavoitealueDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !isEditing.value,
    group: {
      name: 'tavoitealue',
    },
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

const lisaaOppimaara = () => {
  router.push({
    name: 'lukio_oppiaine',
    params: {
      parentId: props.oppiaineId,
    },
  });
};

const lisaaModuuli = (pakollinen: boolean) => {
  router.push({
    name: 'moduuli',
    params: {
      oppiaineId: props.oppiaineId,
      pakollinen: _.toString(pakollinen),
    },
  });
};

const pakollisetModuulit = computed(() => {
  return _.filter(store.value?.data.moduulit, 'pakollinen');
});

const valinnaisetModuulit = computed(() => {
  return _.reject(store.value?.data.moduulit, 'pakollinen');
});
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

  .tavoitealue {
    &.editing {
      border: 1px solid $gray-lighten-8;
      border-radius: 3px;
    }
  }

  .moduuli {
    background-color: #eaf6fe;

    .opintopiste {
      font-size: 0.85rem;
    }
  }

</style>
