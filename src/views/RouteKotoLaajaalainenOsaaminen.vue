<template>
  <EpEditointi
    v-if="editointiStore"
    :store="editointiStore"
    :versionumero="versionumero"
  >
    <template #header="{ data }">
      <h2
        v-if="data.nimi"
        class="m-0"
      >
        {{ $kaanna(data.nimi) }}
      </h2>
      <h2
        v-else
        class="m-0"
      >
        {{ $t('nimeton-opinto') }}
      </h2>
    </template>
    <template #default="{ data, isEditing }">
      <b-row
        v-if="isEditing"
        class="mb-4"
      >
        <b-col lg="8">
          <b-form-group
            :label="$t('otsikko') + (isEditing ? ' *' : '')"
            required
          >
            <ep-input
              v-model="data.nimi"
              :is-editing="isEditing"
            />
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col lg="8">
          <b-form-group required>
            <template
              v-if="isEditing"
              #label
            >
              <div>{{ $t('kappaleen-teksti') }}</div>
            </template>
            <ep-content
              v-model="data.yleiskuvaus"
              layout="normal"
              :is-editable="isEditing"
              :kasite-handler="kasiteHandler"
              :kuva-handler="kuvaHandler"
            />
          </b-form-group>
        </b-col>
      </b-row>

      <b-row
        v-if="data.osaamisAlueet.length > 0"
        class="mt-4"
      >
        <b-col lg="8">
          <div
            v-for="(osaamisalue, index) in data.osaamisAlueet"
            :key="index+'kotoLaajaAlainenOsaaminen'"
          >
            <div class="mt-4">
              <span>
                <h3 class="d-inline">{{ $kaanna(osaamisalue.koodi.nimi) }}</h3>
                <b-button
                  v-if="isEditing"
                  variant="link"
                  @click.stop="removeLaajaAlainenOsaaminen(index, osaamisalue.koodi.arvo)"
                >
                  <EpMaterialIcon>delete</EpMaterialIcon>
                  {{ $t('poista') }}
                </b-button>
              </span>
            </div>
            <ep-content
              v-model="osaamisalue.kuvaus"
              layout="normal"
              :is-editable="isEditing"
            />
          </div>
        </b-col>
      </b-row>

      <b-row class="mt-4">
        <b-col lg="8">
          <b-dropdown
            v-if="isEditing"
            :text="$t('lisaa-laaja-alainen-osaaminen')"
            variant="primary"
            class="mb-4"
          >
            <b-dropdown-item-button
              v-for="(laajaAlainenKoodi, index) in laajaAlaisetKoodit"
              :key="index+'addlaaja'"
              :disabled="laajaAlainenKoodi.isAlreadySelected"
              @click="addLaajaAlainenOsaaminen(laajaAlainenKoodi)"
            >
              {{ laajaAlainenKoodi.arvo + '. ' + $kaanna(laajaAlainenKoodi.nimi) }}
            </b-dropdown-item-button>
          </b-dropdown>
        </b-col>
      </b-row>
    </template>
  </EpEditointi>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import { PerusteStore } from '@/stores/PerusteStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { KotoLaajaalainenOsaaminenStore } from '@/stores/Koto/KotoLaajaalainenOsaaminenStore';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { KuvaStore } from '@/stores/KuvaStore';
import { Koodisto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna, $vahvista } from '@shared/utils/globals';

interface LaajaaAlainenOsaaminenKoodi {
  nimi: { [locale: string]: string };
  arvo: string;
  uri: string;
  koodisto: string;
  isAlreadySelected: boolean;
}

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const route = useRoute();
const editointiStore = ref<EditointiStore | null>(null);
const laajaAlaisetKoodit = ref<LaajaaAlainenOsaaminenKoodi[]>([]);

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const kotoLaajaalainenOsaaminenId = computed(() => {
  return route.params.kotoLaajaalainenOsaaminenId;
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const kasiteHandler = inject('kasiteHandler');
const kuvaHandler = inject('kuvaHandler');

onMounted(async () => {
  try {
    const koodit = (await Koodisto.kaikki(
      'laajaalainenosaaminenkoto2022')).data;

    laajaAlaisetKoodit.value = koodit
      .sort(x => parseInt(x.koodiArvo!))
      .reverse()
      .map(koodi => ({
        uri: koodi.koodiUri!,
        arvo: koodi.koodiArvo!,
        koodisto: koodi.koodisto!.koodistoUri!,
        nimi: extractNimi(koodi),
        isAlreadySelected: false,
      }));
  }
  catch (err) {
    console.error(err);
  }
});

watch(kotoLaajaalainenOsaaminenId, async (id: string, oldId: string) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

watch(versionumero, async () => {
  await fetch();
}, { immediate: true });

async function fetch() {
  await props.perusteStore.blockUntilInitialized();
  const kotoStore = new KotoLaajaalainenOsaaminenStore(perusteId.value!, Number(kotoLaajaalainenOsaaminenId.value), versionumero.value);
  editointiStore.value = new EditointiStore(kotoStore);
}

function extractNimi(koodi) {
  const nimet: { [locale: string]: string } = {};

  koodi.metadata!.forEach(meta => {
    nimet[meta.kieli!.toLowerCase()] = meta.nimi;
  });

  return nimet;
}

function addLaajaAlainenOsaaminen(laajaAlainenKoodi) {
  setKoodiSelected(laajaAlainenKoodi.arvo);
  editointiStore.value!.data.osaamisAlueet.push({ koodi: laajaAlainenKoodi });
}

function setKoodiSelected(koodiarvo) {
  let selectedOsaaminen = laajaAlaisetKoodit.value.find(koodi => koodi.arvo === koodiarvo);
  if (selectedOsaaminen) {
    selectedOsaaminen.isAlreadySelected = true;
  }
}

async function removeLaajaAlainenOsaaminen(index, koodiarvo) {
  if (await $vahvista($t('vahvista-poisto'), $t('poista-koto-laaja-alainen-osaamisalue'))) {
    editointiStore.value!.data.osaamisAlueet.splice(index, 1);
    setKoodiNotSelected(koodiarvo);
  }
}

function setKoodiNotSelected(koodiarvo) {
  let selectedOsaaminen = laajaAlaisetKoodit.value.find(koodi => koodi.arvo === koodiarvo);
  if (selectedOsaaminen) {
    selectedOsaaminen.isAlreadySelected = false;
  }
}
</script>
