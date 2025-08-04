<template>
  <div v-if="store">
    <EpEditointi
      :store="store"
      :versionumero="versionumero"
      :confirm-remove="true"
      :post-remove="postRemove"
      label-remove-confirm="vahvista-tekstikappaleen-poisto"
    >
      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.nimi) }}
        </h2>
      </template>
      <template #postHeader="{ data }">
        <span v-if="data.liite"><b>{{ $t('liite') }}. </b></span>
      </template>
      <template #default="{ data, isEditing, validation }">
        <div
          v-if="isEditing"
          class="mt-1 otsikko"
        >
          <div
            v-if="osaamisalat.length > 0 || tutkintonimikkeet.length > 0"
            class="mb-4"
          >
            <EpRadio
              v-if="osaamisalat.length > 0"
              v-model="tekstikappaleTyyppi"
              value="osaamisala"
              name="tekstikappaleTyyppi"
            >
            {{ $t('osaamisala') }}
            </EpRadio>
            <EpRadio
              v-if="tutkintonimikkeet.length > 0"
              v-model="tekstikappaleTyyppi"
              value="tutkintonimike"
              name="tekstikappaleTyyppi"
            >
            {{ $t('tutkintonimike') }}
            </EpRadio>
            <EpRadio
              v-model="tekstikappaleTyyppi"
              value="tekstikappale"
              name="tekstikappaleTyyppi"
            >
              {{ $t('tekstikappale') }}
            </EpRadio>
          </div>
          <div
            v-if="tekstikappaleTyyppi === 'osaamisala'"
            class="mb-4"
          >
            <div class="d-flex">
              <h3>{{ $t('osaamisala') }}</h3>
              <EpMaterialIcon
                v-b-popover="{content: $t('valintaa-kaytetaan-tekstikappaleen-otsikkona'), trigger: 'hover', placement: 'top', variant: 'primary'}"
                class="ml-2"
                icon-shape="outlined"
                size="20px"
              >
                info
              </EpMaterialIcon>
            </div>
            <EpMultiSelect
              v-model="data.osaamisala"
              :is-editing="true"
              :options="osaamisalat"
              :multiple="false"
              track-by="uri"
              class="multiselect"
            >
              <template #singleLabel="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
              <template #option="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
            </EpMultiSelect>
          </div>

          <div
            v-if="tekstikappaleTyyppi === 'tutkintonimike'"
            class="mb-4"
          >
            <div class="d-flex">
              <h3>{{ $t('tutkintonimike') }}</h3>
              <EpMaterialIcon
                v-b-popover="{content: $t('valintaa-kaytetaan-tekstikappaleen-otsikkona'), trigger: 'hover', placement: 'top', variant: 'primary'}"
                class="ml-2"
                icon-shape="outlined"
                size="20px"
              >
                info
              </EpMaterialIcon>
            </div>
            <EpMultiSelect
              v-model="data.tutkintonimike"
              :is-editing="true"
              :options="tutkintonimikkeet"
              :multiple="false"
              track-by="uri"
              class="multiselect"
            >
              <template #singleLabel="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
              <template #option="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
            </EpMultiSelect>
          </div>

          <div
            v-if="tekstikappaleTyyppi === 'tekstikappale'"
            class="mb-4"
          >
            <h3>{{ $t('otsikko') }}</h3>
            <ep-input
              v-model="data.nimi"
              :is-editing="true"
              :validation="validation.nimi"
              :disabled="!!data.osaamisala || !!data.tutkintonimike"
            />
          </div>
          <ep-toggle
            v-model="data.liite"
            class="mt-4"
          >
            {{ $t('nayta-tekstikappale-liitteena') }}
          </ep-toggle>
        </div>

        <div :class="{ 'mt-4': isEditing }">
          <EpContent
            v-model="data.teksti"
            layout="normal"
            :is-editable="isEditing"
            :kasite-handler="kasiteHandler"
            :kuva-handler="kuvaHandler"
          />
        </div>
      </template>
    </EpEditointi>
  </div>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import * as _ from 'lodash';
import { Murupolku } from '@shared/stores/murupolku';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna, $bvModal } from '@shared/utils/globals';
import EpRadio from '@shared/components/forms/EpRadio.vue';

interface koodistoryhma {
  ryhma: string;
  koodistot: string[];
}

const props = defineProps<{
  perusteStore: PerusteStore;
}>();

const route = useRoute();
const router = useRouter();

const store = ref<EditointiStore | null>(null);
const tekstikappaleTyyppi = ref<'osaamisala' | 'tutkintonimike' | 'tekstikappale' | null>(null);

const projektiId = computed(() => route.params.projektiId);
const tekstikappaleId = computed(() => route.params.tekstiKappaleId);
const perusteId = computed(() => props.perusteStore.perusteId.value);
const versionumero = computed(() => _.toNumber(route.query.versionumero) || undefined);

const osaamisalat = computed(() => {
  return props.perusteStore.peruste?.value?.osaamisalat || [];
});

const tutkintonimikkeet = computed(() => {
  return _.map(props.perusteStore.peruste?.value?.tutkintonimikkeet, tutkintonimike => {
    return {
      nimi: tutkintonimike.nimi,
      uri: tutkintonimike.tutkintonimikeUri,
      arvo: tutkintonimike.tutkintonimikeArvo,
      koodisto: 'tutkintonimikkeet',
      versio: null,
    };
  }) || [];
});

const tekstikappale = computed(() => {
  return store.value?.data || null;
});

const oldNimi = computed(() => {
  return store.value?.data?.originalNimi;
});

const kasiteHandler = computed(() => {
  return createKasiteHandler(new TermitStore(perusteId.value!));
});

const kuvaHandler = computed(() => {
  return createKuvaHandler(new KuvaStore(perusteId.value!));
});

const postRemove = computed(() => {
  return () => {
    router.push({
      name: 'poistetutsisallot',
    });
  };
});

const koodiNimikeChange = (val, oldVal) => {
  if (!val) {
    val = { nimi: oldNimi.value };
  }
  if (!_.isEqual(val, oldVal)) {
    store.value?.setData({
      ...store.value?.data,
      nimi: val.nimi,
    });
  }
};

const fetch = async () => {
  const tkstore = new TekstikappaleStore(perusteId.value!, Number(tekstikappaleId.value), versionumero.value);
  store.value = new EditointiStore(tkstore);
};

const tekstikappaleTyyppiInit = () => {
  if (store.value?.data.id) {
    if (store.value?.data?.tutkintonimike) {
      tekstikappaleTyyppi.value = 'tutkintonimike';
    }
    else if (store.value?.data?.osaamisala) {
      tekstikappaleTyyppi.value = 'osaamisala';
    }
    else {
      tekstikappaleTyyppi.value = 'tekstikappale';
    }
  }
};

const handleDropdownValueChange = (val, oldVal) => {
  if (val) {
    koodiNimikeChange(val, oldVal);
  }
  else {
    resetNimi();
  }
};

const resetNimi = () => {
  store.value?.setData({
    ...store.value?.data,
    nimi: null,
  });
};

const resetTutkintonimike = () => {
  store.value?.setData({
    ...store.value?.data,
    tutkintonimike: null,
  });
};

const resetOsaamisala = () => {
  store.value?.setData({
    ...store.value?.data,
    osaamisala: null,
  });
};

// Watchers
watch(() => store.value?.isEditing, () => {
  koodiNimikeChange(null, null);
  tekstikappaleTyyppiInit();
});

watch(versionumero, async () => {
  await fetch();
}, { immediate: true });

watch(tekstikappaleId, async (id: string, oldId: string) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

watch(tekstikappale, (tk) => {
  if (tk) {
    Murupolku.aseta('tekstikappale', $kaanna(tk.nimi), {
      name: 'tekstikappale',
    });
    if (!tekstikappaleTyyppi.value) {
      tekstikappaleTyyppiInit();
    }
  }
});

watch(tekstikappaleTyyppi, async () => {
  if (store.value?.isEditing) {
    resetTutkintonimike();
    resetOsaamisala();
    resetNimi();
  }
});

watch(() => store.value?.data?.osaamisala, (val, oldVal) => {
  handleDropdownValueChange(val, oldVal);
});

watch(() => store.value?.data?.tutkintonimike, (val, oldVal) => {
  handleDropdownValueChange(val, oldVal);
});
</script>

<style lang="scss" scoped>
  @import "@shared/styles/_variables.scss";

  .koodistoryhmat {
    margin-top: 50px;

    .koodistoryhma {
      margin-top: 30px;

      .koodistot {
        padding: 20px;
        border: 1px solid $gray-lighten-4;

        .koodisto {
          margin-bottom: 30px;

          .roskalaatikko {
            color: $paletti-blue;
            cursor: pointer;
            margin: 0 10px;
          }
        }
      }
    }
  }

  .otsikko {
    .multiselect {
      :deep(.multiselect__content-wrapper) {
        width: 100%;
      }
    }
  }
</style>
