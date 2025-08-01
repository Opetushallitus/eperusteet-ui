<template>
  <EpMainView>
    <b-container>
      <EpSteps
        ref="epsteps"
        :steps="steps"
        :initial-step="0"
        :on-save="onSave"
        @cancel="onCancel"
        @stepChange="onStepChange"
      >
        <template #pohja>
          <div class="mb-5">
            {{ $t('digitaalinen-osaaminen-luonti-selite') }}
          </div>

          <div class="row">
            <div class="col-sm-10 mb-4">
              <b-form-group
                class="mt-0"
                :label="$t('kayta-pohjana') + ' *'"
              >
                <b-form-radio
                  v-model="tyyppi"
                  value="perusteesta"
                  name="tyyppi"
                  :disabled="!perusteet || perusteet.length === 0"
                >
                  {{ $t('toinen-projekti') }}
                </b-form-radio>
                <div v-if="tyyppi === 'perusteesta'">
                  <EpMultiSelect
                    v-if="perusteet"
                    :value="data.peruste"
                    :placeholder="$t('valitse-peruste')"
                    :is-editing="true"
                    :search-identity="nimiSearchIdentity"
                    :options="perusteet"
                    class="perustevalinta mb-2 mt-2"
                    @input="valitsePeruste($event)"
                  >
                    <template #singleLabel="{ option }">
                      {{ $kaanna(option.nimi) }}
                      <span
                        v-if="option.voimassaoloAlkaa || option.voimassaoloLoppuu"
                        class="ml-3 voimassaolo"
                      >
                        (<span v-if="option.voimassaoloAlkaa">{{ $sd(option.voimassaoloAlkaa) }}</span>-<span v-if="option.voimassaoloLoppuu">{{ $sd(option.voimassaoloLoppuu) }}</span>)
                      </span>
                    </template>
                    <template #option="{ option }">
                      {{ $kaanna(option.nimi) }}
                      <span
                        v-if="option.voimassaoloAlkaa || option.voimassaoloLoppuu"
                        class="ml-3 voimassaolo"
                      >
                        (<span v-if="option.voimassaoloAlkaa">{{ $sd(option.voimassaoloAlkaa) }}</span> - <span v-if="option.voimassaoloLoppuu">{{ $sd(option.voimassaoloLoppuu) }}</span>)
                      </span>
                    </template>
                  </EpMultiSelect>
                  <EpSpinner v-else />
                </div>
              </b-form-group>

              <b-form-radio
                v-model="tyyppi"
                class="mb-4"
                value="uusi"
                name="tyyppi"
              >
                {{ $t('luo-uusi') }}
              </b-form-radio>
              <b-form-group
                v-if="tyyppi"
                :label="$t('projektin-nimi') + '*'"
                required
              >
                <ep-input
                  v-model="data.nimi"
                  type="string"
                  :is-editing="true"
                  :placeholder="$t('kirjoita-projektin-nimi')"
                  :validation="v$.data.nimi"
                />
              </b-form-group>
            </div>
          </div>
        </template>

        <template #luo>
          {{ $t('luo-perusteprojekti') }}
        </template>
      </EpSteps>
    </b-container>
  </EpMainView>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSteps, { Step } from '@shared/components/EpSteps/EpSteps.vue';
import { PerusteprojektiLuontiDtoTyyppiEnum } from '@shared/api/eperusteet';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import * as _ from 'lodash';
import { notNull } from '@shared/validators/required';
import { $t, $kaanna, $sd } from '@shared/utils/globals';


const props = defineProps<{
  perusteprojektiStore: PerusteprojektiStore;
}>();

const data = ref({
  nimi: null as string | null,
  peruste: null as any,
});

const currentStep = ref<Step | null>(null);
const tyyppi = ref<'perusteesta' | 'uusi' | null>(null);
const router = useRouter();

onMounted(async () => {
  await props.perusteprojektiStore.fetchPohjaDigitaalisetOsaamiset();
});

watch(() => tyyppi.value, () => {
  data.value = {
    ...data.value,
    peruste: null,
  };
});

const perusteet = computed(() => {
  if (props.perusteprojektiStore.perusteet.value) {
    return _.sortBy(props.perusteprojektiStore.perusteet.value, peruste => _.toLower($kaanna(peruste.nimi!)));
  }
  return undefined;
});

const steps = computed(() => {
  return [{
    key: 'pohja',
    name: $t('uusi-projekti'),
    isValid() {
      if (_.isEmpty(data.value.nimi)) {
        return false;
      }

      if (tyyppi.value === 'perusteesta' && !data.value.peruste) {
        return false;
      }

      return true;
    },
  }];
});

const valitsePeruste = (event: any) => {
  data.value.peruste = event;
};

const nimiSearchIdentity = (obj: any) => {
  return _.toLower($kaanna(obj.nimi));
};

const onSave = async () => {
  let luotu;
  const projekti = {
    nimi: data.value.nimi,
    perusteId: data.value.peruste?.id,
    tyyppi: PerusteprojektiLuontiDtoTyyppiEnum.DIGITAALINENOSAAMINEN,
  };

  luotu = await props.perusteprojektiStore.addPerusteprojekti(projekti);

  router.push({
    name: 'perusteprojekti',
    params: {
      projektiId: '' + luotu.id,
    },
  });
};

const onCancel = () => {
  router.push({
    name: 'digitaalisetosaamiset',
  });
};

const onStepChange = (step: Step) => {
  currentStep.value = step;
};

const validator = computed(() => {
  if (currentStep.value && currentStep.value.key === 'pohja') {
    return {
      data: {
        nimi: notNull(),
      },
    };
  }

  return {};
});

const v$ = useVuelidate(validator, { data });
</script>

<style lang="scss" scoped>
.tieto {
  padding: 20px 20px 20px 0px;

  .nimi {
    font-weight: 600;
  }
}

.perustevalinta {
  .voimassaolo {
    font-size: 0.9rem;
  }
}
</style>
