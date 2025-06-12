<template>
  <EpEditointi v-if="store" :store="store" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 class="m-0" v-if="data.nimiKoodi" >{{ $kaanna(data.nimiKoodi.nimi) }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing }">

      <b-row v-if="isEditing" class="mb-4">
        <b-col lg="8">
          <b-form-group :label="$t('otsikko') + (isEditing ? ' *' : '')" required>
            <ep-koodisto-select :store="laajaalainenOsaaminenKoodisto" v-model="data.nimiKoodi" :is-editing="isEditing" :naytaArvo="false">
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
      </b-row>

      <ep-toggle v-if="isEditing" class="my-4" v-model="data.liite">{{$t('nayta-laaja-alainen-osaaminen-liitteena')}}</ep-toggle>

      <b-row>
        <b-col lg="8">
          <b-form-group required>
            <ep-content v-model="data.teksti"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-col>
      </b-row>

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
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { Koodisto } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import * as _ from 'lodash';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { TermitStore } from '@/stores/TermitStore';
import { LaajaalainenOsaaminenStore } from '@/stores/LaajaalainenOsaaminenStore';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const store = ref<EditointiStore | null>(null);
const route = useRoute();

const laajaalainenOsaaminenKoodisto = new KoodistoSelectStore({
  koodisto: 'tutkintokoulutukseenvalmentavakoulutuslaajaalainenosaaminen',
  async query(query: string, sivu = 0, koodisto: string) {
    const { data } = (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    }));
    return data as any;
  },
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const laajaalainenosaaminenId = computed(() => {
  return route.params.laajaalainenosaaminenId;
});


const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const tkstore = new LaajaalainenOsaaminenStore(perusteId.value!, Number(laajaalainenosaaminenId.value), versionumero.value);
  store.value = new EditointiStore(tkstore);
};

watch(() => laajaalainenosaaminenId.value, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

watch(() => versionumero.value, async () => {
  await fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

:deep(fieldset) {
  padding-right: 0;
}

:deep(.input-wrapper) {
  flex: 1 1 0;

  input {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}
</style>
