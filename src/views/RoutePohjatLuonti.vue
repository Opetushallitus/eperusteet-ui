<template>
  <EpMainView container>
    <div class="w-full">
      <EpSteps
        :steps="steps"
        :initial-step="0"
        :on-save="onSave"
        @cancel="onCancel"
      >
        <template #pohja>
          <div class="flex flex-wrap gap-4">
            <legend class="sm:w-1/6 mb-2">
              {{ $t('kayta-pohjana') }}
            </legend>
            <div class="sm:w-5/6 mb-4">
              <EpFormGroup class="mt-0 pt-0">
                <EpRadio
                  v-model="tyyppi"
                  class="p-2"
                  value="pohjasta"
                  name="tyyppi"
                  :disabled="!pohjat || pohjat.length === 0"
                >
                  {{ $t('toista-pohjaa') }}
                </EpRadio>
                <div
                  v-if="tyyppi === 'pohjasta'"
                  class="ml-2"
                >
                  <EpMultiSelect
                    v-if="pohjat"
                    v-model="data.pohja"
                    :placeholder="$t('valitse-pohja')"
                    :is-editing="true"
                    :options="pohjat"
                  >
                    <template #singleLabel="{ option }">
                      {{ option.nimi }}
                    </template>
                    <template #option="{ option }">
                      {{ option.nimi }}
                    </template>
                  </EpMultiSelect>
                  <EpSpinner v-else />
                </div>

                <EpRadio
                  v-model="tyyppi"
                  class="mt-3 p-2"
                  value="uusi"
                  name="tyyppi"
                >
                  {{ $t('luo-uusi-perustepohja') }}
                </EpRadio>
              </EpFormGroup>
            </div>
          </div>
        </template>

        <template #tiedot>
          <EpFormGroup
            :label="$t('projektin-nimi-label')"
            required
            class="pl-0"
          >
            <ep-input
              v-model="data.nimi"
              :is-editing="true"
              :placeholder="$t('kirjoita-projektin-nimi')"
              :validation="$v.data.nimi"
            />
          </EpFormGroup>

          <EpFormGroup
            id="perustetyoryhma"
            :label="$t('perustetyoryhma')"
            required
            class="pl-0"
          >
            <EpMultiSelect
              v-if="tyoryhmat"
              v-model="data.tyoryhma"
              :placeholder="$t('valitse')"
              :search-identity="tyoryhmaSearchIdentity"
              :is-editing="true"
              :options="tyoryhmat"
            >
              <template #singleLabel="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
              <template #option="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
            </EpMultiSelect>
            <EpSpinner v-else />
          </EpFormGroup>

          <EpFormGroup
            id="koulutustutkintotyyppi"
            :label="$t('koulutus-tutkintotyyppi')" required>
            required
          >
            <koulutustyyppi-select
              v-model="data.koulutustyyppi"
              :is-editing="true"
              required
              :ei-tuetut-koulutustyypit="eiTuetutKoulutustyypit"
            />
          </EpFormGroup>
        </template>

        <template #luo>
          {{ $t('luo-perustepohja') }}
        </template>
      </EpSteps>
    </div>
  </EpMainView>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpMultiListSelect from '@shared/components/forms/EpMultiListSelect.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSteps from '@shared/components/EpSteps/EpSteps.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { PerusteprojektiLuontiDtoTyyppiEnum } from '@shared/api/eperusteet';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { OmatPerusteetStore } from '@/stores/OmatPerusteetStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import * as _ from 'lodash';
import { themes, koulutustyyppiRyhmaSort, EperusteetKoulutustyypit } from '@shared/utils/perusteet';
import { useVuelidate } from '@vuelidate/core';
import { requiredOneLang } from '../../eperusteet-frontend-utils/vue/src/validators/required';
import { Kielet } from '../../eperusteet-frontend-utils/vue/src/stores/kieli';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import { EiTuetutKoulutustyypit, isKoulutustyyppiSupported } from '@/utils/perusteet';
import { $t, $kaanna, $kaannaOlioTaiTeksti, $fail } from '@shared/utils/globals';
import EpRadio from '@shared/components/forms/EpRadio.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';

const props = defineProps<{
  pohjatStore: OmatPerusteetStore;
  ulkopuolisetStore: UlkopuolisetStore;
  perusteprojektiStore: PerusteprojektiStore;
}>();

const router = useRouter();
const data = ref<any>({});
const tyyppi = ref<'pohjasta' | 'uusi'>('uusi');
const currentStep = ref<string | null>(null);

// Computed properties
const pohjat = computed(() => {
  return _.map(props.pohjatStore.projects.value?.data, pohja => {
    return {
      ...pohja,
      $isDisabled: !isKoulutustyyppiSupported(pohja.koulutustyyppi),
    };
  });
});

const rules = {
  data: {
    nimi: requiredOneLang(),
  },
};

const $v = useVuelidate(rules, { data });

const steps = computed(() => {
  return [{
    key: 'pohja',
    name: $t('pohjan-valinta'),
    isValid() {
      return !(tyyppi.value === 'pohjasta' && !data.value.pohja);
    },
  }, {
    key: 'tiedot',
    name: $t('projektin-tiedot'),
    isValid() {
      return !$v.value.$invalid && !_.isEmpty(data.value.koulutustyyppi);
    },
  }];
});

const tyoryhmat = computed(() => {
  return _.sortBy(props.ulkopuolisetStore.tyoryhmat.value, tyoryhmaSearchIdentity);
});

const vaihtoehdotKoulutustyypit = computed(() => {
  return _.sortBy(EperusteetKoulutustyypit, x => koulutustyyppiRyhmaSort[ktToRyhma(x)]);
});

const eiTuetutKoulutustyypit = computed(() => {
  return EiTuetutKoulutustyypit;
});

// Methods
function stepChange(step) {
  currentStep.value = step;
}

function tyoryhmaSearchIdentity(tr: any) {
  return _.toLower($kaanna(tr.nimi));
}

function koulutustyyppiSearchIdentity(kt) {
  return _.toLower($kaannaOlioTaiTeksti(kt));
}

function ktToRyhma(koulutustyyppi) {
  return themes[koulutustyyppi];
}

async function onSave() {
  try {
    const luotu = await props.perusteprojektiStore.addPerusteprojektiPohja({
      nimi: data.value.nimi[Kielet.getSisaltoKieli.value],
      ryhmaOid: data.value.tyoryhma ? data.value.tyoryhma.oid : undefined,
      koulutustyyppi: data.value.koulutustyyppi,
      perusteId: data.value.pohja?.peruste.id,
      tyyppi: PerusteprojektiLuontiDtoTyyppiEnum.POHJA,
    });
    router.push({
      name: 'perusteprojekti',
      params: {
        projektiId: '' + luotu.id,
      },
    });
  }
  catch (e) {
    $fail($t('virhe-palvelu-virhe') as string);
  }
}

function onCancel() {
  router.push({
    name: 'pohjat',
  });
}

// Watchers
watch(tyyppi, () => {
  data.value = {
    ...data.value,
    pohja: null,
  };
});

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    props.ulkopuolisetStore.fetchTyoryhmat(),
    props.pohjatStore.updateQuery({}),
  ]);
});
</script>

<style lang="scss" scoped>

.tieto {
  padding: 20px;

  .nimi {
    font-weight: 600;
  }
}

</style>
