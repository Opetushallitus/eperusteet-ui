<template>
  <EpEditointi :store="store">
    <template #header="{ data }">
      <h2 v-if="data.koodi">{{ $kaanna(data.koodi.nimi) }}</h2>
      <h2 v-else-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else class="font-italic" >{{ $t('nimeton-moduuli') }}</h2>
    </template>

    <template #default="{ data, isEditing }">
      <b-row>
        <b-col cols="8" v-if="isEditing" class="mb-3">
          <b-form-group :label="$t('moduulin-nimi')">
            <ep-koodisto-select :store="koodisto" v-model="data.koodi" :is-editing="isEditing" :naytaArvo="false">
              <template #default="{ open }">
                <b-input-group>
                  <b-form-input
                    :value="data.koodi ? $kaanna(data.koodi.nimi) : ''"
                    disabled></b-form-input>
                  <b-input-group-append>
                    <b-button @click="open" variant="primary">
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

        <b-col :cols="isEditing ? 12 : 3" class="mb-3">
          <b-form-group>
            <template #label>
              <div class="d-flex">
                <div>{{$t('tyyppi')}}</div>
                <EpInfoPopover v-if="isEditing" class="ml-2">
                  {{$t('ohje-moduuli-pakollinen')}}
                </EpInfoPopover>
              </div>
            </template>
            <b-form-radio-group stacked v-model="data.pakollinen" v-if="isEditing">
              <b-form-radio :value="false">{{$t('valinnainen')}}</b-form-radio>
              <b-form-radio :value="true">{{$t('pakollinen')}}</b-form-radio>
            </b-form-radio-group>
            <div v-else-if="data.pakollinen">{{$t('pakollinen')}}</div>
            <div v-else-if="!data.pakollinen">{{$t('valinnainen')}}</div>
          </b-form-group>
        </b-col>

        <b-col cols="2" class="mb-3">
          <b-form-group>
            <template #label>{{$t('laajuus')}}</template>
            <div class="d-flex align-items-center">
              <ep-input type="number" v-model="data.laajuus" :isEditing="isEditing"/>
              <div class="ml-2">{{$t('opintopiste')}}</div>
            </div>
          </b-form-group>
        </b-col>
      </b-row>

      <b-form-group>
        <template #label v-if="isEditing">{{$t('moduulin-kuvaus')}}</template>
        <ep-content layout="normal" v-model="data.kuvaus" :is-editable="isEditing"/>
      </b-form-group>

      <hr/>

      <EpCollapse class="mt-4" :collapsable="!isEditing" :usePadding="false">
        <template #header><h4>{{$t('yleiset-tavoitteet')}}</h4></template>

        <template v-if="isEditing">
          <div class="row">
            <div class="col-11">
              <div class="mb-2 font-weight-bold">{{$t('kohde')}}</div>
              <ep-input v-model="data.tavoitteet.kohde" :isEditing="true" />
            </div>
          </div>

          <div class="mb-2 mt-3 font-weight-bold">{{$t('tavoitteet')}}</div>
          <VueDraggable v-bind="tavoitteetDragOptions"
                     tag="div"
                     v-model="data.tavoitteet.tavoitteet">
            <div class="row mb-2" v-for="(tavoite, tavoiteindex) in data.tavoitteet.tavoitteet" :key="'tavoitteet' +tavoiteindex">
              <div class="col-11">
                <EpInput v-model="data.tavoitteet.tavoitteet[tavoiteindex]"
                         :is-editing="true"
                         class="input-wrapper">
                  <template #left>
                    <div class="order-handle m-2">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                  </template>
                </EpInput>
                </div>
                <div class="col-1">
                  <div class="default-icon clickable mt-2" @click="poistaTavoite(tavoite)">
                    <EpMaterialIcon icon-shape="outlined">delete</EpMaterialIcon>
                  </div>
                </div>
              </div>
          </VueDraggable>

          <EpButton class="mt-2" variant="outline" icon="add" @click="lisaaTavoite()">{{ $t('lisaa-tavoite') }}</EpButton>
        </template>

        <template v-else>
          <div class="font-weight-bold">{{$kaanna(data.tavoitteet.kohde)}}</div>
          <ul>
            <li v-for="tavoite in data.tavoitteet.tavoitteet" :key="'tavoite'+tavoite._id">{{$kaanna(tavoite)}}</li>
          </ul>
        </template>

      </EpCollapse>

      <EpCollapse class="mt-4" :collapsable="!isEditing" :usePadding="false" :borderBottom="false">
        <template #header><h4>{{$t('keskeiset-sisallot')}}</h4></template>

        <div v-if="isEditing">
          <VueDraggable
            v-bind="keskeisetSisallotDragOptions"
            tag="div"
            v-model="data.sisallot">

            <div v-for="(sisaltoalue, sisaltoIndex) in data.sisallot" :key="'sisalto'+sisaltoIndex" class="mt-4 p-2 tavoitealue editing">
              <div class="d-flex">
                <div class="order-handle m-2">
                  <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                </div>
                <div class="mt-2 w-100">
                  <div class="row">
                    <div class="col-11">
                      <div class="mb-2 font-weight-bold">{{$t('kohde')}}</div>
                      <ep-input v-model="sisaltoalue.kohde" :isEditing="true" />
                    </div>
                  </div>

                  <div class="mt-3 mb-2 font-weight-bold">{{$t('sisallot')}}</div>
                  <EpTavoitealueTavoitteet v-model="sisaltoalue.sisallot">
                    <template #default="{tavoiteIndex}">
                      <EpInput v-model="sisaltoalue.sisallot[tavoiteIndex]"
                               :is-editing="true"
                               class="input-wrapper">
                        <template #left>
                          <div class="order-handle m-2">
                            <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                          </div>
                        </template>
                      </EpInput>
                    </template>
                    <template #lisaaBtnText>
                      {{ $t('lisaa-sisalto') }}
                    </template>
                    <template #footer>
                      <EpButton icon="delete" class="mr-5" variant="link" @click="poistaSisaltoalue(sisaltoalue)">{{ $t('poista-sisaltoalue') }}</EpButton>
                    </template>
                  </EpTavoitealueTavoitteet>
                </div>
              </div>
            </div>
          </VueDraggable>

          <EpButton class="mt-2" variant="outline" icon="add" @click="lisaaSisaltoalue()">{{ $t('lisaa-sisaltoalue') }}</EpButton>

        </div>

        <div v-if="!isEditing">
          <div v-for="(sisalto, sisaltoIndex) in data.sisallot" :key="'sisalto'+sisaltoIndex" class="tavoitealue">
            <div class="font-weight-bold">{{$kaanna(sisalto.kohde)}}</div>
            <ul>
              <li v-for="tavoite in sisalto.sisallot" :key="'sisalto'+tavoite._id">{{$kaanna(tavoite)}}</li>
            </ul>
          </div>
        </div>
      </EpCollapse>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
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
import { LukioModuuliStore } from '@/stores/LukioModuuliStore';
import EpTavoitealueTavoitteet from '@shared/components/EpTavoitesisaltoalue/EpTavoitealueTavoitteet.vue';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
  oppiaineId?: number;
  moduuliId?: number;
  pakollinen?: boolean;
}>();

const store = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const koodisto = new KoodistoSelectStore({
  koodisto: 'moduulikoodistolops2021',
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

const tavoitteetDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !isEditing.value,
    group: {
      name: 'tavoitteet',
    },
  };
});

const keskeisetSisallotDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !isEditing.value,
    group: {
      name: 'keskeisetSisallot',
    },
  };
});

// Methods
function poistaSisaltoalue(poistettavaSisaltoalue) {
  store.value?.setData({
    ...store.value.data.value,
    sisallot: _.without(store.value.data.value.sisallot, poistettavaSisaltoalue),
  });
}

function lisaaSisaltoalue() {
  store.value?.setData({
    ...store.value.data.value,
    sisallot: [
      ...store.value.data.value.sisallot,
      {
        sisallot: [],
      },
    ],
  });
}

function poistaTavoite(poistettavaTavoite) {
  store.value?.setData({
    ...store.value.data.value,
    tavoitteet: {
      ...store.value.data.value.tavoitteet,
      tavoitteet: _.filter(store.value.data.value.tavoitteet.tavoitteet, tavoite => tavoite !== poistettavaTavoite),
    },
  });
}

function lisaaTavoite() {
  store.value?.setData({
    ...store.value.data.value,
    tavoitteet: {
      ...store.value.data.value.tavoitteet,
      tavoitteet: [
        ...store.value.data.value.tavoitteet.tavoitteet,
        [],
      ],
    },
  });
}

async function initStore() {
  const storeInstance = new LukioModuuliStore(
    perusteId.value!,
    props.oppiaineId!,
    props.moduuliId!,
    props.pakollinen!,
    props.perusteStore,
  );
  store.value = new EditointiStore(storeInstance);
}

// Watchers
watch(() => props.moduuliId, async () => {
  await initStore();
}, { immediate: true });

// Lifecycle hooks
onMounted(async () => {
  if (!store.value) {
    await initStore();
  }
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

  .tavoitealue {
    &.editing {
      border: 1px solid $gray-lighten-8;
      border-radius: 3px;
    }
  }

</style>
