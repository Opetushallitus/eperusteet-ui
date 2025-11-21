<template>
  <div class="p-4">
    <div class="d-flex justify-content-between">
      <h2>{{ $t('julkaisunakyma') }}</h2>
    </div>

    <template v-if="!isPohja">
      <div>{{ $t('julkaisunakyma-kuvaus') }}</div>

      <div class="mt-4">
        <h3>{{ $t('julkaisun-vaikutukset') }}</h3>
        <ul>
          <li>{{ $t('peruste-julkaisun-vaikutukset-1') }}</li>
          <li>{{ $t('peruste-julkaisun-vaikutukset-2') }}</li>
          <li>{{ $t('peruste-julkaisun-vaikutukset-3') }}</li>
          <li>{{ $t('peruste-julkaisun-vaikutukset-4') }}</li>
          <li v-if="isAmmatillinen">
            {{ $t('peruste-julkaisun-vaikutukset-ammatillinen-1') }}
          </li>
        </ul>
      </div>
    </template>

    <div>
      <h3>{{ $t('tarkistukset') }}</h3>
      <div class="validation">
        <div
          v-if="!validoinnit"
          class="validointi-spinner"
        >
          <EpSpinner />
          <div>{{ $t('validointi-kaynnissa') }}</div>
        </div>
        <div v-else>
          <div
            v-if="isPerusteValid"
            class="d-flex"
          >
            <EpMaterialIcon class="no-errors">
              check_circle
            </EpMaterialIcon>
            <div class="ml-2">
              {{ $t('ei-julkaisua-estavia-virheita') }}
            </div>
          </div>
          <div
            v-else
            class="d-flex"
          >
            <EpMaterialIcon class="errors">
              info
            </EpMaterialIcon>
            <div class="ml-2">
              {{ $t('loytyi-julkaisun-estavia-virheita') }}
            </div>
          </div>

          <div
            v-for="(validointi, idx) in validoinnit"
            :key="'validointi'+idx"
          >
            <ep-collapse
              v-if="validointi.virheet.length > 0 || validointi.huomautukset.length > 0"
              :border-bottom="false"
            >
              <template #header>
                <h3>{{ $t('validointi-kategoria-' + validointi.kategoria) }}</h3>
              </template>
              <EpJulkaisuValidointi :validointi="validointi" />
            </ep-collapse>
          </div>
        </div>
      </div>
    </div>

    <div v-if="peruste && julkaisuMahdollinen && !isPohja">
      <hr class="mt-4 mb-4">
      <h3>{{ $t(koulutustyyppiKohtaisetKaannokset.perusteentiedot) }}</h3>
      <b-container fluid>
        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t(koulutustyyppiKohtaisetKaannokset.perusteennimi) + '*'">
              <ep-input v-model="peruste.nimi" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row no-gutters>
          <b-col lg="6">
            <b-form-group :label="$t('diaarinumero')">
              <ep-input
                v-model="peruste.diaarinumero"
                type="string"
              />
            </b-form-group>
          </b-col>
          <b-col lg="6">
            <b-form-group :label="$t('maarayksen-paatospaivamaara')">
              <ep-datepicker v-model="peruste.paatospvm" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row no-gutters>
          <b-col lg="6">
            <b-form-group :label="$t('voimassaolo')">
              <div class="d-flex align-items-center">
                <ep-datepicker v-model="peruste.voimassaoloAlkaa" />
                <div class="ml-2 mr-2">
                  -
                </div>
                <ep-datepicker v-model="peruste.voimassaoloLoppuu" />
              </div>
            </b-form-group>
          </b-col>
          <b-col
            v-if="peruste.koulutustyyppi"
            lg="6"
          >
            <b-form-group :label="$t('koulutustyyppi')">
              <ep-koulutustyyppi-select :value="peruste.koulutustyyppi" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row no-gutters>
          <b-col lg="6">
            <b-form-group :label="$t('perusteen-kielet')">
              <div class="text-nowrap">
                <span
                  v-for="(kieli, idx) in peruste.kielet"
                  :key="kieli"
                  :value="kieli"
                >
                  {{ $t(kieli) }}<span
                    v-if="idx < peruste.kielet.length - 1"
                    class="mr-0"
                  >,</span>
                </span>
              </div>
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>
    </div>

    <template v-if="!isPohja">
      <div v-if="julkaisuMahdollinen">
        <hr class="mt-4">
        <h3 class="mt-4">
          {{ $t('uusi-julkaisu') }}
        </h3>

        <EpInfoBanner class="mb-3">
          {{ $t('muista-lisata-julkaisun-kuvauksesta-myos-kieliversio') }}
        </EpInfoBanner>

        <EpJulkaisuMuutosmaarays
          v-if="isNormaali"
          v-model="julkaisu"
          class="mt-4"
          :muutosmaaraykset="muutosmaaraykset"
        />

        <EpJulkaisuForm
          v-model="julkaisu"
          class="mt-4"
          is-latest
          :store="perusteStore"
        />

        <b-form-group>
          <EpJulkaisuButton
            v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
            :julkaise="julkaise"
            :julkaisu-kesken="julkaisuKesken"
            :disabled="!julkaisuValid"
          />
        </b-form-group>
      </div>

      <hr class="mt-4 mb-4">

      <EpJulkaisuHistoria
        :store="perusteStore"
        :palauta="palautaJulkaisu"
      >
        <template #katsele="{ julkaisu }">
          <ep-external-link
            v-if="julkaisu"
            :url="opintopolkuKatseluUrl(julkaisu)"
          >
            {{ $t('katsele') }}
          </ep-external-link>
        </template>
        <template #empty>
          <div>{{ $t('perusteella-ei-julkaisuja') }}</div>
        </template>
      </EpJulkaisuHistoria>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute, LocationQuery, RouteParams, RouteLocationNormalizedLoaded, Location } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { PerusteDtoTilaEnum, NavigationNodeDto, Perusteprojektit, PerusteprojektiDtoTilaEnum, Julkaisut, Maintenance } from '@shared/api/eperusteet';
import { PerusteStore } from '@/stores/PerusteStore';
import EpKoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import _ from 'lodash';
import EpJulkaisuHistoria from '@/components/EpJulkaisu/EpJulkaisuHistoria.vue';
import EpJulkaisuButton from '@shared/components/EpJulkaisuButton/EpJulkaisuButton.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import { buildKatseluUrl } from '@shared/utils/esikatselu';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';
import { Kielet } from '@shared/stores/kieli';
import EpJulkaisuForm from '@/components/EpJulkaisu/EpJulkaisuForm.vue';
import EpJulkaisuMuutosmaarays from '@/components/EpJulkaisu/EpJulkaisuMuutosmaarays.vue';
import { nodeToRoute } from '@/utils/routing';
import EpJulkaisuValidointi from '@shared/components/EpJulkaisuValidointi/EpJulkaisuValidointi.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpInfoBanner from '@shared/components/EpInfoBanner/EpInfoBanner.vue';
import { $t, $success, $fail } from '@shared/utils/globals';
import { usePerusteprojekti } from './PerusteprojektiRoute';

const props = defineProps<{
  perusteStore: PerusteStore;
  tiedotSivu: Location;
}>();

const julkaisu = ref({
  tiedote: null,
  julkinenTiedote: null,
  julkinen: true,
  muutosmaaraysVoimaan: null,
  liitteet: [],
  muutosmaarays: null,
  liittyyMuutosmaarays: false,
});

const hallintaLoading = ref(false);
const router = useRouter();
const route = useRoute();
const { peruste, projekti, isPohja, isNormaali, isAmmatillinen, koulutustyyppiKohtaisetKaannokset } = usePerusteprojekti({ perusteStore: props.perusteStore });

onMounted(async () => {
  await validoi();
  await props.perusteStore.fetchMaaraykset();
});

const muutosmaaraykset = computed(() => {
  if (props.perusteStore.muutosmaaraykset.value) {
    return props.perusteStore.muutosmaaraykset.value;
  }
  return undefined;
});

const julkaisuMahdollinen = computed(() => {
  return _.toLower(peruste.value?.tila) !== _.toLower(PerusteDtoTilaEnum.POISTETTU) && isPerusteValid.value;
});

const valmiiksiMahdollinen = computed(() => {
  return _.toLower(projekti.value?.tila) === _.toLower(PerusteprojektiDtoTilaEnum.LAADINTA);
});

const julkaisut = computed(() => {
  return props.perusteStore.julkaisut.value;
});

const validoinnit = computed(() => {
  if (props.perusteStore.validoinnit.value) {
    return _.map(props.perusteStore.validoinnit.value, validointi => {
      return {
        ...validointi,
        virheet: listNodeToRoute(validointi.virheet),
        huomautukset: listNodeToRoute(validointi.huomautukset),
        huomiot: listNodeToRoute(validointi.huomiot),
      };
    });
  }
  return undefined;
});

const listNodeToRoute = (list: any[]) => {
  return _.map(list, item => ({ ...item, route: nodeToRouteHandle(item.navigationNode) }));
};

const isPerusteValid = computed(() => {
  if (validoinnit.value) {
    return _.every(validoinnit.value, validointi => _.isEmpty(validointi.virheet));
  }
  return undefined;
});

const validoi = async () => {
  await props.perusteStore.updateValidointi();
};

const julkaise = async () => {
  try {
    await props.perusteStore.julkaise({
      tiedote: julkaisu.value.tiedote,
      julkinenTiedote: julkaisu.value.julkinenTiedote,
      julkinen: julkaisu.value.julkinen,
      muutosmaaraysVoimaan: julkaisu.value.muutosmaaraysVoimaan,
      liitteet: julkaisu.value.liitteet,
      muutosmaarays: julkaisu.value.liittyyMuutosmaarays ? julkaisu.value.muutosmaarays : null,
    });

    julkaisu.value.tiedote = {};
    julkaisu.value.julkinenTiedote = {};
    julkaisu.value.julkinen = true;
    julkaisu.value.muutosmaaraysVoimaan = null;
    julkaisu.value.liitteet = [];
    julkaisu.value.liittyyMuutosmaarays = false;

    $success($t('julkaisu-kaynnistetty'));
  }
  catch (err) {
    $fail($t('julkaisu-epaonnistui'));
  }
};

const palautaJulkaisu = async (julkaisu: any) => {
  try {
    await props.perusteStore.palautaJulkaisu(julkaisu);
    $success($t('perusteen-julkaisuversio-palautettu-julkiseksi'));
  }
  catch (err) {
    $fail($t('palautus-epaonnistui'));
  }
};

const rules = computed(() => {
  return {
    julkaisu: {
      muutosmaarays: {
        required: requiredIf(() => {
          return julkaisu.value && julkaisu.value.liittyyMuutosmaarays;
        }),
      },
    },
  };
});

const v$ = useVuelidate(rules, { julkaisu }, { $stopPropagation: true });

const julkaisuValid = computed(() => {
  return !v$.value.$invalid;
});

const julkaisuKesken = computed(() => {
  return props.perusteStore?.viimeisinJulkaisuTila.value === 'KESKEN';
});

const nodeToRouteHandle = (navigationNode: NavigationNodeDto | undefined): Location | null => {
  if (!navigationNode) {
    return null;
  }

  switch (navigationNode.type) {
  case 'tiedot':
    return props.tiedotSivu;
  default:
    return nodeToRoute(navigationNode as any);
  }
};

const opintopolkuKatseluUrl = (julkaisu: any) => {
  let revision = julkaisu.revision;
  if (revision === _.max(_.map(julkaisut.value, 'revision'))) {
    revision = null;
  }
  if (julkaisu.peruste && julkaisu.peruste.id) {
    return buildKatseluUrl(Kielet.getSisaltoKieli.value, `/${koulutustyyppiTheme(props.perusteStore.peruste.value!.koulutustyyppi!)}/${julkaisu.peruste.id}`, revision);
  }
  return '';
};
</script>

<style lang="scss" scoped>
@import '@shared/styles/_variables';

.validation {
  border: 1px solid #ccc;
  box-shadow: 0 0 20px #eee;
  border-radius: 10px;
  margin-bottom: 10px;
  padding: 20px;
}

.validointi-spinner {
  text-align: center;
}

.no-errors {
  color: $green;
}

.errors {
  color: $invalid;
}

.validointi {
  text-align: center;
}

.valiviiva {
  display: block;
  height: 1px;
  width: 10px;
  border-top: 1px solid black;
}

.liiteohje {
  color: #666;
  font-size: 0.7rem;
  padding: 8px 0 8px 0;
}

.lataaliite {
  font-size: 0.9rem;
  font-weight: 600;
}

.julkaisu:nth-of-type(even) {
  background-color: $gray-lighten-13;
}
</style>
