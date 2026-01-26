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
        {{ $t('nimeton-kurssi') }}
      </h2>
    </template>

    <template #default="{ data, isEditing, supportData }">
      <b-row>
        <b-col
          v-if="isEditing"
          cols="8"
        >
          <b-form-group :label="$t('kurssin-nimi')">
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

      <hr>

      <b-row>
        <b-col cols="11">
          <b-form-group :label="$t('tavoitteisiin-liittyvat-keskeiset-sisaltoalueet')">
            <ep-content
              v-model="data.kuvaus"
              layout="normal"
              :is-editable="isEditing"
            />
          </b-form-group>
        </b-col>
      </b-row>

      <hr>

      <b-row>
        <b-col cols="11">
          <b-form-group :label="$t('liitetyt-tavoitteet')">
            <b-form-checkbox-group
              v-if="isEditing"
              :value="data.tavoitteet"
              stacked
              @input="data.tavoitteet = $event"
            >
              <b-form-checkbox
                v-for="tavoite in supportData.tavoitteet"
                :key="tavoite.id"
                :value="tavoite.id"
              >
                {{ $kaanna(tavoite.tavoite) }}
              </b-form-checkbox>
            </b-form-checkbox-group>
            <template v-else>
              <div
                v-for="tavoite in tavoitteet"
                :key="tavoite.id"
                class="listaus p-3"
              >
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
import { KoodistoSelectStore, getKoodistoSivutettuna } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { AipeKurssiStore } from '@/stores/AipeKurssiStore';
import { $kaanna, $t } from '@shared/utils/globals';
import EpToggleGroup from '@shared/components/forms/EpToggleGroup.vue';

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
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
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
