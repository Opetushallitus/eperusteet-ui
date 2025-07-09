<template>
  <EpEditointi v-if="editointiStore" :store="editointiStore" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 v-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else>{{ $t('nimeton-osaamiskokonaisuus') }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing, supportData }">

      <b-row v-if="isEditing" class="mb-4">
        <b-col lg="8">
          <b-form-group :label="$t('osaamiskokonaisuuden-nimi') + ' *'" required>
            <ep-input v-model="data.nimi" :is-editing="isEditing">
            </ep-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row class="mb-4">
        <b-col md="8">
          <b-form-group :label="$t('osaamiskokonaisuuden-kuvaus')">
            <ep-content v-model="data.kuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-col>
      </b-row>

      <h3>{{ $kaanna(data.nimi) }} {{$t('varhaiskasvatuksessa-ja-esi-ja-perusopetuksessa')}}</h3>

      <b-tabs>
        <b-tab :title="$t(kasitteisto.taso.toLowerCase())" v-for="kasitteisto in data.kasitteistot" :key="'kasitteisto' + kasitteisto.taso">
          <b-form-group>
            <ep-content v-model="kasitteisto.kuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-tab>
      </b-tabs>

      <hr/>

      <b-row>
        <b-col md="8">
          <b-form-group>
            <template #label>
              <div>
                <h3>{{$t('keskeinen-kasitteisto')}}</h3>
              </div>
            </template>
            <ep-content v-model="data.keskeinenKasitteisto"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-col>
      </b-row>

      <hr/>

      <h3 class="mt-4">{{$t('paa-alueet')}}</h3>

      <div v-if="isEditing">{{ $t('lisaa-paa-alueita-osaamiskokonaisuuden-tallennetusta-nakymasta') }}</div>
      <template v-else-if="supportData">
        <div v-for="paaAlue in supportData.paaAlueet" :key="'paaalue' + paaAlue.id" class="mb-2">
          <router-link :to="{ name: 'osaamiskokonaisuus_paa_alue', params: { osaamiskokonaisuusPaaAlueId: paaAlue.id } }">
            {{ $kaanna(paaAlue.perusteenOsa.nimi) || $t('nimeton-osaamiskokonaisuuden-paaalue') }}
          </router-link>
        </div>

        <ep-button @click="lisaaPaaAlue()" variant="outline" icon="add" class="mt-2">
          {{ $t('lisaa-paa-alue') }}
        </ep-button>

      </template>

    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { KuvaStore } from '@/stores/KuvaStore';
import { OsaamiskokonaisuusStore } from '@/stores/OsaamiskokonaisuusStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { TermitStore } from '@/stores/TermitStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import * as _ from 'lodash';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { OsaamiskokonaisuusPaaAlueStore } from '@/stores/OsaamiskokonaisuusPaaAlueStore';
import { onMounted } from 'vue';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
  osaamiskokonaisuusId: {
    type: Number,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const editointiStore = ref<EditointiStore | null>(null);
const kasiteHandler = inject('kasiteHandler');
const kuvaHandler = inject('kuvaHandler');

const perusteId = computed(() => props.perusteStore.perusteId.value);
const versionumero = computed(() => _.toNumber(route.query.versionumero));

const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const store = new OsaamiskokonaisuusStore(perusteId.value!, Number(props.osaamiskokonaisuusId), versionumero.value);
  editointiStore.value = new EditointiStore(store);
};

const lisaaPaaAlue = async () => {
  const tallennettu = await OsaamiskokonaisuusPaaAlueStore.create(props.osaamiskokonaisuusId);
  await props.perusteStore.updateNavigation();
  await router.push({
    name: 'osaamiskokonaisuus_paa_alue',
    params: {
      osaamiskokonaisuusPaaAlueId: '' + tallennettu!.id,
    },
  });
};

watch(() => props.osaamiskokonaisuusId, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

watch(versionumero, async () => {
  await fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
</style>
