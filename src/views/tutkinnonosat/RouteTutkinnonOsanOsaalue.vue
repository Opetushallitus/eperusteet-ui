<template>
  <div>
    <div v-if="store">
      <EpEditointi :store="store">
        <template #header="{ data }">
          <h2 class="m-0">
            <span>
              {{ $kaanna(data.nimi) || $t('nimeton-osaalue') }}{{ data.laajuus ? ',' : '' }}
            </span>
            <span v-if="data.laajuus">
              {{ data.laajuus }} {{ $t('OSAAMISPISTE') }}
            </span>
          </h2>
        </template>

        <template #default="{ data, isEditing, validation }">
          <EpSpinner v-if="!data" />
          <div v-else>
            <b-row>
              <b-col md="5">
                <b-form-group :label="$t('osaalue-nimi') + (isEditing ? ' *' : '')">
                  <ep-input
                    v-model="data.nimi"
                    :is-editing="isEditing"
                    :validation="validation.nimi"
                  />
                </b-form-group>
              </b-col>

              <b-col md="4">
                <b-form-group :label="$t('koodi') + (isEditing ? ' *' : '')">
                  <ep-koodisto-select
                    v-model="data.koodi"
                    :store="koodisto"
                    :is-editing="isEditing"
                  >
                    <template #default="{ open }">
                      <b-input-group>
                        <b-form-input
                          :value="data.koodi ? ($kaanna(data.koodi.nimi) + ' (' + data.koodi.arvo + ')') : ''"
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

              <b-col md="3">
                <b-form-group :label="$t('osa-alue-kieli')">
                  <ep-koodisto-select
                    v-model="data.kielikoodi"
                    :store="kielikoodisto"
                    :is-editing="isEditing"
                  >
                    <template #default="{ open }">
                      <b-input-group>
                        <b-form-input
                          :value="data.kielikoodi ? ($kaanna(data.kielikoodi.nimi) + ' (' + data.kielikoodi.arvo + ')') : ''"
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
            </b-row>
          </div>

          <ep-collapse
            tyyppi="pakolliset-osaamistavoitteet"
            :border-bottom="false"
            :border-top="true"
          >
            <template #header>
              <h3>{{ $t('pakolliset-osaamistavoitteet') }}</h3>
            </template>
            <Osaamistavoite
              v-model="data.pakollisetOsaamistavoitteet"
              :is-valinnainen="false"
              :is-editing="isEditing"
            />
          </ep-collapse>

          <ep-collapse
            v-if="isEditing || data.valinnaisetOsaamistavoitteet"
            tyyppi="valinnaiset-osaamistavoitteet"
            :border-bottom="false"
            :border-top="true"
          >
            <template #header>
              <h3>{{ $t('valinnaiset-osaamistavoitteet') }}</h3>
            </template>

            <div
              v-if="isEditing"
              class="mb-3"
            >
              <ep-button
                v-if="data.valinnaisetOsaamistavoitteet"
                variant="link"
                icon="delete"
                @click="poistaValinnaisetOsaamistavoitteet()"
              >
                {{ $t('poista-valinnaiset-osaamistavoitteet') }}
              </ep-button>

              <ep-button
                v-else
                variant="outline"
                icon="add"
                @click="lisaaValinnaisetOsaamistavoitteet()"
              >
                {{ $t('lisaa-valinnaiset-osaamistavoitteet') }}
              </ep-button>
            </div>

            <Osaamistavoite
              v-if="data.valinnaisetOsaamistavoitteet"
              v-model="data.valinnaisetOsaamistavoitteet"
              :is-valinnainen="true"
              :is-editing="isEditing"
            />
          </ep-collapse>

          <ep-collapse
            tyyppi="arviointi"
            :border-bottom="false"
            :border-top="true"
          >
            <template #header>
              <h3>{{ $t('arviointi') + (isEditing ? ' *' : '') }} </h3>
            </template>
            <EpGeneerinenAsteikko
              v-model="arviointi"
              :arviointi-store="arviointiStore"
              :is-editing="isEditing"
            />
          </ep-collapse>
        </template>
      </EpEditointi>
    </div>
    <EpSpinner v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { Koodisto } from '@shared/api/eperusteet';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import Osaamistavoite from '@shared/components/EpOsaamistavoite/Osaamistavoite.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAmmattitaitovaatimukset from '@shared/components/EpAmmattitaitovaatimukset/EpAmmattitaitovaatimukset.vue';
import EpGeneerinenAsteikko from '@/components/EpGeneerinenAsteikko/EpGeneerinenAsteikko.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { OsaalueStore } from '@/stores/OsaalueStore';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { findDeep } from 'deepdash/standalone';
import _ from 'lodash';
import { UiKielet } from '@shared/stores/kieli';
import { Koodistot } from '@shared/utils/koodi';
import { $t, $kaanna } from '@shared/utils/globals';
import { PerusteStore } from '@/stores/PerusteStore';

const props = defineProps<{
  arviointiStore: ArviointiStore;
  perusteStore: PerusteStore;
}>();

const route = useRoute();
const router = useRouter();
const store = ref<EditointiStore | null>(null);

const isNew = computed(() => {
  return osaalueId.value === 'uusi';
});

const tov = computed(() => {
  if (!store.value) {
    return null;
  }
  return store.value.data;
});

const arviointi = computed({
  get: () => store.value?.data.arviointi?.id || null,
  set: (id) => {
    store.value?.setData({
      ...store.value?.data,
      arviointi: { id },
    });
  },
});

const osaalueId = computed(() => {
  return route?.params?.osaalueId || null;
});

const arviointiasteikot = computed(() => {
  return props.arviointiStore.arviointiasteikot.value;
});

const kaikkiGeneeriset = computed(() => {
  return props.arviointiStore.geneeriset.value;
});

const navigation = computed(() => {
  return props.perusteStore.navigation.value;
});

const osaalueIdObject = computed(() => {
  return { id: _.toNumber(osaalueId.value) };
});

const osaalueNavigationNode = computed(() => {
  return _.get(findDeep(props.perusteStore.navigation.value, (value, key) => {
    if (_.keys(osaalueIdObject.value)[0] === key && _.values(osaalueIdObject.value)[0] === value) return true;
    return false;
  }), 'parent');
});

const tutkinnonOsaId = computed(() => {
  return _.get(osaalueNavigationNode.value, 'meta.tutkinnonOsaViite') || route.query.tutkinnonOsaId;
});

const kielet = computed(() => {
  return UiKielet;
});

const koodisto = new KoodistoSelectStore({
  koodisto: Koodistot.AMMATILLISENOPPIAINEET,
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

const kielikoodisto = new KoodistoSelectStore({
  koodisto: Koodistot.KIELIVALIKOIMA,
  async query(query: string, sivu = 0, koodisto: string) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

const onOsaAlueChange = async () => {
  if (!tutkinnonOsaId.value || !osaalueId.value) {
    return;
  }

  props.arviointiStore.fetchArviointiasteikot();
  props.arviointiStore.fetchGeneeriset();
  await props.perusteStore.blockUntilInitialized();
  const storeInstance = new OsaalueStore(
    Number(props.perusteStore.perusteId.value),
    Number(tutkinnonOsaId.value),
    osaalueId.value as string,
    router);
  store.value = new EditointiStore(storeInstance);
};

const poistaValinnaisetOsaamistavoitteet = () => {
  store.value!.setData({
    ...store.value!.data,
    valinnaisetOsaamistavoitteet: null,
  });
};

const lisaaValinnaisetOsaamistavoitteet = () => {
  store.value!.setData({
    ...store.value!.data,
    valinnaisetOsaamistavoitteet: {},
  });
};

// Watch for changes in osaalueId
watch(osaalueId, onOsaAlueChange, { immediate: true });
</script>

<style lang="scss" scoped>
  .kieli-select {
    width: 300px;
  }
</style>
