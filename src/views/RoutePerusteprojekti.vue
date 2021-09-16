<template>
  <div class="minfull p-0 m-0">
    <Portal to="headerExtension">
      <div class="portal-menu d-flex">
        <div class="upper-left">
          <ep-progress-popover :slices="progressSlices" :popup-style="popupStyle" height="60" width="60">
            <template v-slot:header>
              <div class="d-flex flex-column align-items-center">
                <div class="mb-1">{{$t(projektiTila)}}</div>

                <b-button class="px-3 py-1" v-oikeustarkastelu="{ oikeus: 'muokkaus' }" variant="primary" v-if="isLuonnos && isPohja && validationStats && validationStats.fails === 0" @click="asetaValmiiksi">
                  {{$t('aseta-valmiiksi')}}
                </b-button>
                <b-button class="px-3 py-1" variant="primary" :to="julkaisuRoute" v-else-if="!isPohja && tila && !isJulkaistu && !isArkistoitu && isKoulutustyyppiSupported">
                  {{ $t('siirry-julkaisunakymaan') }}
                </b-button>

                <div class="px-5 text-center not-supported" v-if="!isKoulutustyyppiSupported">
                  {{$t('julkaisu-on-estetty-koska-koulutustyyppi-ei-ole-tuettu')}}
                </div>
              </div>

            </template>

            <b-button class="px-3 py-1" variant="primary" :to="julkaisuRoute" v-if="isJulkaistu && isKoulutustyyppiSupported">
              {{ $t('siirry-julkaisunakymaan') }}
            </b-button>

            <div v-if="isArkistoitu" class="d-flex flex-column align-items-center text-center">
              <b-button class="px-3 py-1" variant="primary" @click="palauta" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
                {{ $t('palauta') }}
              </b-button>
              <div class="font-size-08 mt-1">{{$t('voit-palauttaa-arkistoidun-perusteen-luonnostilaan')}}</div>
            </div>

            <div v-else-if="validationStats">
              <div v-if="validationStats.warnings > 0" class="pl-3 pt-2 pb-1 d-flex align-items-center">
                <fas class="text-warning mr-3" icon="info-circle" />
                <span>{{ $t('perusteessa-huomautuksia') }}</span>
              </div>
              <template v-if="validationCategories">
                <div class="pl-3 pt-2 pb-1 d-flex align-items-center" v-for="c in validationStats.categories" :key="c.category">
                  <template v-if="c.failcount === 0">
                    <fas class="text-success mr-3" icon="check-circle" />
                    <span>{{ $t(c.category + '-validation-ok') }}</span>
                  </template>
                  <template v-if="c.failcount > 0">
                    <fas class="text-danger mr-3" icon="info-circle" />
                    <span>{{ $t(c.category + '-validation-error') }}</span>
                  </template>
                </div>
              </template>
            </div>
            <ep-spinner v-else />

          </ep-progress-popover>
        </div>
        <div class="flex-grow-1 align-self-center">
          <div class="mb-5 p-2" v-if="peruste && projekti">
            <h1>
              <span>{{nimi}}</span>
              <b-dropdown class="asetukset" size="lg" variant="link" toggle-class="text-decoration-none" no-caret>
                <template v-slot:button-content>
                  <fas icon="ratas" class="hallinta" />
                </template>

                <div v-for="(ratasvalinta, index) in ratasvalintaFiltered" :key="'ratasvalinta'+index">

                  <hr v-if="ratasvalinta.separator && index !== (ratasvalintaFiltered.length - 1)" class="mt-2 mb-2" />

                  <b-dropdown-item v-if="ratasvalinta.route " :to="{ name: ratasvalinta.route }" :disabled="ratasvalinta.disabled">
                    <fas :icon="ratasvalinta.icon" />
                    {{ $t(ratasvalinta.text) }}
                  </b-dropdown-item>

                  <b-dropdown-item
                    v-if="ratasvalinta.click"
                    @click="ratasClick(ratasvalinta.click, ratasvalinta.meta)"
                    :disabled="ratasvalinta.disabled"
                    v-oikeustarkastelu="ratasvalinta.meta.oikeus">
                    <fas :icon="ratasvalinta.icon" />
                    {{ $t(ratasvalinta.text) }}
                  </b-dropdown-item>
                </div>
              </b-dropdown>
            </h1>
            <div class="diaarinumero" v-if="showNavigation">
              {{ $t(peruste.koulutustyyppi) }} <span v-if="peruste.koulutustyyppi && peruste.diaarinumero">|</span> {{ peruste.diaarinumero }}
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

              <template v-slot:new>
                <EpSisallonLisays :perusteStore="perusteStore" :naviStore="naviStore" />
              </template>

            </EpTreeNavibar>
          </div>
        </template>

        <template v-slot:view>
          <router-view />
        </template>

        <template v-slot:bottom>
          <div class="menu-item bottom-menu-item" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
            <router-link :to="jarjestaRoute">
              <span class="text-nowrap">
                <fas icon="jarjesta" fixed-width />
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
import { Prop, Component, Vue, ProvideReactive } from 'vue-property-decorator';
import { Location } from 'vue-router';

import * as _ from 'lodash';

import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSidebar from '@shared/components/EpSidebar/EpSidebar.vue';
import EpTreeNavibar from '@shared/components/EpTreeNavibar/EpTreeNavibar.vue';
import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import EpProgressPopover from '@shared/components/EpProgressPopover/EpProgressPopover.vue';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import { Koulutustyyppi, NavigationNodeDto } from '@shared/tyypit';
import {
  NavigationNodeDtoTypeEnum,
  PerusteDtoTilaEnum,
  PerusteDtoTyyppiEnum,
  PerusteDtoToteutusEnum,
  StatusValidointiStatusTypeEnum,
} from '@shared/api/eperusteet';
import { Meta } from '@shared/utils/decorators';

import { PerusteStore } from '@/stores/PerusteStore';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';
import { KoulutuksenOsaStore } from '@/stores/KoulutuksenOsaStore';
import { vaihdaPerusteTilaConfirm } from '@/utils/arkistointi';
import { TavoitesisaltoalueStore } from '@/stores/TavoitesisaltoalueStore';
import { KotoKielitaitotasoStore } from '@/stores/KotoKielitaitotasoStore';
import { KotoOpintoStore } from '@/stores/KotoOpintoStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSisallonLisays from '@/components/EpSisallonLisays.vue';
import { routeToNode, LinkkiHandler } from '@/utils/routing';

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
}

@Component({
  components: {
    EpIcon,
    EpMultiSelect,
    EpSearch,
    EpSidebar,
    EpSpinner,
    EpTreeNavibar,
    EpProgressPopover,
    EpTekstikappaleLisays,
    EpButton,
    EpSisallonLisays,
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
  private loading = false;
  private query = '';

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
      .filter(ratasvalinta => !ratasvalinta.meta?.oikeus || this.$hasOikeus(ratasvalinta.meta?.oikeus.oikeus, 'peruste'))
      .map(ratasvalinta => {
        return {
          ...ratasvalinta,
          disabled: ratasvalinta.disabled && ratasvalinta.disabled(),
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

  get validationStats() {
    if (this.validationCategories) {
      let kategoriat = _.chain(this.validationCategories)
        .map(kategoria => {
          return {
            category: _.lowerCase(kategoria),
            ok: 0,
            failcount: _.size(_.filter(this.perusteStore.projektiStatus.value?.infot, info => info.validointiKategoria === kategoria)),
            total: _.size(_.filter(this.perusteStore.projektiStatus.value?.infot, info => info.validointiKategoria === kategoria)),
          } as ValidationCategory;
        })
        .filter(c => c.category !== 'null')
        .value();

      if (_.size(kategoriat) === 0) {
        kategoriat = [{
          category: 'validation-category-peruste',
          ok: 0,
          failcount: 0,
          total: 0,
        }];
      }

      return {
        categories: kategoriat,
        ok: 0,
        warnings: _.size(_.filter(this.perusteStore.projektiStatus.value?.infot, info => info.validointiStatusType === StatusValidointiStatusTypeEnum.HUOMAUTUS)),
        fails: _.sum(_.map(kategoriat, 'failcount')),
        total: _.size(kategoriat),
      } as ValidationStats;
    }
  }

  get validationCategories() {
    if (this.perusteStore.projektiStatus.value) {
      return _.chain(this.perusteStore.projektiStatus.value.infot)
        .keyBy('validointiKategoria')
        .keys()
        .value();
    }
  }

  get progressSlices() {
    if (this.tila) {
      if (this.isArkistoitu) {
        return [0];
      }

      if (this.validationCategories) {
        return _.chain(this.validationCategories)
          .map(kategoria => 0.5)
          .value();
      }
    }
  }

  ratasClick(clickFn, meta) {
    clickFn(this, meta);
  }

  get isPerusteVapaasivistystyo(): boolean {
    return this.peruste?.koulutustyyppi === Koulutustyyppi.vapaasivistystyo;
  }

  get isPerusteTutkintoonValmentava(): boolean {
    return this.peruste?.toteutus === _.toLower(PerusteDtoToteutusEnum.TUTKINTOONVALMENTAVA);
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
    return (_.size(this.julkaisut) > 0 || this.peruste?.tila === PerusteDtoTilaEnum.VALMIS) && !this.isArkistoitu;
  }

  get isArkistoitu() {
    return this.peruste?.tila === _.toLower(PerusteDtoTilaEnum.POISTETTU);
  }

  get isLuonnos() {
    return this.peruste?.tila === _.toLower(PerusteDtoTilaEnum.LUONNOS);
  }

  async palauta() {
    await vaihdaPerusteTilaConfirm(
      this,
      this.palautusMeta,
    );
  }

  get isPohja() {
    if (this.peruste) {
      return this.peruste.tyyppi === _.toLower(PerusteDtoTyyppiEnum.POHJA);
    }
  }

  async asetaValmiiksi() {
    await vaihdaPerusteTilaConfirm(this, {
      tila: 'valmis',
      title: 'aseta-pohja-valmiiksi',
      confirm: 'pohja-valmis-varmistus',
      okTitle: 'aseta-valmiiksi',
    });

    await this.perusteStore.updateCurrent();
  }

  get isKoulutustyyppiSupported() {
    return this.perusteStore.koulutustyyppiSupported.value;
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables';

.portal-menu {
  height: 140px;

  h1 {
    margin: 0;
    padding: 0;

    .asetukset {
      .hallinta {
        color: white;
      }

      ::v-deep .dropdown-item {
        padding-left: 1rem;
        padding-right: 2rem;
      }

      svg:not(.hallinta) {
        width: 25px;
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

</style>
