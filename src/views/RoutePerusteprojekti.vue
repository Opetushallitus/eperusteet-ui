<template>
  <div class="minfull p-0 m-0">
    <Portal to="headerExtension">
      <div class="portal-menu d-flex">
        <div class="upper-left">
          <EpValidPopover
            :validoitava="peruste"
            :validoinnit="validoinnit"
            :julkaisemattomiaMuutoksia="julkaisemattomiaMuutoksia"
            :julkaistava="!isPohja"
            :is-validating="isValidating"
            @asetaValmiiksi="asetaPohjaValmiiksi"
            @palauta="palauta"
            @validoi="validoi"
            tyyppi="peruste"
            :julkaisuRoute="julkaisuRoute"/>
        </div>
        <div class="flex-grow-1 align-self-center">
          <div class="mb-5 p-2" v-if="peruste && projekti">
            <h1>
              <span>{{nimi}}</span>
            </h1>
            <div class="diaarinumero mt-2" v-if="showNavigation">
              <span v-if="peruste.koulutustyyppi">{{ $t(peruste.koulutustyyppi) }}<span class="mx-2">|</span></span>
              <span v-if="peruste.diaarinumero">{{ peruste.diaarinumero }}<span class="mx-2">|</span></span>

              <b-dropdown class="asetukset" size="sm" no-caret variant="transparent">
                <template v-slot:button-content>
                  <EpSpinner v-if="hallintaLoading" color="white"/>
                  <template v-else>
                    <span>{{$t('lisatoiminnot')}}</span>
                    <EpMaterialIcon icon-shape="outlined" class="hallinta" size="22px">expand_more</EpMaterialIcon>
                  </template>
                </template>

                <div v-for="(ratasvalinta, index) in ratasvalintaFiltered" :key="'ratasvalinta'+index">
                  <hr v-if="ratasvalinta.separator && index !== (ratasvalintaFiltered.length - 1)" class="mt-2 mb-2" />

                  <b-dropdown-item v-if="ratasvalinta.route" :to="{ name: ratasvalinta.route }" :disabled="ratasvalinta.disabled">
                    <EpMaterialIcon icon-shape="outlined">{{ ratasvalinta.icon }}</EpMaterialIcon>
                    <span class="dropdown-text">{{ $t(ratasvalinta.text) }}</span>
                  </b-dropdown-item>

                  <b-dropdown-item
                    v-if="ratasvalinta.click"
                    @click="ratasClick(ratasvalinta.click, ratasvalinta.meta)"
                    :disabled="ratasvalinta.disabled"
                    v-oikeustarkastelu="ratasvalinta.meta.oikeus()">
                    <div class="d-flex" :class="{'validointi-virhe': ratasvalinta.meta.validointi && validointiVirheet.length > 0}">
                      <EpMaterialIcon icon-shape="outlined" v-if="ratasvalinta.icon">{{ ratasvalinta.icon }}</EpMaterialIcon>
                      <span class="dropdown-text">{{ $t(ratasvalinta.text) }}</span>
                      <EpInfoPopover v-if="ratasvalinta.infopopovertext" class="ml-2" :unique-id="'ratasinfopopover-' + index">
                        {{ $t(ratasvalinta.infopopovertext)}}
                      </EpInfoPopover>
                    </div>
                  </b-dropdown-item>
                </div>
              </b-dropdown>
            </div>
          </div>
        </div>
      </div>
    </Portal>

    <div class="sidebar-container">
      <EpSidebar v-if="navigation">
        <template v-slot:bar>
          <div class="m-3">
            <EpSearch v-model="query" />
          </div>
          <div class="navigation">
            <EpTreeNavibar :store="naviStore" :query="query">
              <template v-slot:header>
                <div class="heading">
                  <div class="menu-item">
                    <router-link :to="{ name: yleisnakymaRoute }" exact>
                      {{ $t('yleisnakyma') }}
                    </router-link>
                  </div>
                </div>
              </template>

              <template v-slot:viite="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: tekstikappaleRoute, params: { tekstiKappaleId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) }}
                  </router-link>
                </div>
              </template>

              <template v-slot:tutkinnonosaviite="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'tutkinnonosa', params: { tutkinnonOsaId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-tutkinnon-osa') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:osaalueet>
                <div class="menu-item text-muted ml-2">
                  {{ $t('osa-alueet') }}
                </div>
              </template>

              <template v-slot:osaalue="{ item }">
                <div class="menu-item ml-2">
                  <router-link :to="{ name: 'osaalue', params: { osaalueId: item.id } }">
                    {{ $kaanna(item.label) || $t('nimeton') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:osaalue-post="{}">
                <div class="menu-item ml-2">
                  <router-link :to="{ name: 'osaalue', params: { osaalueId: 'uusi' } }">
                    {{ $t('uusi-osaalue') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:liite="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: tekstikappaleRoute, params: { tekstiKappaleId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-tekstikappale') }}
                  </router-link>
                  <EpMaterialIcon v-b-popover="{content: $t('tekstikappale-naytetaan-liitteena'), trigger: 'hover'}" size="16px">attach_file</EpMaterialIcon>
                </div>
              </template>

              <template v-slot:opintokokonaisuus="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'opintokokonaisuus', params: { opintokokonaisuusId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-opintokokonaisuus') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:tavoitesisaltoalue="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'tavoitesisaltoalue', params: { tavoitesisaltoalueId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-tavoitesisaltoalue') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:koulutuksenosa="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'koulutuksenosa', params: { koulutuksenosaId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-koulutuksen-osa') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:laajaalainenosaaminen="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'laajaalainenosaaminen', params: { laajaalainenosaaminenId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-laaja-alainen-osaaminen') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:koto_kielitaitotaso="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'koto_kielitaitotaso', params: { kotokielitaitotasoId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-kielitaitotaso') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:koto_opinto="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'koto_opinto', params: { kotoOpintoId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-opinto') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:koto_laajaalainenosaaminen="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'koto_laajaalainenosaaminen', params: { kotoLaajaalainenOsaaminenId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-laaja-alainen-osaaminen') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:osaamiskokonaisuus="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'osaamiskokonaisuus', params: { osaamiskokonaisuusId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-osaamiskokonaisuus') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:osaamiskokonaisuus_paa_alue="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'osaamiskokonaisuus_paa_alue', params: { osaamiskokonaisuusPaaAlueId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-osaamiskokonaisuus_paa_alue') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:kvliite="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'kvliite' }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $t('kvliite') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:tutkinnonosat="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'tutkinnonosat' }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $t('tutkinnonosat') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:muodostuminen="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'muodostuminen' }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $t('tutkinnon-rakenne') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:laajaalaiset="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'lukio_laajaAlaisetOsaamiset' }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $t('laaja-alaisen-osaamisen-osa-alueet') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:oppiaineet="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'lukio_oppiaineet' }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $t('oppiaineet') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:oppiaine="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'lukio_oppiaine', params: { oppiaineId: item.id } }">
                    {{ $kaanna(item.label) || $t('nimeton-oppiaine') }} <span v-if="item.koodi">({{item.koodi}})</span>
                  </router-link>
                </div>
              </template>

              <template v-slot:moduuli="{ item }">
                <div class="menu-item">
                  <ep-color-indicator :kind="item.meta.pakollinen ? 'pakollinen' : 'valinnainen'" class="mr-1"/>
                  <router-link :to="{ name: 'moduuli', params: { oppiaineId: item.meta.oppiaineId, moduuliId: item.id } }">
                    {{ $kaanna(item.label) || $t('nimeton-moduuli') }} <span v-if="item.koodi">({{item.koodi}})</span>
                  </router-link>
                </div>
              </template>

              <template v-slot:oppimaarat>
                <div class="menu-item text-muted">
                  {{ $t('oppimaarat') }}
                </div>
              </template>

              <template v-slot:moduulit>
                <div class="menu-item text-muted">
                  {{ $t('moduulit') }}
                </div>
              </template>

              <template v-slot:aipevaihe="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'aipevaihe', params: { vaiheId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-vaihe') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:aipeoppiaine="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'aipeoppiaine', params: { vaiheId: item.meta.vaiheId, oppiaineId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-oppiaine') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:aipekurssi="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'aipekurssi', params: { vaiheId: item.meta.vaiheId, oppiaineId: item.meta.oppiaineId, kurssiId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-kurssi') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:aipe_laajaalaisetosaamiset="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'aipeLaajaAlaisetOsaamiset' }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $t('laaja-alaiset-osaamiset') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:aipe_laajaalainenosaaminen="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'aipelaajaAlainenOsaaminen', params: { laoId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-laaja-alainen-osaaminen') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:taiteenala="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'taiteenala', params: { taiteenalaId: item.id } }">
                    <span class="text-muted mr-1">{{ item.chapter }}</span>
                    {{ $kaanna(item.label) || $t('nimeton-taiteenala') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:perusopetuslaajaalaisetosaamiset>
                <div class="menu-item">
                  <router-link :to="{ name: 'perusopetusLaajaAlaisetOsaamiset' }">
                    {{ $t('laaja-alaiset-osaamiset') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:perusopetuslaajaalainenosaaminen="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'perusopetusLaajaAlainenOsaaminen', params: { laoId: item.id } }">
                    {{ $kaanna(item.label) || $t('nimeton-laaja-alainen-osaaminen') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:vuosiluokkakokonaisuudet>
                <div class="menu-item">
                  <router-link :to="{ name: 'perusopetusVuosiluokkakokonaisuudet' }">
                    {{ $t('vuosiluokkakokonaisuudet') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:vuosiluokkakokonaisuus="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'perusopetusVuosiluokkakokonaisuus', params: { vlkId: item.id } }">
                    {{ $kaanna(item.label) || $t('nimeton-vuosiluokkakokonaisuus') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:perusopetusoppiaineet>
                <div class="menu-item">
                  <router-link :to="{ name: 'perusopetusOppiaineet' }">
                    {{ $t('oppiaineet') }}
                  </router-link>
                </div>
              </template>

              <template v-slot:perusopetusoppiaine="{ item }">
                <div class="menu-item">
                  <router-link :to="{ name: 'perusopetusoppiaine', params: { oppiaineId: item.id } }">
                    {{ $kaanna(item.label) || (item.meta && item.meta.oppimaara ? $t('nimeton-oppimaara') : $t('nimeton-oppiaine')) }}
                  </router-link>
                </div>
              </template>

              <template v-slot:new>
                <EpSisallonLisays :perusteStore="perusteStore" :naviStore="naviStore" />
              </template>

            </EpTreeNavibar>
          </div>
        </template>

        <template v-slot:view v-if="peruste && projekti">
          <router-view />
        </template>

        <template v-slot:bottom>
          <div class="menu-item bottom-menu-item" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
            <router-link :to="jarjestaRoute">
              <span class="text-nowrap">
                <EpMaterialIcon class="order-icon">reorder</EpMaterialIcon>
                <a class="btn btn-link btn-link-nav">{{$t('muokkaa-jarjestysta')}}</a>
              </span>
            </router-link>
          </div>
        </template>
      </EpSidebar>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Component, ProvideReactive } from 'vue-property-decorator';
import * as _ from 'lodash';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSidebar from '@shared/components/EpSidebar/EpSidebar.vue';
import EpTreeNavibar from '@shared/components/EpTreeNavibar/EpTreeNavibar.vue';
import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import EpProgressPopover from '@shared/components/EpProgressPopover/EpProgressPopover.vue';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import { Koulutustyyppi } from '@shared/tyypit';
import {
  NavigationNodeDtoTypeEnum,
  PerusteDtoTilaEnum,
  PerusteDtoToteutusEnum,
} from '@shared/api/eperusteet';
import { Meta } from '@shared/utils/decorators';
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

@Component({
  components: {
    EpMultiSelect,
    EpSearch,
    EpSidebar,
    EpSpinner,
    EpTreeNavibar,
    EpProgressPopover,
    EpTekstikappaleLisays,
    EpButton,
    EpSisallonLisays,
    EpValidPopover,
    EpColorIndicator,
    EpMaterialIcon,
  },
  inject: [],
})
export default class RoutePerusteprojekti extends PerusteprojektiRoute {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop()
  ratasvalinnat!: any[];

  @Prop()
  palautusMeta!: any;

  @Prop({ required: false, default: () => ({ name: 'julkaise' }) })
  private julkaisuRoute!: any;

  @Prop({ required: false, default: () => ({ name: 'jarjesta' }) })
  private jarjestaRoute!: any;

  private naviStore: EpTreeNavibarStore | null = null;
  private isValidating: boolean = false;
  private query = '';
  private hallintaLoading: boolean = false;

  @Meta
  getMetaInfo() {
    if (this.peruste && this.peruste.nimi && !_.isEmpty(this.$kaanna(this.peruste.nimi))) {
      return {
        title: this.$kaanna(this.peruste.nimi),
        titleTemplate: '%s - ' + this.$t('eperusteet-ops-tyokalu'),
      };
    }
  }

  async onProjektiChange(projektiId: number) {
    this.naviStore = new EpTreeNavibarStore(
      this.perusteStore.navigation,
      routeToNode, {
        osaalueet: {
          disableNesting: true,
        },
      });
  }

  get ratasvalintaFiltered() {
    return _.chain(this.ratasvalinnat)
      .reject(ratasvalinta => _.get(ratasvalinta, 'meta.tila') === this.peruste?.tila)
      .filter(ratasvalinta => !ratasvalinta.meta?.oikeus || this.$hasOikeus(ratasvalinta.meta?.oikeus().oikeus, ratasvalinta.meta?.oikeus().kohde))
      .map(ratasvalinta => {
        return {
          ...ratasvalinta,
          disabled: ratasvalinta.disabled && ratasvalinta.disabled(),
          text: _.isFunction(ratasvalinta.text) ? ratasvalinta.text() : ratasvalinta.text,
        };
      })
      .value();
  }

  get popupStyle() {
    return {
      background: '#1d7599',
    };
  }

  get projekti() {
    return this.perusteStore.projekti.value;
  }

  @ProvideReactive('navigation')
  get navigation() {
    return this.perusteStore.navigation.value;
  }

  @ProvideReactive('linkkiHandler')
  get linkkiHandler() {
    return new LinkkiHandler();
  }

  get peruste() {
    return this.perusteStore.peruste.value;
  }

  get nimi() {
    return this.$kaanna(this.peruste?.nimi as any) || this.projekti?.nimi;
  }

  get tekstikappaleet() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Viite);
  }

  get opintokokonaisuudet() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Opintokokonaisuus);
  }

  get koulutuksenosat() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Koulutuksenosa);
  }

  get tavoitesisaltoalueet() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Tavoitesisaltoalue);
  }

  get perusteenOsat() {
    return _.sortBy([
      ...this.tekstikappaleet,
      ...this.opintokokonaisuudet,
      ...this.koulutuksenosat,
      ...this.tavoitesisaltoalueet,
    ], 'chapter');
  }

  flatten(parent) {
    if (!_.isEmpty(parent.children)) {
      return _.flatMap([
        parent,
        ..._.map(parent.children, child => this.flatten(child)),
      ]);
    }
    return [parent];
  }

  get yleisnakymaRoute() {
    if (this.peruste && (this.peruste.tyyppi as any) === 'opas') {
      return 'opas';
    }

    return 'perusteprojekti';
  }

  get tekstikappaleRoute() {
    if (this.peruste && (this.peruste.tyyppi as any) === 'opas') {
      return 'oppaanTekstikappale';
    }

    return 'tekstikappale';
  }

  get validoinnit() {
    if (this.perusteStore.validoinnit.value) {
      return {
        virheet: _.chain(this.perusteStore.validoinnit.value)
          .map('virheet')
          .flatMap()
          .map('kuvaus')
          .value(),
        huomautukset: _.chain(this.perusteStore.validoinnit.value)
          .map('huomautukset')
          .flatMap()
          .map('kuvaus')
          .value(),
      };
    }
  }

  get validointiVirheet() {
    return _.chain(this.perusteStore.validoinnit.value)
      .map('virheet')
      .flatMap()
      .value();
  }

  async ratasClick(clickFn, meta) {
    this.hallintaLoading = true;
    await clickFn(this, {
      ...meta,
      ...(meta.validointi && { validointiVirheet: this.validointiVirheet.slice(0, 3) }),
    });

    if (meta.callback) {
      await meta.callback();
    }

    this.hallintaLoading = false;
  }

  get isPerusteVapaasivistystyo(): boolean {
    return this.peruste?.koulutustyyppi === Koulutustyyppi.vapaasivistystyo;
  }

  get isPerusteTutkintoonValmentava(): boolean {
    return _.toLower(this.peruste?.toteutus) === _.toLower(PerusteDtoToteutusEnum.TUTKINTOONVALMENTAVA);
  }

  get julkaisut() {
    if (this.isArkistoitu) {
      return [];
    }

    return this.perusteStore.julkaisut.value;
  }

  get tila() {
    if (this.julkaisut) {
      if (this.isJulkaistu) {
        return 'julkaistu';
      }

      return _.toLower(this.peruste?.tila);
    }
  }

  get projektiTila() {
    if (this.julkaisut) {
      if (this.isJulkaistu) {
        return 'julkaistu';
      }

      return _.toLower(this.projekti?.tila);
    }
  }

  get isJulkaistu() {
    return this.perusteStore.isJulkaistu.value;
  }

  get isArkistoitu() {
    return _.toLower(this.peruste?.tila) === _.toLower(PerusteDtoTilaEnum.POISTETTU);
  }

  get isLuonnos() {
    return _.toLower(this.peruste?.tila) === _.toLower(PerusteDtoTilaEnum.LUONNOS);
  }

  get julkaisemattomiaMuutoksia() {
    return this.perusteStore.julkaisemattomiaMuutoksia.value;
  }

  async palauta() {
    await vaihdaPerusteTilaConfirm(
      this,
      this.palautusMeta,
    );

    await this.perusteStore.updateCurrent();
  }

  async asetaPohjaValmiiksi() {
    await vaihdaPerusteTilaConfirm(this, {
      tila: 'valmis',
      title: 'aseta-pohja-valmiiksi',
      confirm: 'pohja-valmis-varmistus',
      okTitle: 'aseta-valmiiksi',
    });

    await this.perusteStore.updateCurrent();
  }

  async validoi() {
    this.isValidating = true;
    await this.perusteStore.updateCurrent();
    this.isValidating = false;
  }

  @ProvideReactive('kuvaHandler')
  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.perusteId!));
  }

  @ProvideReactive('kasiteHandler')
  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables';

.order-icon {
  vertical-align: middle;
}

::v-deep .btn-sm {
  padding: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: inherit;
}

::v-deep .btn:focus {
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

      ::v-deep .btn {
        padding: 0;
      }

      .hallinta {
        color: white;
      }

      .dropdown-text {
        margin-left: 5px;
        vertical-align: text-top;
      }

      ::v-deep .dropdown-item {
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

.navigation ::v-deep .ep-button .btn {
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
