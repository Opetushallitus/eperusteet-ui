<template>
  <EpEditointi v-if="store" :store="store" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 class="m-0" v-if="data.nimiKoodi" >{{ $kaanna(data.nimiKoodi.nimi) }}</h2>
      <h2 class="m-0" v-else >{{ $t('nimeton-opinto') }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing }">

      <b-row v-if="isEditing" class="mb-4">
        <b-col lg="8">
          <b-form-group :label="$t('otsikko') + (isEditing ? ' *' : '')" required>
            <ep-koodisto-select :store="tavoitesisaltoalueotsikkoKoodisto" v-model="data.nimiKoodi" :is-editing="isEditing" :naytaArvo="false">
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

      <b-row>
        <b-col lg="8">
          <b-form-group required>
            <template v-if="isEditing" #label>
              <div>{{$t('kuvaus')}}</div>
            </template>
            <ep-content v-model="data.kuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>

          <EpKotoTaitotasot
            class="mt-4"
            v-model="data.taitotasot"
            :isEditing="isEditing"
            :kasiteHandler="kasiteHandler"
            :kuvaHandler="kuvaHandler"
            taitotasoTyyppi="opintokokonaisuus"/>
        </b-col>
      </b-row>

    </template>
  </EpEditointi>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import { useRoute } from 'vue-router';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { Koodisto } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpKotoTaitotasot from '@shared/components/EpKotoTaitotasot/EpKotoTaitotasot.vue';
import { KotoOpintoStore } from '@/stores/Koto/KotoOpintoStore';
import { Murupolku } from '@shared/stores/murupolku';
import * as _ from 'lodash';
import { $kaanna, $t } from '@shared/utils/globals';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
});

const route = useRoute();
const store = ref<EditointiStore | null>(null);
const kasiteHandler = inject('kasiteHandler');
const kuvaHandler = inject('kuvaHandler');

const tavoitesisaltoalueotsikkoKoodisto = new KoodistoSelectStore({
  koodisto: 'tavoitesisaltoalueenotsikko',
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

const kotoOpintoId = computed(() => route.params.kotoOpintoId);
const perusteId = computed(() => props.perusteStore.perusteId.value);
const versionumero = computed(() => _.toNumber(route.query.versionumero));
const kotoSisalto = computed(() => store.value?.data?.value || null);

const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const tkstore = new KotoOpintoStore(perusteId.value!, Number(kotoOpintoId.value), versionumero.value);
  store.value = new EditointiStore(tkstore);
};

watch(kotoOpintoId, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

watch(versionumero, async () => {
  await fetch();
}, { immediate: true });

watch(kotoSisalto, (kotoSisalto) => {
  if (kotoSisalto) {

    Murupolku.aseta('koto_opinto', kotoSisalto.nimiKoodi ? $kaanna(kotoSisalto.nimiKoodi.nimi) : $t('nimeton-opinto'), {
      name: 'koto_opinto',
    });
  }
});
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
