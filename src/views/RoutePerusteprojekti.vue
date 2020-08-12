<template>
  <div class="minfull p-0 m-0">
    <Portal to="headerExtension">
      <div class="portal-menu d-flex">
        <div class="upper-left">
          <ep-progress-popover :slices="progressSlices" :popup-style="popupStyle">
            <template v-slot:header>
              <div class="pt-1 row justify-content-center" v-if="validationStats">
                <div v-if="validationStats.ok < validationStats.total">
                  {{ validationStats.ok }} / {{ validationStats.total }} {{$t('valmis')}}
                </div>
                <div v-else-if="validationCategories">
                  <b-button class="px-3 py-1" variant="primary"
                      :to="{ name: 'julkaise' }">{{ $t('julkaise') }}</b-button>
                </div>
              </div>
            </template>

            <div v-if="validationStats" class="row justify-content-center">
              <b-button v-if="validationStats.ok < validationStats.total"
                        variant="primary"
                        :to="{ name: 'julkaise' }">{{ $t('siirry-julkaisunakymaan') }}</b-button>
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
              <span>{{ $kaanna(peruste.nimi) || projekti.nimi }}</span>
              <b-dropdown class="asetukset" size="lg" variant="link" toggle-class="text-decoration-none" no-caret>
                <template v-slot:button-content>
                  <fas icon="ratas" class="hallinta" />
                </template>

                <div v-for="(ratasvalinta, index) in ratasvalinnat" :key="'ratasvalinta'+index">

                  <hr v-if="ratasvalinta.separator" class="mt-2 mb-2" />

                  <b-dropdown-item v-if="ratasvalinta.route " :to="{ name: ratasvalinta.route }">
                    <fas :icon="ratasvalinta.icon" />
                    {{ $t(ratasvalinta.text) }}
                  </b-dropdown-item>

                  <b-dropdown-item v-if="ratasvalinta.click" @click="ratasClick(ratasvalinta.click, ratasvalinta.meta)">
                    <fas :icon="ratasvalinta.icon" />
                    {{ $t(ratasvalinta.text) }}
                  </b-dropdown-item>
                </div>
              </b-dropdown>
            </h1>
            <div class="diaarinumero" v-if="showNavigation">
              {{ $t(peruste.koulutustyyppi) }} | {{ peruste.diaarinumero }}
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

              <template v-slot:osaalue-post="{ item }">
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
                  <ep-tekstikappale-lisays @save="tallennaUusiTekstikappale" :tekstikappaleet="tekstikappaleet" :paatasovalinta="true">
                    <template v-slot:default="{tekstikappale}">
                      <span class="text-muted mr-1">{{ item.chapter }}</span>
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
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
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
import { NavigationNodeDtoTypeEnum, Sisallot } from '@shared/api/eperusteet';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { Location } from 'vue-router';

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

function routeToNode(route: Location): NavigationNodeDto | null {
  if (!route) {
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

  private naviStore: EpTreeNavibarStore | null = null;
  private loading = false;

  async onProjektiChange(projektiId: number) {
    this.naviStore = new EpTreeNavibarStore(
      this.perusteStore.navigation,
      routeToNode, {
        osaalueet: {
          disableNesting: true,
        },
      });
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

  get projektiId() {
    return this.$route.params.projektiId;
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

  get tekstikappaleet() {
    if (this.navigation) {
      return _.chain(this.navigation.children)
        .filter(child => child.type === NavigationNodeDtoTypeEnum.Viite)
        .map(child => this.flatten(child))
        .flatMap()
        .value();
    }

    return [];
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
      const kategoriat = _.chain(this.validationCategories)
        .map(kategoria => {
          return {
            category: _.lowerCase(kategoria),
            ok: 0,
            failcount: _.size(_.filter(this.perusteStore.projektiStatus.value?.infot, info => info.validointiKategoria === kategoria)),
            total: _.size(_.filter(this.perusteStore.projektiStatus.value?.infot, info => info.validointiKategoria === kategoria)),
          } as ValidationCategory;
        })
        .value();

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
    if (this.validationCategories) {
      return _.chain(this.validationCategories)
        .map(kategoria => 0.5)
        .value();
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

  ratasClick(clickFn, meta) {
    clickFn(this, meta);
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
