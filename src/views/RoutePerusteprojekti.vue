<template>
  <div class="minfull p-0 m-0">
    <Portal to="headerExtension">
      <div class="portal-menu d-flex">
        <div class="upper-left">
          <ep-progress-popover :slices="progressSlices" :popup-style="popupStyle" height="60" width="60">
            <template v-slot:header>
              <div class="d-flex flex-column align-items-center">
                <div class="mb-1">{{$t(tila)}}</div>

                <b-button class="px-3 py-1" variant="primary" :to="{ name: 'julkaise' }" v-if="tila && !isJulkaistu && !isArkistoitu">
                  {{ $t('siirry-julkaisunakymaan') }}
                </b-button>
              </div>
            </template>

            <b-button class="px-3 py-1" variant="primary" :to="{ name: 'julkaise' }" v-if="isJulkaistu">
              {{ $t('siirry-julkaisunakymaan') }}
            </b-button>

            <div v-if="isArkistoitu" class="d-flex flex-column align-items-center text-center">
              <b-button class="px-3 py-1" variant="primary" @click="palauta">
                {{ $t('palauta') }}
              </b-button>
              <div class="font-size-08 mt-1">{{$t('voit-palauttaa-arkistoidun-perusteen-luonnostilaan')}}</div>
            </div>

            <div v-else-if="validationStats" class="row justify-content-center">
              <div v-if="validationCategories">
                <div class="pl-3 pt-2 pb-1 row" v-for="c in validationStats.categories" :key="c.category">
                  <div class="col-1">
                    <fas class="text-success" icon="check-circle" v-if="c.failcount === 0"/>
                    <fas class="text-danger" icon="info-circle" v-if="c.failcount > 0"/>
                  </div>
                  <div class="col">
                    <span v-if="c.failcount === 0">{{ $t(c.category + "-validation-ok") }}</span>
                    <span v-if="c.failcount > 0">{{ $t(c.category + "-validation-error") }}</span>
                  </div>
                </div>
              </div>
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

                  <hr v-if="ratasvalinta.separator" class="mt-2 mb-2" />

                  <b-dropdown-item v-if="ratasvalinta.route " :to="{ name: ratasvalinta.route }">
                    <fas :icon="ratasvalinta.icon" />
                    {{ $t(ratasvalinta.text) }}
                  </b-dropdown-item>

                  <b-dropdown-item v-if="ratasvalinta.click" @click="ratasClick(ratasvalinta.click, ratasvalinta.meta)" :disabled="ratasvalinta.disabled">
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
            <EpTreeNavibar :store="naviStore">
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
                <div class="ml-2">
                  <ep-tekstikappale-lisays @save="tallennaUusiTekstikappale" :tekstikappaleet="perusteenOsat" :paatasovalinta="true">
                    <template v-slot:default="{tekstikappale}">
                      <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
                      {{ $kaanna(tekstikappale.label) }}
                    </template>
                  </ep-tekstikappale-lisays>

                  <ep-tekstikappale-lisays
                    v-if="perusteVapaasivistystyo"
                    @save="tallennaUusiOpintokokonaisuus"
                    :tekstikappaleet="perusteenOsat"
                    :paatasovalinta="true"
                    :otsikkoRequired="false"
                    modalId="opintokokonaisuusLisays">
                    <template v-slot:lisays-btn-text>
                      {{$t('uusi-opintokokonaisuus')}}
                    </template>
                    <template v-slot:modal-title>
                      {{$t('uusi-opintokokonaisuus')}}
                    </template>
                    <template v-slot:footer-lisays-btn-text>
                      {{$t('lisaa-opintokokonaisuus')}}
                    </template>
                    <template v-slot:header>
                      {{$t('opintokokonaisuuden-sijainti')}}
                    </template>
                    <template v-slot:default="{tekstikappale}">
                      <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
                      {{ $kaanna(tekstikappale.label) }}
                    </template>
                  </ep-tekstikappale-lisays>
                </div>
              </template>

            </EpTreeNavibar>
          </div>
        </template>

        <template v-slot:view>
          <router-view />
        </template>

        <template v-slot:bottom>
          <div class="menu-item bottom-menu-item">
            <router-link :to="{ name: 'jarjesta' }">
              <span class="text-nowrap">
                <fas icon="jarjesta" fixed-width />
                {{ $t('muokkaa-rakennetta') }}
              </span>
            </router-link>
          </div>
        </template>
      </EpSidebar>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSidebar from '@shared/components/EpSidebar/EpSidebar.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import EpTreeNavibar from '@shared/components/EpTreeNavibar/EpTreeNavibar.vue';
import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import EpProgressPopover from '@shared/components/EpProgressPopover/EpProgressPopover.vue';
import * as _ from 'lodash';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import { NavigationNodeDto } from '@shared/tyypit';
import { NavigationNodeDtoTypeEnum, Sisallot, PerusteDtoTilaEnum, PerusteDtoTyyppiEnum } from '@shared/api/eperusteet';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';
import { Location } from 'vue-router';
import { Meta } from '@shared/utils/decorators';
import { vaihdaPerusteTilaConfirm } from '@/utils/arkistointi';

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
  total: number;
}

const ignoredRouteNames = ['kasitteet', 'opasKasitteet', 'poistetut'];

function routeToNode(route: Location): NavigationNodeDto | null {
  if (!route || _.includes(ignoredRouteNames, route.name)) {
    return null;
  }

  if (route.name === 'tekstikappale') {
    return {
      type: 'viite',
      id: Number(route.params?.tekstiKappaleId!),
    };
  }
  else if (route.name === 'muodostuminen') {
    return {
      type: 'muodostuminen',
    };
  }
  else if (route.name === 'osaalue') {
    console.log(route);
    return {
      type: 'osaalue',
      id: Number(route.params?.osaalueId!),
    };
  }
  else if (route.name === 'tutkinnonosa') {
    return {
      type: 'tutkinnonosaviite',
      id: Number(route.params?.tutkinnonOsaId!),
    };
  }
  else if (route.name === 'kvliite') {
    return {
      type: 'kvliite',
    };
  }
  else if (route.name === 'tutkinnonosat') {
    return {
      type: 'tutkinnonosat',
    };
  }
  else if (route.name === 'opintokokonaisuus') {
    return {
      type: 'opintokokonaisuus',
      id: Number(route.params?.opintokokonaisuusId!),
    };
  }
  else {
    console.error('Unknown route', route.name, route);
  }

  return null;
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
  },
})
export default class RoutePerusteprojekti extends PerusteprojektiRoute {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop()
  ratasvalinnat!: any[];

  @Prop()
  palautusMeta!: any;

  private naviStore: EpTreeNavibarStore | null = null;
  private loading = false;

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
    return _.reject(this.ratasvalinnat, ratasvalinta => _.get(ratasvalinta, 'meta.tila') === this.peruste?.tila);
  }

  get popupStyle() {
    return {
      background: '#1d7599',
    };
  }

  get query() {
    return '';
  }

  set query(val: string) {
  }

  get projekti() {
    return this.perusteStore.projekti.value;
  }

  get navigation() {
    return this.perusteStore.navigation.value;
  }

  get peruste() {
    return this.perusteStore.peruste.value;
  }

  get nimi() {
    if (this.peruste?.tyyppi === _.toLower(PerusteDtoTyyppiEnum.OPAS)) {
      return this.projekti?.nimi;
    }

    return this.$kaanna(this.peruste?.nimi as any) || this.projekti?.nimi;
  }

  get tekstikappaleet() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Viite);
  }

  get opintokokonaisuudet() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Opintokokonaisuus);
  }

  get perusteenOsat() {
    return _.sortBy([
      ...this.tekstikappaleet,
      ...this.opintokokonaisuudet,
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

  async tallennaUusiTekstikappale(otsikko, tekstikappaleIsa) {
    const tkstore = new TekstikappaleStore(this.peruste!.id!, 0);
    const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);

    this.perusteStore.updateNavigation();

    this.$router.push({
      name: this.tekstikappaleRoute,
      params: {
        tekstiKappaleId: '' + tallennettu!.id,
      },
    });
  }

  async tallennaUusiOpintokokonaisuus(otsikko, tekstikappaleIsa) {
    const tkstore = new OpintokokonaisuusStore(this.peruste!.id!, 0);
    const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);

    this.perusteStore.updateNavigation();

    this.$router.push({
      name: 'opintokokonaisuus',
      params: {
        opintokokonaisuusId: '' + tallennettu!.id,
      },
    });
  }

  ratasClick(clickFn, meta) {
    clickFn(this, meta);
  }

  get perusteVapaasivistystyo() {
    return this.peruste!.koulutustyyppi === 'koulutustyyppi_30';
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

  get isJulkaistu() {
    return (_.size(this.julkaisut) > 0 || this.peruste?.tila === PerusteDtoTilaEnum.VALMIS) && !this.isArkistoitu;
  }

  get isArkistoitu() {
    return this.peruste?.tila === _.toLower(PerusteDtoTilaEnum.POISTETTU);
  }

  async palauta() {
    await vaihdaPerusteTilaConfirm(
      this,
      this.palautusMeta,
    );
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
  min-height: 1200px;
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
    color: #000;

    &.router-link-exact-active {
      font-weight: 600;
    }
  }
}

.navigation ::v-deep .ep-button .btn {
  font-size: 14px;
}

.bottom-menu-item {
  margin-left: 20px;
  margin-bottom: 10px;
}

</style>
