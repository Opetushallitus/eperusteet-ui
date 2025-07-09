<template>
  <EpEditointi v-if="store" :store="store" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 class="m-0" v-if="data.nimiKoodi" >{{ $kaanna(data.nimiKoodi.nimi) }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing, validation }">

      <b-row>
        <b-col md="8">
          <b-form-group :label="$t('opintokokonaisuuden-nimi') + (isEditing ? ' *' : '')" required>
            <ep-koodisto-select :store="koodisto" v-model="data.nimiKoodi" :is-editing="isEditing" :naytaArvo="false">
              <template #default="{ open }">
                <b-input-group>
                  <b-form-input
                    :value="data.nimiKoodi ? $kaanna(data.nimiKoodi.nimi) : ''"
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

        <b-col md="2">
          <b-form-group :label="$t('minimilaajuus')" required>
            <ep-laajuus-input v-model="data.minimilaajuus" :is-editing="isEditing">
              {{$t('opintopiste')}}
            </ep-laajuus-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col md="8">
          <b-form-group :label="$t('kuvaus')  + (isEditing ? ' *' : '')" required>
            <ep-content v-model="data.kuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                        :validation="validation.kuvaus"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-col>
      </b-row>

      <hr/>

      <h3>{{$t('opetuksen-tavoitteet')}}</h3>

      <b-row>
        <b-col md="8">
          <b-form-group :label="$t('tavoitteiden-otsikko')  + (isEditing ? ' *' : '')" required>
            <ep-input v-model="data.opetuksenTavoiteOtsikko" :is-editing="isEditing" :validation="validation.opetuksenTavoiteOtsikko"/>
          </b-form-group>
        </b-col>
      </b-row>

      <b-form-group :label="$t('tavoitteet')  + (isEditing ? ' *' : '')" required>

        <div v-if="isEditing">
          <VueDraggable
            v-bind="tavoitteetOptions"
            tag="div"
            v-model="data.opetuksenTavoitteet">

            <b-row v-for="(tavoite, index) in data.opetuksenTavoitteet" :key="'tavoite'+index" class="pb-2">
              <b-col cols="10" lg="8">
                <ep-input v-model="tavoite.nimi" :is-editing="isEditing" :disabled="!tavoite.uri.startsWith('temporary')">
                  <template #left>
                    <div class="order-handle m-2">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                  </template>
                </ep-input>
              </b-col>
              <b-col cols="1" v-if="isEditing">
                <div class="default-icon clickable mt-2" @click="poista(tavoite, 'opetuksenTavoitteet')">
                  <EpMaterialIcon icon-shape="outlined">delete</EpMaterialIcon>
                </div>
              </b-col>
            </b-row>
          </VueDraggable>

          <ep-button v-if="isEditing" variant="outline" icon="add" @click="lisaa('opetuksenTavoitteet', 'opintokokonaisuustavoitteet')">
            {{ $t('lisaa-tavoite') }}
          </ep-button>
        </div>

        <div v-else>
          <ul>
            <li v-for="(tavoite, index) in data.opetuksenTavoitteet" :key="'tavoite'+index">
              {{$kaanna(tavoite.nimi)}}
            </li>
          </ul>
        </div>
      </b-form-group>

      <hr/>

      <h3>{{$t('arviointi')}}</h3>

      <b-form-group :label="$t('opiskelijan-osaamisen-arvioinnin-kohteet')  + (isEditing ? ' *' : '')" required>

        <div v-if="isEditing">
          <VueDraggable
            v-bind="arvioinnitOptions"
            tag="div"
            v-model="data.arvioinnit">

            <b-row v-for="(arviointi, index) in data.arvioinnit" :key="'arviointi'+index" class="pb-2">
              <b-col cols="10" lg="8">
                <ep-input v-model="arviointi[sisaltokieli]" :is-editing="isEditing" type="string" class="flex-grow-1">
                  <template #left>
                    <div class="order-handle m-2">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                  </template>
                </ep-input>
              </b-col>
              <b-col cols="1" v-if="isEditing">
                <div class="default-icon clickable mt-2" @click="poista(arviointi, 'arvioinnit')">
                  <EpMaterialIcon icon-shape="outlined">delete</EpMaterialIcon>
                </div>
              </b-col>
            </b-row>
          </VueDraggable>

          <ep-button v-if="isEditing" variant="outline" icon="add" @click="lisaa('arvioinnit')">
            {{ $t('lisaa-arvioinnin-kohde') }}
          </ep-button>
        </div>

        <div v-else>
          <ul>
            <li v-for="(arviointi, index) in data.arvioinnit" :key="'arviointi'+index">
              {{$kaanna(arviointi)}}
            </li>
          </ul>
        </div>
      </b-form-group>

    </template>
  </EpEditointi>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import { Koodisto } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { VueDraggable } from 'vue-draggable-plus';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { generateTemporaryKoodiUri } from '@shared/utils/koodi';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const route = useRoute();
const store = ref<EditointiStore | null>(null);

const koodisto = new KoodistoSelectStore({
  koodisto: 'opintokokonaisuusnimet',
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const opintokokonaisuusId = computed(() => {
  return route.params.opintokokonaisuusId;
});

const sisaltokieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const defaultDragOptions = computed(() => {
  return {
    animation: 300,
    emptyInsertThreshold: 10,
    handle: '.order-handle',
    disabled: !store.value!.isEditing,
    ghostClass: 'dragged',
  };
});

const arvioinnitOptions = computed(() => {
  return {
    ...defaultDragOptions.value,
    group: {
      name: 'arvioinnit',
    },
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

const kasiteHandler = inject('kasiteHandler');
const kuvaHandler = inject('kuvaHandler');

const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const tkstore = new OpintokokonaisuusStore(perusteId.value!, Number(opintokokonaisuusId.value), versionumero.value);
  store.value = new EditointiStore(tkstore);
};

const lisaa = (array: string, koodisto?: string) => {
  store.value?.setData({
    ...store.value?.data.value,
    [array]: [
      ..._.get(store.value?.data.value, array),
      {
        ...(koodisto && { uri: generateTemporaryKoodiUri(koodisto) }),
      },
    ],
  });
};

const poista = (poistettavaRivi: any, array: string) => {
  store.value?.setData({
    ...store.value?.data.value,
    [array]: _.filter(_.get(store.value?.data.value, array), rivi => rivi !== poistettavaRivi),
  });
};

// Watch for changes in opintokokonaisuusId
watch(opintokokonaisuusId, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

// Watch for changes in versionumero
watch(versionumero, async () => {
  await fetch();
}, { immediate: true });
</script>
