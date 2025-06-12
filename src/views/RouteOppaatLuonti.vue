<template>
  <EpMainView>
    <b-container>
      <EpSteps :steps="steps" :initial-step="0" :on-save="onSave" @cancel="onCancel">

        <template v-slot:pohja>

          <div class="row">
            <legend class="col-form-label col-sm-2">{{ $t('kayta-pohjana') }}</legend>
            <div class="col-sm-10 mb-4">
              <b-form-group class="mt-0 pt-0">
                <b-form-radio class="p-2" v-model="tyyppi" value="oppaasta" name="tyyppi" :disabled="!oppaat || oppaat.length === 0">{{ $t('toinen-opas') }}</b-form-radio>
                <div v-if="tyyppi === 'oppaasta'" class="ml-2">
                  <EpMultiSelect
                    v-if="oppaat"
                    v-model="data.pohja"
                    :placeholder="$t('valitse-opas')"
                    :is-editing="true"
                    :options="oppaat">
                    <template #singleLabel="{ option }">
                      {{ option.nimi }}
                    </template>
                    <template #option="{ option }">
                      {{ option.nimi }}
                    </template>
                  </EpMultiSelect>
                  <EpSpinner v-else />
                </div>

                <b-form-radio class="mt-3 p-2" v-model="tyyppi" value="uusi" name="tyyppi">{{ $t('luo-uusi') }}</b-form-radio>

              </b-form-group>
            </div>
          </div>
        </template>

        <template v-slot:tiedot>

          <b-form-group :label="$t('oppaan-nimi') + ' *'" required class="pl-0">
            <ep-input v-model="data.lokalisoituNimi" :is-editing="true" :placeholder="$t('kirjoita-oppaan-nimi')"
                :validation="v$.data.lokalisoituNimi" />
          </b-form-group>

          <b-form-group :label="$t('opastyoryhma') + ' *'" required class="pl-0">
            <EpMultiSelect v-model="data.tyoryhma"
                           v-if="tyoryhmat"
                           :placeholder="$t('valitse-tyoryhma')"
                           :search-identity="tyoryhmaSearchIdentity"
                           :is-editing="true"
                           :options="tyoryhmat">
              <template #singleLabel="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
              <template #option="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
            </EpMultiSelect>
            <EpSpinner v-else />
          </b-form-group>

          <b-form-group :label="$t('koulutus-tutkintotyyppi')" required class="pl-0">

            <div class="row" v-for="(koulutustyyppi, index) in data.koulutustyypit" :key="'koulutustyyppi'+index">
              <koulutustyyppi-select
                v-model="data.koulutustyypit[index]"
                :isEditing="true"
                :koulutustyypit="koulutustyyppiOptions"
                required class="mb-2 col-11"/>
              <div class="col-1">
                <ep-button v-if="index > 0"
                           buttonClass="p-0 pt-2 roskalaatikko"
                           variant="link"
                           icon="delete"
                           @click="poistaKoulutustyyppi(index)"/>
              </div>
            </div>
            <ep-button buttonClass="pl-0" variant="outline-primary" icon="add" @click="lisaaKoulutustyyppi">
              {{$t('lisaa-koulutus-tutkintotyyppi')}}
            </ep-button>
          </b-form-group>

          <b-form-group :label="$t('peruste')" required class="pl-0">
            <EpMultiListSelect v-model="data.perusteet"
                           :is-editing="true"
                           :items="perusteet"
                           :required="true">
              <template #lisaaTeksti>
                {{$t('lisaa-peruste')}}
              </template>
            </EpMultiListSelect>
          </b-form-group>

        </template>

        <template #luo>
          {{$t('luo-opas')}}
        </template>
      </EpSteps>
    </b-container>
  </EpMainView>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpMultiListSelect, { MultiListSelectItem } from '@shared/components/forms/EpMultiListSelect.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSteps from '@shared/components/EpSteps/EpSteps.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { OppaatStore } from '@/stores/OppaatStore';
import * as _ from 'lodash';
import { themes, koulutustyyppiRyhmaSort, EperusteetKoulutustyypit } from '@shared/utils/perusteet';
import { requiredOneLang } from '../../eperusteet-frontend-utils/vue/src/validators/required';
import { Kielet } from '../../eperusteet-frontend-utils/vue/src/stores/kieli';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import { $t, $kaanna } from '@shared/utils/globals';
import { useRouter } from 'vue-router';

const props = defineProps<{
  perusteprojektiStore: PerusteprojektiStore;
  ulkopuolisetStore: UlkopuolisetStore;
  oppaatStore: OppaatStore;
}>();

const router = useRouter();

const data = ref<any>({
  koulutustyypit: [null],
});
const tyyppi = ref<'oppaasta' | 'uusi'>('uusi');
const currentStep = ref<string | null>(null);

onMounted(async () => {
  await Promise.all([
    props.ulkopuolisetStore.fetchTyoryhmat(),
    props.oppaatStore.updateQuery(),
    props.perusteprojektiStore.fetchPohjaProjektit(),
  ]);
});

watch(tyyppi, () => {
  data.value = {
    ...data.value,
    pohja: null,
    koulutustyypit: [
      null,
    ],
  };
});

const rules = {
  data: {
    lokalisoituNimi: requiredOneLang(),
  }
};

const v$ = useVuelidate(rules, { data });

const koulutustyyppiOptions = computed(() => {
  return [...EperusteetKoulutustyypit, 'koulutustyyppi_muu'];
});

const oppaat = computed(() => {
  return props.oppaatStore.oppaat.value;
});

const steps = computed(() => {
  return [{
    key: 'pohja',
    name: $t('pohjan-valinta'),
    isValid() {
      return !(tyyppi.value === 'oppaasta' && !data.value.pohja);
    },
  }, {
    key: 'tiedot',
    name: $t('oppaan-tiedot'),
    isValid() {
      return !v$.value.$invalid && !_.isEmpty(data.value.tyoryhma);
    },
  }];
});

const stepChange = (step) => {
  currentStep.value = step;
};

const tyoryhmaSearchIdentity = (tr: any) => {
  return _.toLower($kaanna(tr.nimi));
};

const ktToRyhma = (koulutustyyppi) => {
  return themes[koulutustyyppi];
};

const tyoryhmat = computed(() => {
  return _.sortBy(props.ulkopuolisetStore.tyoryhmat.value, tyoryhmaSearchIdentity);
});

const koulutustyypit = computed(() => {
  return _.chain(EperusteetKoulutustyypit)
    .map(koulutustyyppi => {
      return {
        value: koulutustyyppi,
        text: $t(koulutustyyppi),
      } as MultiListSelectItem;
    })
    .sortBy(item => koulutustyyppiRyhmaSort[ktToRyhma(item.value)])
    .value();
});

const perusteet = computed(() => {
  return _.chain(props.perusteprojektiStore.perusteet.value)
    .map(peruste => {
      return {
        value: peruste,
        text: $kaanna((peruste as any).nimi),
      } as MultiListSelectItem;
    })
    .sortBy(peruste => _.toLower(peruste.text))
    .value();
});

const onSave = async () => {
  const luotu = await props.oppaatStore.saveOpas({
    nimi: data.value.lokalisoituNimi[Kielet.getSisaltoKieli.value],
    lokalisoituNimi: data.value.lokalisoituNimi,
    ryhmaOid: data.value.tyoryhma.oid,
    oppaanKoulutustyypit: _.filter(data.value.koulutustyypit, koulutustyyppi => koulutustyyppi !== null),
    oppaanPerusteet: data.value.perusteet,
    pohjaId: data.value.pohja?.peruste.id,
  });
  router.push({
    name: 'opas',
    params: {
      projektiId: '' + luotu.id,
    },
  });
};

const onCancel = () => {
  router.push({
    name: 'oppaat',
  });
};

const lisaaKoulutustyyppi = () => {
  data.value.koulutustyypit = [
    ...data.value.koulutustyypit,
    null,
  ];
};

const poistaKoulutustyyppi = (index) => {
  data.value.koulutustyypit = _.filter(data.value.koulutustyypit, (val, valIndex) => index !== valIndex);
};
</script>

<style lang="scss" scoped>
.tieto {
  padding: 20px;

  .nimi {
    font-weight: 600;
  }
}
</style>
