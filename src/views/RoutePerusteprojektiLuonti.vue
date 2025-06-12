<template>
  <EpMainView>
    <b-container>
      <EpSteps ref="epsteps" :steps="steps" :initial-step="0" :on-save="onSave" @cancel="onCancel" @stepChange="onStepChange">
        <template v-slot:pohja>
          <div class="row">
            <legend class="col-form-label col-sm-2">{{ $t('kayta-pohjana') }}</legend>
            <div class="col-sm-10 mb-4">
              <EpRadio v-model="tyyppi" class="p-2" value="pohjasta" :disabled="!pohjat || pohjat.length === 0">
                {{ $t('perustepohjaa') }} <EpSpinner v-if="!pohjat" small/>
              </EpRadio>
              <div v-if="tyyppi === 'pohjasta'">
                <EpMultiSelect
                  v-if="pohjat"
                  :model-value="data.peruste"
                  @update:modelValue="valitsePeruste($event)"
                  :placeholder="$t('valitse-pohja')"
                  :is-editing="true"
                  :search-identity="nimiSearchIdentity"
                  :options="pohjat">
                  <template #singleLabel="{ option }">
                    {{ $kaanna(option.nimi) }}
                  </template>
                  <template #option="{ option }">
                    {{ $kaanna(option.nimi) }}
                  </template>
                </EpMultiSelect>
              </div>

              <EpRadio v-model="tyyppi" class="mt-3 p-2" value="perusteesta" :disabled="!perusteet || perusteet.length === 0">
                <div class="d-flex">
                  <div>{{ $t('toista-perusteprojektia') }}</div>
                  <EpInfoPopover class="ml-2">
                    {{$t('vain-ammatilliset-tutkinnot')}}
                  </EpInfoPopover>
                  <EpSpinner v-if="!perusteet" small/>
                </div>
              </EpRadio>

              <div v-if="tyyppi === 'perusteesta'">
                <EpMultiSelect
                  v-if="perusteet"
                  :model-value="data.peruste"
                  @update:modelValue="valitsePeruste($event)"
                  :placeholder="$t('valitse-peruste')"
                  :is-editing="true"
                  :search-identity="nimiSearchIdentity"
                  :options="perusteet"
                  class="perustevalinta">
                  <template #singleLabel="{ option }">
                    {{ $kaanna(option.nimi) }}
                    <span class="ml-3 voimassaolo" v-if="option.voimassaoloAlkaa || option.voimassaoloLoppuu">
                      (<span v-if="option.voimassaoloAlkaa">{{$sd(option.voimassaoloAlkaa)}}</span>-<span v-if="option.voimassaoloLoppuu">{{$sd(option.voimassaoloLoppuu)}}</span>)
                    </span>
                  </template>
                  <template #option="{ option }">
                    {{ $kaanna(option.nimi) }}
                    <span class="ml-3 voimassaolo" v-if="option.voimassaoloAlkaa || option.voimassaoloLoppuu">
                      (<span v-if="option.voimassaoloAlkaa">{{$sd(option.voimassaoloAlkaa)}}</span> - <span v-if="option.voimassaoloLoppuu">{{$sd(option.voimassaoloLoppuu)}}</span>)
                    </span>
                  </template>
                </EpMultiSelect>
              </div>

              <EpRadio v-model="tyyppi" value="uusi" class="mt-3 p-2">
                {{ $t('luo-uusi-ilman-pohjaa') }}
              </EpRadio>

              <template v-if="$isAdmin()">
                <EpRadio v-model="tyyppi" value="tiedostosta" class="mt-3 p-2">
                  {{ $t('tuo-tiedostosta') }}
                </EpRadio>
                <div v-if="tyyppi === 'tiedostosta'">
                  <ep-tiedosto-lataus :fileTypes="['application/json']" v-model="data.tiedosto" />
                </div>
              </template>
            </div>
          </div>
        </template>

        <template v-slot:tiedot>
          <b-form-group :label="$t('projektin-nimi') + '*'" required>
            <ep-input v-model="data.nimi" type="string" :is-editing="true" :placeholder="$t('kirjoita-projektin-nimi')" :validation="$v.data.nimi"/>
          </b-form-group>

          <b-form-group>
            <template #label>
              <div class="d-flex">
                <h4>{{$t('projektin-diaarinumero')}}</h4>
                <EpInfoPopover class="ml-2">{{ $t('diaarinumeron-muoto') }}</EpInfoPopover>
              </div>
            </template>
            <ep-input v-model="data.diaarinumero" type="string" :is-editing="true" :placeholder="$t('kirjoita-projektin-diaarinumero')" :validation="$v.data.diaarinumero"/>
          </b-form-group>

          <b-form-group :label="$t('projektin-kuvaus')" required>
            <EpRadio v-model="data.projektiKuvaus" class="ml-1" :value="kuvaus.uudistus">
              {{ $t('perusteen-uudistaminen-kuvaus') }}
            </EpRadio>
            <EpRadio v-model="data.projektiKuvaus" class="ml-1" :value="kuvaus.korjaus">
              {{ $t('perusteen-korjaus-kuvaus') }}
            </EpRadio>
            <ep-input class="mt-1" v-model="data.kuvaus" type="localized" :is-editing="true" :placeholder="$t('projektin-vapaamuotoinen-kuvaus')" />
          </b-form-group>

          <b-form-group :label="$t('koulutus-tutkintotyyppi') + '*'" required>
            <koulutustyyppi-select v-model="data.koulutustyyppi" :isEditing="true" required :eiTuetutKoulutustyypit="eiTuetutKoulutustyypit"/>
          </b-form-group>

          <b-form-group :label="$t('perustetyoryhma')" required>
            <EpMultiSelect v-model="data.tyoryhma"
                           v-if="tyoryhmat"
                           :search-identity="nimiSearchIdentity"
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

          <b-form-group :label="$t('yhteyshenkilo')" required>
            <ep-input v-model="data.yhteyshenkilo" type="string" :is-editing="true" :placeholder="$t('kirjoita-yhteyshenkilon-nimi')" />
          </b-form-group>
        </template>

        <template v-slot:aikataulu>
          <EpAikataulu :aikataulut="tapahtumat">
            <template #luomispaiva-topic>
              <span v-html="$t('projektin-luomispaiva')"></span>
            </template>
            <template #julkaisupaiva-topic>
              <span v-html="$t('peruste-astuu-voimaan')"></span>
            </template>
          </EpAikataulu>

          <b-form-group
            v-for="paatavoite in data.paatavoitteet"
            :key="'paatavoite'+paatavoite.tapahtuma"
            :label="$kaanna(paatavoite.tavoite)"
            class="col-md-4 col-12">
            <ep-datepicker v-model="paatavoite.tapahtumapaiva" class="mb-2" :isEditing="true"/>
            <ep-toggle v-model="paatavoite.julkinen" v-if="isAmmatillinen" class="mb-2">
              {{$t('julkinen')}}
            </ep-toggle>
          </b-form-group>

          <div v-for="(tpvm, idx) in data.tavoitepaivamaarat" :key="idx" class="row p-0 m-0" >
            <b-form-group :label="$t('tavoitteen-pvm')" class="col-md-4 col-12">
              <ep-datepicker v-model="tpvm.tapahtumapaiva" class="mb-2" :isEditing="true" :validation="$v.data.tavoitepaivamaarat[idx].tapahtumapaiva"/>
              <ep-toggle v-model="tpvm.julkinen" v-if="isAmmatillinen" class="mb-2">
                {{$t('julkinen')}}
              </ep-toggle>
            </b-form-group>
            <b-form-group :label="$t('tavoitteen-nimi-kuvaus') + '*'" class="col-md-7 col-11">
              <ep-input v-model="tpvm.tavoite" type="localized" :is-editing="true" :placeholder="$t('kirjoita-tavoite-nimi-kuvaus')" :validation="$v.data.tavoitepaivamaarat[idx].tavoite" />
            </b-form-group>
            <b-form-group class="col-1 col-sm-1 text-center">
              <template v-slot:label><br/></template>
              <ep-button @click="poistaTavoite(tpvm)" variant="link" icon="delete"></ep-button>
            </b-form-group>
          </div>
          <ep-button variant="outline" icon="add" @click="lisaaTavoite()">
            {{ $t('lisaa-tavoite') }}
          </ep-button>

        </template>

        <template v-slot:yhteenveto>
          <div class="d-flex">
            <div class="tieto w-50">
              <div class="nimi">
                {{ $t('projektin-nimi') }}
              </div>
              {{ data.nimi }}
            </div>
            <div class="tieto w-50">
              <div class="nimi">
                {{ $t('koulutus-tutkintotyyppi') }}
              </div>
              <span class="text-nowrap">
                <EpColorIndicator :kind="data.koulutustyyppi" />
                <span class="ml-2">{{ $t(data.koulutustyyppi) }}</span>
              </span>
            </div>
          </div>
          <div class="d-flex">
            <div class="tieto w-50">
              <div class="nimi">
                {{ $t('kuvaus') }}
              </div>
              <div v-if="data.projektiKuvaus === kuvaus.korjaus">
                {{ $t('perusteen-korjaus') }}
              </div>
              <div v-else-if="data.projektiKuvaus === kuvaus.uudistus">
                {{ $t('perusteen-uudistus') }}
              </div>
              <ep-input type="localized" :model-value="data.kuvaus" />
            </div>
            <div class="tieto w-50">
              <div>
                <div class="mb-5" v-if="data.tyoryhma">
                  <div class="nimi">
                    {{ $t('perustetyoryhma') }}
                  </div>
                  {{ $kaanna(data.tyoryhma.nimi) }}
                </div>
                <div class="nimi">
                  {{ $t('yhteyshenkilo') }}
                </div>
                {{ data.yhteyshenkilo }}
              </div>
            </div>
          </div>
          <div class="d-flex">
            <div class="tieto w-100">
              <div class="nimi">
                {{ $t('aikataulu') }}
              </div>
              <EpAikataulu :aikataulut="tapahtumat">
                <template #luomispaiva-topic>
                  <span v-html="$t('projektin-luomispaiva')"></span>
                </template>
                <template #julkaisupaiva-topic>
                  <span v-html="$t('peruste-astuu-voimaan')"></span>
                </template>
              </EpAikataulu>
            </div>
          </div>
        </template>

        <template v-slot:luo>
          {{$t('luo-perusteprojekti')}}
        </template>

      </EpSteps>
    </b-container>
  </EpMainView>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpRadio from '@shared/components/forms/EpRadio.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSteps, { Step } from '@shared/components/EpSteps/EpSteps.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpTiedostoLataus from '@shared/components/EpTiedosto/EpTiedostoLataus.vue';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import { MaaraysDtoTilaEnum, MaaraysDtoTyyppiEnum, PerusteAikatauluDtoTapahtumaEnum, PerusteprojektiLuontiKuvausEnum } from '@shared/api/eperusteet';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { isLukiokoulutus, EiTuetutKoulutustyypit, isKoulutustyyppiSupported } from '@/utils/perusteet';
import { EperusteetKoulutustyypit, isKoulutustyyppiAmmatillinen } from '@shared/utils/perusteet';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { notNull } from '@shared/validators/required';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import { MaarayksetEditStore } from '@/stores/MaarayksetEditStore';
import { useVuelidate } from '@vuelidate/core';
import { $t, $kaanna, $sd, $kaannaOlioTaiTeksti } from '@shared/utils/globals';
import { helpers } from '@vuelidate/validators';

const props = defineProps<{
  perusteprojektiStore: PerusteprojektiStore;
  ulkopuolisetStore: UlkopuolisetStore;
}>();

const router = useRouter();
const route = useRoute();

const data = ref<any>({
  nimi: null,
  voimassaoloAlkaa: null,
  tavoitepaivamaarat: [] as any[],
  paatavoitteet: [] as any[],
  koulutustyyppi: null,
  tyoryhma: null,
  peruste: null,
  kuvaus: null,
  projektiKuvaus: null,
});

const tyyppi = ref<'pohjasta' | 'perusteesta' | 'tiedostosta' | 'uusi'>('uusi');
const currentStep = ref<Step | null>(null);
const epsteps = ref<any>(null);

// Validation rules
const validator = computed(() => {
  if (currentStep.value && currentStep.value.key === 'tiedot') {
    return {
      data: {
        nimi: notNull(),
        koulutustyyppi: notNull(),
      },
    };
  }

  if (currentStep.value && currentStep.value.key === 'aikataulu') {
    return {
      data: {
        tavoitepaivamaarat: [{
          tapahtumapaiva: notNull(),
          tavoite: {
            [Kielet.getSisaltoKieli.value]: notNull(),
          },
        }],
      },
    };
  }

  return {};
});

const $v = useVuelidate(validator, { data });

// Lifecycle hooks
onMounted(async () => {
  tyyppi.value = 'uusi';
  await nextTick();
  props.ulkopuolisetStore.fetchTyoryhmat();
  await Promise.all([
    props.perusteprojektiStore.fetchPohjat(),
    props.perusteprojektiStore.fetchPohjaProjektit(),
  ]);

  data.value.paatavoitteet = defaultPaatavoitteet.value;
});

// Watchers
watch(() => tyyppi.value, () => {
  data.value = {
    ...data.value,
    tiedosto: null,
    peruste: null,
    koulutustyyppi: null,
  };
});

// Computed properties
const pohjat = computed(() => {
  if (props.perusteprojektiStore.pohjat.value) {
    return _.sortBy(setIsDisabled(props.perusteprojektiStore.pohjat.value), pohja => _.toLower($kaanna(pohja.nimi!)));
  }
  return [];
});

const perusteet = computed(() => {
  if (props.perusteprojektiStore.perusteet.value) {
    let ammatilliset = _.filter(props.perusteprojektiStore.perusteet.value, peruste => isKoulutustyyppiAmmatillinen(peruste.koulutustyyppi!));
    return _.sortBy(ammatilliset, peruste => _.toLower($kaanna(peruste.nimi!)));
  }
  return [];
});

const tyoryhmat = computed(() => {
  return _.sortBy(props.ulkopuolisetStore.tyoryhmat.value, nimiSearchIdentity);
});

const vaihtoehdotKoulutustyypit = computed(() => {
  return _.sortBy(EperusteetKoulutustyypit, x => $t(x));
});

const tapahtumat = computed(() => {
  return _.chain([{
    tapahtuma: 'luominen',
    tavoite: { [Kielet.getSisaltoKieli.value]: $t('peruste-luotu') },
    tapahtumapaiva: new Date(),
  },
  ...data.value.paatavoitteet,
  ...data.value.tavoitepaivamaarat,
  ])
    .filter('tapahtumapaiva')
    .value();
});

const defaultPaatavoitteet = computed(() => {
  return [{
    tapahtuma: _.toLower(PerusteAikatauluDtoTapahtumaEnum.LAUSUNTOKIERROS),
    tavoite: { [Kielet.getSisaltoKieli.value]: $t('lausuntokierros-alkaa') },
    tapahtumapaiva: null,
    julkinen: false,
  }, {
    tapahtuma: _.toLower(PerusteAikatauluDtoTapahtumaEnum.JOHTOKUNNANKASITTELY),
    tavoite: { [Kielet.getSisaltoKieli.value]: $t('johtokunnan-kasittely') },
    tapahtumapaiva: null,
    julkinen: false,
  }, {
    tapahtuma: _.toLower(PerusteAikatauluDtoTapahtumaEnum.ARVIOITUJULKAISUPAIVA),
    tavoite: { [Kielet.getSisaltoKieli.value]: $t('perusteen-arvioitu-julkaisupaiva') },
    tapahtumapaiva: null,
    julkinen: false,
  }, {
    tapahtuma: _.toLower(PerusteAikatauluDtoTapahtumaEnum.JULKAISU),
    tavoite: { [Kielet.getSisaltoKieli.value]: $t('peruste-astuu-voimaan') },
    tapahtumapaiva: null,
    julkinen: false,
  }];
});

const kuvaus = computed(() => {
  return {
    uudistus: PerusteprojektiLuontiKuvausEnum.UUDISTUS,
    korjaus: PerusteprojektiLuontiKuvausEnum.KORJAUS,
  };
});

const isAmmatillinen = computed(() => {
  if (data.value.koulutustyyppi) {
    return isKoulutustyyppiAmmatillinen(data.value.koulutustyyppi);
  }
  return false;
});

const eiTuetutKoulutustyypit = computed(() => {
  return EiTuetutKoulutustyypit;
});

const tavoiteHeading = computed(() => {
  return ' ';
});

const steps = computed(() => {
  return [{
    key: 'pohja',
    name: $t('pohjan-valinta'),
    isValid() {
      if ((tyyppi.value === 'pohjasta' || tyyppi.value === 'perusteesta') && !data.value.peruste) {
        return false;
      }

      if (tyyppi.value === 'tiedostosta' && !data.value.tiedosto) {
        return false;
      }

      return true;
    },
    onNext() {
      if (data.value.tiedosto && !_.isEmpty(data.value.tiedosto.content.projekti)) {
        data.value.nimi = data.value.tiedosto.content.projekti.nimi;
        data.value.diaarinumero = data.value.tiedosto.content.projekti.diaarinumero;
        data.value.koulutustyyppi = data.value.tiedosto.content.projekti.koulutustyyppi;
        data.value.kuvaus = data.value.tiedosto.content.peruste.kuvaus;

        if (data.value.tiedosto.content.projekti.ryhmaOid) {
          data.value.tyoryhma = _.head(_.filter(tyoryhmat.value, tyoryhma => tyoryhma.oid === data.value.tiedosto.content.projekti.ryhmaOid));
        }
      }
    },
  }, {
    key: 'tiedot',
    name: $t('projektin-tiedot'),
    description: $t('projektin-tiedot-kuvaus'),
    isValid() {
      return !$v.value.$invalid;
    },
  }, {
    key: 'aikataulu',
    name: $t('aikataulu'),
    description: $t('aikataulu-kuvaus'),
    isValid() {
      return !$v.value.$invalid;
    },
  }, {
    key: 'yhteenveto',
    name: $t('tietojen-tarkistus'),
    description: $t('yhteenveto-kuvaus-tallenna-tiedot'),
  }];
});

// Methods
function setIsDisabled(koulutustyypilliset) {
  return _.map(koulutustyypilliset, koulutustyypillinen => {
    return {
      ...koulutustyypillinen,
      $isDisabled: !isKoulutustyyppiSupported(koulutustyypillinen.koulutustyyppi),
    };
  });
}

function valitsePeruste(event) {
  data.value.peruste = event;
  data.value.koulutustyyppi = event ? event.koulutustyyppi : null;
}

function ktSearchIdentity(kt: any) {
  return _.toLower($kaannaOlioTaiTeksti(kt));
}

function nimiSearchIdentity(obj: any) {
  return _.toLower($kaanna(obj.nimi));
}

function poistaTavoite(tavoitepaivamaara) {
  data.value.tavoitepaivamaarat = _.without(data.value.tavoitepaivamaarat, tavoitepaivamaara);
}

async function onSave() {
  let luotu;
  const projekti = {
    diaarinumero: data.value.diaarinumero,
    johtokunnanKasittely: data.value.johtokunnanKasittely,
    koulutustyyppi: data.value.koulutustyyppi,
    lausuntakierrosAlkaa: data.value.lausuntakierrosAlkaa,
    nimi: data.value.nimi,
    perusteId: data.value.peruste?.id,
    laajuusYksikko: 'OSAAMISPISTE' as any,
    ryhmaOid: data.value.tyoryhma ? data.value.tyoryhma.oid : null,
    yhteistyotaho: data.value.yhteyshenkilo,
    perusteenAikataulut: tapahtumat.value,
    kuvaus: data.value.kuvaus,
    projektiKuvaus: data.value.projektiKuvaus,
    ...(isLukiokoulutus(data.value.koulutustyyppi) && { toteutus: 'lops2019' as any }),
    maarays: MaarayksetEditStore.createEmptyMaarays({
      nimi: { [Kielet.getSisaltoKieli.value]: data.value.nimi },
      tyyppi: MaaraysDtoTyyppiEnum.PERUSTE,
      koulutustyypit: [data.value.koulutustyyppi],
      tila: MaaraysDtoTilaEnum.LUONNOS,
    }),
  };

  if (data.value.tiedosto) {
    luotu = await props.perusteprojektiStore.importPerusteprojekti({
      ...data.value.tiedosto.content,
      projekti: {
        ...data.value.tiedosto.content.projekti,
        ...projekti,
      },
      peruste: {
        ...data.value.tiedosto.content.peruste,
        perusteenAikataulut: tapahtumat.value,
        kuvaus: data.value.kuvaus,
      },
    });
  }
  else {
    luotu = await props.perusteprojektiStore.addPerusteprojekti(projekti);
  }

  router.push({
    name: 'perusteprojekti',
    params: {
      projektiId: '' + luotu.id,
    },
  });
}

function lisaaTavoite() {
  data.value.tavoitepaivamaarat = [
    ...data.value.tavoitepaivamaarat, {
      tapahtuma: 'tavoite',
      tavoite: { [Kielet.getSisaltoKieli.value]: '' },
      tapahtumapaiva: new Date(),
      julkinen: false,
    },
  ];
}

function onCancel() {
  router.push({
    name: 'perusteprojektit',
  });
}

function onStepChange(step) {
  currentStep.value = step;
}
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
    font-size:0.9rem;
  }
}

.info-icon {
  margin-left: 5px;
  align-self: center;
}

</style>
