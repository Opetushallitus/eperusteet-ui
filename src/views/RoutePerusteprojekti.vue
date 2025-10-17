<template>
  <div class="minfull p-0 m-0">
    <Teleport
      defer
      to="#headerExtension"
    >
      <div class="portal-menu d-flex">
        <div class="upper-left">
          <EpValidPopover
            :validoitava="peruste"
            :validoinnit="validoinnit"
            :julkaisemattomia-muutoksia="julkaisemattomiaMuutoksia"
            :julkaistava="!isPohja"
            :is-validating="isValidating"
            tyyppi="peruste"
            :julkaisu-route="julkaisuRoute"
            @aseta-valmiiksi="asetaPohjaValmiiksi"
            @palauta="palauta"
            @validoi="validoi"
          />
        </div>
        <div class="flex-grow-1 align-self-center">
          <div
            v-if="peruste && projekti"
            class="mb-5 p-2"
          >
            <h1>
              <span>{{ nimi }}</span>
            </h1>
            <div
              v-if="showNavigation"
              class="diaarinumero mt-2"
            >
              <span v-if="peruste.koulutustyyppi">{{ $t(peruste.koulutustyyppi) }}<span class="mx-2">|</span></span>
              <span v-if="peruste.diaarinumero">{{ peruste.diaarinumero }}<span class="mx-2">|</span></span>

              <b-dropdown
                class="asetukset"
                size="sm"
                no-caret
                variant="transparent"
              >
                <template #button-content>
                  <EpSpinner
                    v-if="hallintaLoading"
                    color="white"
                  />
                  <template v-else>
                    <span>{{ $t('lisatoiminnot') }}</span>
                    <EpMaterialIcon
                      icon-shape="outlined"
                      class="hallinta"
                      size="22px"
                    >
                      expand_more
                    </EpMaterialIcon>
                  </template>
                </template>

                <div
                  v-for="(ratasvalinta, index) in ratasvalintaFiltered"
                  :key="'ratasvalinta'+index"
                >
                  <hr
                    v-if="ratasvalinta.separator && index !== (ratasvalintaFiltered.length - 1)"
                    class="mt-2 mb-2"
                  >

                  <b-dropdown-item
                    v-if="ratasvalinta.route"
                    :to="{ name: ratasvalinta.route }"
                    :disabled="ratasvalinta.disabled"
                  >
                    <EpMaterialIcon icon-shape="outlined">
                      {{ ratasvalinta.icon }}
                    </EpMaterialIcon>
                    <span class="dropdown-text">{{ $t(ratasvalinta.text) }}</span>
                  </b-dropdown-item>

                  <b-dropdown-item
                    v-if="ratasvalinta.click"
                    v-oikeustarkastelu="ratasvalinta.meta.oikeus()"
                    :disabled="ratasvalinta.disabled"
                    @click="ratasClick(ratasvalinta.click, ratasvalinta.meta)"
                  >
                    <div
                      class="d-flex"
                      :class="{'validointi-virhe': ratasvalinta.meta.validointi && validointiVirheet.length > 0}"
                    >
                      <EpMaterialIcon
                        v-if="ratasvalinta.icon"
                        icon-shape="outlined"
                      >
                        {{ ratasvalinta.icon }}
                      </EpMaterialIcon>
                      <span class="dropdown-text">{{ $t(ratasvalinta.text) }}</span>
                      <EpInfoPopover
                        v-if="ratasvalinta.infopopovertext"
                        class="ml-2"
                        :unique-id="'ratasinfopopover-' + index"
                      >
                        {{ $t(ratasvalinta.infopopovertext) }}
                      </EpInfoPopover>
                    </div>
                  </b-dropdown-item>
                </div>
              </b-dropdown>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <div class="sidebar-container">
      <EpSidebar v-if="navigation">
        <template #bar>
          <div class="m-3">
            <EpSearch v-model="query" />
          </div>
          <div class="navigation">
            <EpTreeNavibar
              :store="naviStore"
              :query="query"
            >
              <template #header>
                <div class="heading">
                  <div class="menu-item">
                    <router-link
                      :to="{ name: yleisnakymaRoute }"
                      exact
                    >
                      {{ $t('yleisnakyma') }}
                    </router-link>
                  </div>
                </div>
              </template>

              <template #viite="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: tekstikappaleRoute, params: { tekstiKappaleId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) }}
                  </router-link>
                </div>
              </template>

              <template #tutkinnonosaviite="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'tutkinnonosa', params: { tutkinnonOsaId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-tutkinnon-osa') }}
                  </router-link>
                </div>
              </template>

              <template #osaalueet>
                <div class="menu-item text-muted ml-2">
                  {{ $t('osa-alueet') }}
                </div>
              </template>

              <template #osaalue="{ item }">
                <div class="menu-item ml-2">
                  <router-link :to="{ name: 'osaalue', params: { osaalueId: item.id } }">
                    {{ $kaanna(item.label) || $t('nimeton') }}
                  </router-link>
                </div>
              </template>

              <template #osaalue-post>
                <div class="menu-item ml-2">
                  <router-link :to="{ name: 'osaalue', params: { osaalueId: 'uusi' } }">
                    {{ $t('uusi-osaalue') }}
                  </router-link>
                </div>
              </template>

              <template #liite="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: tekstikappaleRoute, params: { tekstiKappaleId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-tekstikappale') }}
                  </router-link>
                  <EpMaterialIcon
                    v-popover="{content: $t('tekstikappale-naytetaan-liitteena'), trigger: 'hover'}"
                    size="16px"
                  >
                    attach_file
                  </EpMaterialIcon>
                </div>
              </template>

              <template #opintokokonaisuus="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'opintokokonaisuus', params: { opintokokonaisuusId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-opintokokonaisuus') }}
                  </router-link>
                </div>
              </template>

              <template #tavoitesisaltoalue="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'tavoitesisaltoalue', params: { tavoitesisaltoalueId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-tavoitesisaltoalue') }}
                  </router-link>
                </div>
              </template>

              <template #koulutuksenosa="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'koulutuksenosa', params: { koulutuksenosaId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-koulutuksen-osa') }}
                  </router-link>
                </div>
              </template>

              <template #laajaalainenosaaminen="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'laajaalainenosaaminen', params: { laajaalainenosaaminenId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-laaja-alainen-osaaminen') }}
                  </router-link>
                </div>
              </template>

              <template #koto_kielitaitotaso="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'koto_kielitaitotaso', params: { kotokielitaitotasoId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-kielitaitotaso') }}
                  </router-link>
                </div>
              </template>

              <template #koto_opinto="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'koto_opinto', params: { kotoOpintoId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-opinto') }}
                  </router-link>
                </div>
              </template>

              <template #koto_laajaalainenosaaminen="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'koto_laajaalainenosaaminen', params: { kotoLaajaalainenOsaaminenId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-laaja-alainen-osaaminen') }}
                  </router-link>
                </div>
              </template>

              <template #osaamiskokonaisuus="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'osaamiskokonaisuus', params: { osaamiskokonaisuusId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-osaamiskokonaisuus') }}
                  </router-link>
                </div>
              </template>

              <template #osaamiskokonaisuus_paa_alue="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'osaamiskokonaisuus_paa_alue', params: { osaamiskokonaisuusPaaAlueId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-osaamiskokonaisuus_paa_alue') }}
                  </router-link>
                </div>
              </template>

              <template #kvliite="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'kvliite' }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $t('kvliite') }}
                  </router-link>
                </div>
              </template>

              <template #tutkinnonosat="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'tutkinnonosat' }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $t('tutkinnonosat') }}
                  </router-link>
                </div>
              </template>

              <template #muodostuminen="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'muodostuminen' }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $t('tutkinnon-rakenne') }}
                  </router-link>
                </div>
              </template>

              <template #laajaalaiset="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'lukio_laajaAlaisetOsaamiset' }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $t('laaja-alaisen-osaamisen-osa-alueet') }}
                  </router-link>
                </div>
              </template>

              <template #oppiaineet="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'lukio_oppiaineet' }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $t('oppiaineet') }}
                  </router-link>
                </div>
              </template>

              <template #oppiaine="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'lukio_oppiaine', params: { oppiaineId: item.id } }">
                    {{ $kaanna(item.label) || $t('nimeton-oppiaine') }} <span v-if="item.koodi">({{ item.koodi }})</span>
                  </router-link>
                </div>
              </template>

              <template #moduuli="{ item }">
                <div class="menu-item">
                  <ep-color-indicator
                    :kind="item.meta.pakollinen ? 'pakollinen' : 'valinnainen'"
                    class="mr-1"
                  />
                  <router-link :to="{ name: 'moduuli', params: { oppiaineId: item.meta.oppiaineId, moduuliId: item.id } }">
                    {{ $kaanna(item.label) || $t('nimeton-moduuli') }} <span v-if="item.koodi">({{ item.koodi }})</span>
                  </router-link>
                </div>
              </template>

              <template #oppimaarat>
                <div class="menu-item text-muted">
                  {{ $t('oppimaarat') }}
                </div>
              </template>

              <template #moduulit>
                <div class="menu-item text-muted">
                  {{ $t('moduulit') }}
                </div>
              </template>

              <template #aipevaihe="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'aipevaihe', params: { vaiheId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-vaihe') }}
                  </router-link>
                </div>
              </template>

              <template #aipeoppiaine="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'aipeoppiaine', params: { vaiheId: item.meta.vaiheId, oppiaineId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-oppiaine') }}
                  </router-link>
                </div>
              </template>

              <template #aipekurssi="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'aipekurssi', params: { vaiheId: item.meta.vaiheId, oppiaineId: item.meta.oppiaineId, kurssiId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-kurssi') }}
                  </router-link>
                </div>
              </template>

              <template #aipe_laajaalaisetosaamiset="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'aipeLaajaAlaisetOsaamiset' }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $t('laaja-alaiset-osaamiset') }}
                  </router-link>
                </div>
              </template>

              <template #aipe_laajaalainenosaaminen="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'aipelaajaAlainenOsaaminen', params: { laoId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-laaja-alainen-osaaminen') }}
                  </router-link>
                </div>
              </template>

              <template #taiteenala="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'taiteenala', params: { taiteenalaId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-taiteenala') }}
                  </router-link>
                </div>
              </template>

              <template #perusopetuslaajaalaisetosaamiset>
                <div class="menu-item">
                  <router-link :to="{ name: 'perusopetusLaajaAlaisetOsaamiset' }">
                    {{ $t('laaja-alaiset-osaamiset') }}
                  </router-link>
                </div>
              </template>

              <template #perusopetuslaajaalainenosaaminen="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'perusopetusLaajaAlainenOsaaminen', params: { laoId: item.id } }">
                    {{ $kaanna(item.label) || $t('nimeton-laaja-alainen-osaaminen') }}
                  </router-link>
                </div>
              </template>

              <template #vuosiluokkakokonaisuudet>
                <div class="menu-item">
                  <router-link :to="{ name: 'perusopetusVuosiluokkakokonaisuudet' }">
                    {{ $t('vuosiluokkakokonaisuudet') }}
                  </router-link>
                </div>
              </template>

              <template #vuosiluokkakokonaisuus="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'perusopetusVuosiluokkakokonaisuus', params: { vlkId: item.id } }">
                    {{ $kaanna(item.label) || $t('nimeton-vuosiluokkakokonaisuus') }}
                  </router-link>
                </div>
              </template>

              <template #perusopetusoppiaineet>
                <div class="menu-item">
                  <router-link :to="{ name: 'perusopetusOppiaineet' }">
                    {{ $t('oppiaineet') }}
                  </router-link>
                </div>
              </template>

              <template #perusopetusoppiaine="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'perusopetusoppiaine', params: { oppiaineId: item.id } }">
                    {{ $kaanna(item.label) || (item.meta && item.meta.oppimaara ? $t('nimeton-oppimaara') : $t('nimeton-oppiaine')) }}
                  </router-link>
                </div>
              </template>

              <template #new>
                <EpSisallonLisays
                  :peruste-store="perusteStore"
                  :navi-store="naviStore"
                />
              </template>
            </EpTreeNavibar>
          </div>
        </template>

        <template
          v-if="peruste && projekti"
          #view
        >
          <router-view />
        </template>

        <template #bottom>
          <div
            v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
            class="menu-item bottom-menu-item"
          >
            <router-link :to="jarjestaRoute">
              <span class="text-nowrap">
                <EpMaterialIcon class="order-icon">reorder</EpMaterialIcon>
                <a class="btn btn-link btn-link-nav">{{ $t('muokkaa-jarjestysta') }}</a>
              </span>
            </router-link>
          </div>
        </template>
      </EpSidebar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as _ from 'lodash';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSidebar from '@shared/components/EpSidebar/EpSidebar.vue';
import EpTreeNavibar from '@shared/components/EpTreeNavibar/EpTreeNavibar.vue';
import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';
import { usePerusteprojekti } from './PerusteprojektiRoute';
import EpProgressPopover from '@shared/components/EpProgressPopover/EpProgressPopover.vue';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import { Koulutustyyppi } from '@shared/tyypit';
import {
  NavigationNodeDtoTypeEnum,
  PerusteDtoTilaEnum,
  PerusteDtoToteutusEnum,
} from '@shared/api/eperusteet';
import { PerusteStore } from '@/stores/PerusteStore';
import { vaihdaPerusteTilaConfirm } from '@/utils/varmistusmetodit';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSisallonLisays from '@/components/EpSisallonLisays.vue';
import { routeToNode, LinkkiHandler } from '@/utils/routing';
import EpValidPopover from '@shared/components/EpValidPopover/EpValidPopover.vue';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { KayttajaStore } from '@/stores/kayttaja';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { TyoryhmaStore } from '@/stores/TyoryhmaStore';
import { useHead } from '@unhead/vue';
import { $t, $kaanna, $hasOikeus } from '@shared/utils/globals';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import { onMounted } from 'vue';

export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

interface ValidationCategory {
  category: string;
  ok: number;
  failcount: number;
  total: number;
}

interface ValidationStats {
  categories: ValidationCategory[];
  ok: number;
  warnings: number;
  total: number;
  fails: number;
}

const props = withDefaults(defineProps<{
  perusteStore: PerusteStore;
  kayttajaStore: KayttajaStore;
  tiedotteetStore: TiedotteetStore;
  muokkaustietoStore: MuokkaustietoStore;
  aikatauluStore: AikatauluStore;
  tyoryhmaStore: TyoryhmaStore;
  termitStore: TermitStore;
  ratasvalinnat: any[];
  palautusMeta: any;
  julkaisuRoute?: any;
  jarjestaRoute?: any;
}>(), {
  julkaisuRoute: { name: 'julkaise' },
  jarjestaRoute: { name: 'jarjesta' },
});

const route = useRoute();
const router = useRouter();
const naviStore = ref<EpTreeNavibarStore | null>(null);
const isValidating = ref(false);
const query = ref('');
const hallintaLoading = ref(false);

// Use the composition function
const {
  showNavigation,
  isInitializing,
  projektiId,
  peruste,
  projekti,
  isPohja,
} = usePerusteprojekti(props);

onMounted(() => {
  updateHead();
});

// Meta info
watch(() => peruste.value, (newPeruste) => {
  if (newPeruste && newPeruste.nimi && !_.isEmpty($kaanna(newPeruste.nimi))) {
    updateHead();
  }
});

// Project change handler
const onProjektiChange = async (projektiId: number) => {
  naviStore.value = new EpTreeNavibarStore(
    props.perusteStore.navigation,
    routeToNode, {
      osaalueet: {
        disableNesting: true,
      },
    });
};

const updateHead = () => {
  useHead({
    title: $kaanna(peruste.value?.nimi) || projekti.value?.nimi,
    titleTemplate: '%s - ' + $t('eperusteet-laadinta'),
  });
};

// Watch project ID changes to initialize the navigation
watch(projektiId, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    await onProjektiChange(parseInt(newValue));
  }
}, { immediate: true });

const ratasvalintaFiltered = computed(() => {
  return _.chain(props.ratasvalinnat)
    .reject(ratasvalinta => _.get(ratasvalinta, 'meta.tila') === peruste.value?.tila)
    .filter(ratasvalinta => !ratasvalinta.meta?.oikeus || $hasOikeus(ratasvalinta.meta?.oikeus().oikeus, ratasvalinta.meta?.oikeus().kohde))
    .map(ratasvalinta => {
      return {
        ...ratasvalinta,
        disabled: ratasvalinta.disabled && ratasvalinta.disabled(),
        text: _.isFunction(ratasvalinta.text) ? ratasvalinta.text() : ratasvalinta.text,
      };
    })
    .value();
});

const popupStyle = computed(() => {
  return {
    background: '#1d7599',
  };
});

const navigation = computed(() => props.perusteStore.navigation.value);

provide('navigation', computed(() => props.perusteStore.navigation.value));
provide('linkkiHandler', new LinkkiHandler());
provide('kuvaHandler', createKuvaHandler(new KuvaStore(props.perusteStore.perusteId.value!)));
provide('kasiteHandler', createKasiteHandler(props.termitStore));

const nimi = computed(() => {
  return $kaanna(peruste.value?.nimi as any) || projekti.value?.nimi;
});

const tekstikappaleet = computed(() => {
  return _.filter(naviStore.value?.connected, node => node.type === NavigationNodeDtoTypeEnum.Viite);
});

const opintokokonaisuudet = computed(() => {
  return _.filter(naviStore.value?.connected, node => node.type === NavigationNodeDtoTypeEnum.Opintokokonaisuus);
});

const koulutuksenosat = computed(() => {
  return _.filter(naviStore.value?.connected, node => node.type === NavigationNodeDtoTypeEnum.Koulutuksenosa);
});

const tavoitesisaltoalueet = computed(() => {
  return _.filter(naviStore.value?.connected, node => node.type === NavigationNodeDtoTypeEnum.Tavoitesisaltoalue);
});

const perusteenOsat = computed(() => {
  return _.sortBy([
    ...tekstikappaleet.value,
    ...opintokokonaisuudet.value,
    ...koulutuksenosat.value,
    ...tavoitesisaltoalueet.value,
  ], 'chapter');
});

const flatten = (parent) => {
  if (!_.isEmpty(parent.children)) {
    return _.flatMap([
      parent,
      ..._.map(parent.children, child => flatten(child)),
    ]);
  }
  return [parent];
};

const yleisnakymaRoute = computed(() => {
  if (peruste.value && (peruste.value.tyyppi as any) === 'opas') {
    return 'opas';
  }

  return 'perusteprojekti';
});

const tekstikappaleRoute = computed(() => {
  if (peruste.value && (peruste.value.tyyppi as any) === 'opas') {
    return 'oppaanTekstikappale';
  }

  return 'tekstikappale';
});

const validoinnit = computed(() => {
  if (props.perusteStore.validoinnit.value) {
    return {
      virheet: _.chain(props.perusteStore.validoinnit.value)
        .map('virheet')
        .flatMap()
        .map('kuvaus')
        .value(),
      huomautukset: _.chain(props.perusteStore.validoinnit.value)
        .map('huomautukset')
        .flatMap()
        .map('kuvaus')
        .value(),
    };
  }
  return { virheet: [], huomautukset: [] };
});

const validointiVirheet = computed(() => {
  return _.chain(props.perusteStore.validoinnit.value)
    .map('virheet')
    .flatMap()
    .value();
});

const ratasClick = async (clickFn, meta) => {
  hallintaLoading.value = true;
  await clickFn(
    {
      perusteStore: props.perusteStore,
      route,
      router,
      meta: {
        ...meta,
        ...(meta.validointi && { validointiVirheet: validointiVirheet.value.slice(0, 3) }),
      },
    },
  );

  if (meta.callback) {
    await meta.callback();
  }

  hallintaLoading.value = false;
};

const isPerusteVapaasivistystyo = computed(() => {
  return peruste.value?.koulutustyyppi === Koulutustyyppi.vapaasivistystyo;
});

const isPerusteTutkintoonValmentava = computed(() => {
  return _.toLower(peruste.value?.toteutus) === _.toLower(PerusteDtoToteutusEnum.TUTKINTOONVALMENTAVA);
});

const julkaisut = computed(() => {
  if (isArkistoitu.value) {
    return [];
  }

  return props.perusteStore.julkaisut.value;
});

const tila = computed(() => {
  if (julkaisut.value) {
    if (isJulkaistu.value) {
      return 'julkaistu';
    }

    return _.toLower(peruste.value?.tila);
  }
  return '';
});

const projektiTila = computed(() => {
  if (julkaisut.value) {
    if (isJulkaistu.value) {
      return 'julkaistu';
    }

    return _.toLower(projekti.value?.tila);
  }
  return '';
});

const isJulkaistu = computed(() => {
  return props.perusteStore.isJulkaistu.value;
});

const isArkistoitu = computed(() => {
  return _.toLower(peruste.value?.tila) === _.toLower(PerusteDtoTilaEnum.POISTETTU);
});

const isLuonnos = computed(() => {
  return _.toLower(peruste.value?.tila) === _.toLower(PerusteDtoTilaEnum.LUONNOS);
});

const julkaisemattomiaMuutoksia = computed(() => {
  return props.perusteStore.julkaisemattomiaMuutoksia.value;
});

const palauta = async () => {
  await vaihdaPerusteTilaConfirm({
    meta: props.palautusMeta,
    route,
    router,
  });

  await props.perusteStore.updateCurrent();
};

const asetaPohjaValmiiksi = async () => {
  await vaihdaPerusteTilaConfirm(
    {
      meta: {
        tila: 'valmis',
        title: 'aseta-pohja-valmiiksi',
        confirm: 'pohja-valmis-varmistus',
        okTitle: 'aseta-valmiiksi',
      },
      route,
      router,
    },
  );

  await props.perusteStore.updateCurrent();
};

const validoi = async () => {
  isValidating.value = true;
  await props.perusteStore.updateValidointi();
  isValidating.value = false;
};

</script>

<style lang="scss" scoped>
@import '@/styles/_variables';

.order-icon {
  vertical-align: middle;
}

:deep(.btn-sm) {
  padding: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: inherit;
}

:deep(.btn:focus) {
  box-shadow: unset;
}

.portal-menu {
  height: 140px;

  h1 {
    margin: 0;
    padding: 0;

  }
  .diaarinumero {
    .asetukset {

      :deep(.btn) {
        padding: 0;
      }

      .hallinta {
        color: white;
      }

      .dropdown-text {
        margin-left: 5px;
        vertical-align: text-top;
      }

      :deep(.dropdown-item) {
        padding-left: 1rem;
        padding-right: 2rem;

        .icon {
          padding-right: 0.75rem;
          margin: 0;
        }

        .dropdown-text {
          margin: 0;
        }
      }

      svg:not(.hallinta) {
        width: 25px;
      }

      .validointi-virhe {
        color: $red;
      }
    }
  }

  .upper-left {
    @media (max-width: 991.98px) {
      padding: 10px 30px;
    }
    @media (min-width: 992px) {
      min-width: $sidebar-width;
      max-width: $sidebar-width;
    }
  }
}

.navigation {
  height: calc(100% - 145px);
}

.heading {
  margin-left: 28px;
  margin-right: 28px;
  border-bottom: 1px solid rgb(216, 216, 216);
}

.menu-item {
  font-size: 14px;
  padding: 7px 10px 7px 10px;

  a {
    &.router-link-exact-active {
      font-weight: 600;
    }
  }
}

.menu-item:not(.bottom-menu-item) a{
  color: #000;
}

.navigation :deep(.ep-button .btn) {
  font-size: 14px;
}

.bottom-menu-item {
  margin-left: 20px;
  margin-bottom: 10px;
}

.not-supported {
  font-size: 0.8rem;
  color: $gray-lighten-8;
}

.julkaisemattomia-muutoksia {
  width: 15rem;
  margin-left: -1.75rem;
}

</style>
