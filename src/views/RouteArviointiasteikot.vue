<template>
  <div class="mt-5">
    <div class="flex sm:items-center sm:justify-between flex-col sm:flex-row mb-1">
      <div class="flex">
        <h2 class="!m-0">
          {{ $t('arviointiasteikot') }}
        </h2>
        <EpInfoPopover class="ml-3">
          {{ $t('arviointiasteikot-muokkaus-huomio-teksti') }}
        </EpInfoPopover>
      </div>
      <div class="flex gap-4 items-center">
        <ep-button
          v-if="!isEditing"
          v-oikeustarkastelu="{oikeus:'hallinta'}"
          variant="link"
          icon="edit"
          @click="toggleEdit()"
        >
          {{ $t('muokkaa') }}
        </ep-button>
        <ep-button
          v-if="!isEditing"
          v-oikeustarkastelu="{oikeus:'hallinta', kohde:'pohja'}"
          variant="link"
          icon="add"
          @click="lisaaArviointiasteikko()"
        >
          {{ $t('lisaa-uusi') }}
        </ep-button>
        <ep-button
          v-if="isEditing"
          variant="link"
          @click="toggleEdit()"
        >
          {{ $t('peruuta') }}
        </ep-button>
        <ep-button
          v-if="isEditing"
          variant="primary"
          :show-spinner="isSaving"
          @click="saveArviointiAsteikko()"
        >
          {{ $t('tallenna') }}
        </ep-button>
      </div>
    </div>
    <div class="taso-wrapper">
      <template v-if="arviointiasteikot">
        <div
          v-for="(asteikko, idx) in arviointiasteikot"
          :key="asteikko.id"
          class="asteikko mt-4"
        >
          <span class="text-nowrap">
            <div class="flex align-text-top justify-between">
              <h3>{{ $t('arviointiasteikko') + ' ' + (idx+1) }}</h3>
              <ep-button
                v-if="isEditing"
                v-oikeustarkastelu="{oikeus:'hallinta', kohde:'pohja'}"
                variant="link"
                icon="delete"
                @click="poistaArviointiasteikko(asteikko)"
              >
                {{ $t('poista-arviointiasteikko') }}
              </ep-button>
            </div>

            <div>
              <div
                v-for="(taso, index) in asteikko.osaamistasot"
                :key="taso.id"
                class="taso py-2 text-wrap"
                :class="{ 'pl-3': !isEditing, 'is-editing': isEditing }"
              >
                <template v-if="!isEditing">
                  {{ $kaanna(taso.otsikko) }}
                </template>
                <div
                  v-else
                  class="flex w-full items-end"
                >
                  <EpFormGroup
                    class="w-1/2"
                    :label="$t('osaamistaso') + ' ' + (index + 1)"
                  >
                    <ep-input
                      v-model="taso.otsikko"
                      :name="$t('osaamistaso')"
                      :is-editing="true"
                    />
                  </EpFormGroup>

                  <EpFormGroup class="w-2/5 ml-3">
                    <ep-koodisto-select
                      v-model="taso.koodi"
                      :store="koodisto"
                      :is-editing="isEditing"
                      :nayta-arvo="true"
                    >
                      <template #default="{ open }">
                        <EpInputGroup :disabled="true">
                          <ep-input
                            :model-value="taso.koodi ? $kaanna(taso.koodi.nimi) : ''"
                            :is-editing="true"
                            disabled
                          />
                          <template #append>
                            <ep-button
                              variant="primary"
                              @click="open"
                            >
                              {{ $t('hae-koodistosta') }}
                            </ep-button>
                          </template>
                        </EpInputGroup>
                      </template>
                    </ep-koodisto-select>
                  </EpFormGroup>

                  <EpFormGroup>
                    <div
                      v-oikeustarkastelu="{oikeus:'hallinta', kohde:'pohja'}"
                      class="default-icon clickable mb-2 ml-4"
                      @click="poistaOsaamistaso(asteikko, taso)"
                    >
                      <EpMaterialIcon icon-shape="outlined">delete</EpMaterialIcon>
                    </div>
                  </EpFormGroup>
                </div>
              </div>
              <ep-button
                v-if="isEditing"
                v-oikeustarkastelu="{oikeus:'hallinta', kohde:'pohja'}"
                variant="outline"
                icon="add"
                @click="lisaaOsaamistaso(asteikko)"
              >
                {{ $t('lisaa-osaamistaso') }}
              </ep-button>
            </div>
          </span>
        </div>
      </template>
      <ep-spinner v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpJulkiLista from '@shared/components/EpJulkiLista/EpJulkiLista.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { ArviointiAsteikkoDto } from '@shared/api/eperusteet';
import { KoodistoSelectStore, getKoodistoSivutettuna } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import _ from 'lodash';
import VueScrollTo from 'vue-scrollto';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpInputGroup from '@shared/components/EpInputGroup/EpInputGroup.vue';
import { $t, $success, $fail, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  arviointiStore: ArviointiStore;
}>();

const isEditing = ref<boolean | null>(false);
const isSaving = ref(false);
const arviointiasteikot = ref<ArviointiAsteikkoDto[] | null>(null);

const koodisto = new KoodistoSelectStore({
  koodisto: 'arviointiasteikkoammatillinen15',
  async query(query: string, sivu = 0, koodisto: string) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const init = async () => {
  await props.arviointiStore.fetchArviointiasteikot();
  arviointiasteikot.value = props.arviointiStore.arviointiasteikot.value as ArviointiAsteikkoDto[];
};

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    init();
  }
};

const lisaaArviointiasteikko = () => {
  isEditing.value = true;
  arviointiasteikot.value = [
    ...(arviointiasteikot.value || []),
    {
      osaamistasot: [],
    },
  ];

  VueScrollTo.scrollTo('footer', {
    offset: 200,
    x: false,
    y: true,
  });
};

const poistaArviointiasteikko = (asteikko: any) => {
  arviointiasteikot.value = _.reject(arviointiasteikot.value, arviointiasteikko => arviointiasteikko === asteikko);
};

const poistaOsaamistaso = (asteikko: any, taso: any) => {
  arviointiasteikot.value = _.map(arviointiasteikot.value, arviointiasteikko => {
    return {
      ...arviointiasteikko,
      osaamistasot: (asteikko === arviointiasteikko ? _.filter(asteikko.osaamistasot, osaamistaso => osaamistaso !== taso) : arviointiasteikko.osaamistasot),
    };
  });
};

const lisaaOsaamistaso = (asteikko: any) => {
  asteikko.osaamistasot = [
    ...asteikko.osaamistasot,
    {},
  ];
};

const saveArviointiAsteikko = async () => {
  isSaving.value = true;

  const koodittomia = _.some(arviointiasteikot.value, arviointiasteikko => {
    return _.size(_.reject(arviointiasteikko.osaamistasot, 'koodi')) > 0;
  });

  if (koodittomia) {
    $fail($t('osaamistasolta-puuttuu-pakollinen-koodi') as string);
    isSaving.value = false;
    return;
  }

  try {
    await props.arviointiStore.updateArviointiasteikot(arviointiasteikot.value as ArviointiAsteikkoDto[]);
    isEditing.value = false;
    $success($t('arviointiasteikko-tallennettu-onnistuneesti') as string);
    await init();
  }
  catch (_err) {
    $fail($t('arviointiasteikon-tallennus-epaonnistui') as string);
  }
  finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  await init();
});
</script>

<style lang="scss">
@import "@shared/styles/_variables.scss";

.asteikko {
  padding: 18px;
  border-radius: 10px;
  border: 1px solid #eee;
  box-shadow: 3px 3px 10px #eee;
}

.taso-wrapper {
  min-height: 75vh;
}

.taso {
  &:nth-of-type(even):not(.is-editing) {
    background-color: $table-even-row-bg-color;
  }
  &:nth-of-type(odd):not(.is-editing) {
    background-color: $table-odd-row-bg-color;
  }
}

.form-group {
  margin: 0;
}
</style>
