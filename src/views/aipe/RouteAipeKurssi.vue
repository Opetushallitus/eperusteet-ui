<template>
  <EpEditointi :store="store" :versionumero="versionumero">
    <template #header="{ data }">
      <h2 v-if="data.koodi">{{ $kaanna(data.koodi.nimi) }}</h2>
      <h2 v-else-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else class="font-italic" >{{ $t('nimeton-kurssi') }}</h2>
    </template>

    <template #default="{ data, isEditing, supportData }">
      <b-row>
        <b-col cols="8" v-if="isEditing">
          <b-form-group :label="$t('kurssin-nimi')">
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
      </b-row>

      <hr/>

      <b-row>
        <b-col cols="11">
          <b-form-group :label="$t('tavoitteisiin-liittyvat-keskeiset-sisaltoalueet')">
            <ep-content layout="normal" v-model="data.kuvaus" :is-editable="isEditing"> </ep-content>
          </b-form-group>
        </b-col>
      </b-row>

      <hr/>

      <b-row>
        <b-col cols="11">
          <b-form-group :label="$t('liitetyt-tavoitteet')">
            <b-form-checkbox-group v-if="isEditing" v-model="data.tavoitteet" stacked>
              <b-form-checkbox v-for="tavoite in supportData.tavoitteet" :key="tavoite.id" :value="tavoite.id">
                {{ $kaanna(tavoite.tavoite) }}
              </b-form-checkbox>
            </b-form-checkbox-group>

            <template v-else>
              <div class="listaus p-3" v-for="tavoite in tavoitteet" :key="tavoite.id">
                {{ $kaanna(tavoite.tavoite) }}
              </div>
            </template>
          </b-form-group>
        </b-col>
      </b-row>

    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed, inject, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { AipeKurssiStore } from '@/stores/AipeKurssiStore';
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
  kurssiId: {
    type: [String, Number],
    required: false,
  },
});

const route = useRoute();
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

const isEditing = computed(() => {
  return store.value?.isEditing;
});

const tavoitteet = computed(() => {
  return _.filter(store.value?.supportData?.tavoitteet, tavoite => _.includes(store.value?.data?.tavoitteet, _.toString(tavoite.id)));
});

const kurssiChange = async () => {
  const storeInstance = new AipeKurssiStore(perusteId.value!, props.vaiheId, props.oppiaineId, props.kurssiId, props.perusteStore, versionumero.value);
  store.value = new EditointiStore(storeInstance);
};

watch(() => props.kurssiId, async () => {
  await kurssiChange();
}, { immediate: true });

watch(versionumero, async () => {
  await kurssiChange();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.listaus:nth-of-type(even) {
  background-color: $table-even-row-bg-color;
}
.listaus:nth-of-type(odd) {
  background-color: $table-odd-row-bg-color;
}
</style>
