<template>
  <div class="minfull p-0 m-0">
    <Portal to="headerExtension">
      <div class="portal-menu d-flex">
        <div class="upper-left">
          <ep-progress-popover :slices="progressSlices">

            <template v-slot:header>
              <div class="pt-1 row justify-content-center" v-if="validationStats">
                <div v-if="validationStats.ok < validationStats.total">
                  {{ validationStats.ok }} / {{ validationStats.total }} {{$t('valmis')}}
                </div>
                <div v-else-if="validationCategories">
                  <b-button class="px-3 py-1" variant="primary"
                      :to="{ name: 'perusteprojekti' }">{{ $t('julkaise') }}</b-button>
                </div>
              </div>
            </template>

            <div v-if="validationStats" class="row justify-content-center">
              <b-button v-if="validationStats.ok < validationStats.total"
                        variant="primary"
                        :to="{ name: 'perusteprojekti' }">{{ $t('siirry-julkaisunakymaan') }}</b-button>
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
              <b-dropdown size="lg" variant="link" toggle-class="text-decoration-none" no-caret>
                <template v-slot:button-content>
                  <fas icon="ratas" class="hallinta" />
                </template>
                <b-dropdown-item :to="{ name: 'projektinTiedot' }">
                  <fas icon="info" />
                  {{ $t('projektin-tiedot') }}
                </b-dropdown-item>
                <b-dropdown-item :to="{ name: 'perusteenTiedot' }">
                  <fas icon="info" />
                  {{ $t('perusteen-tiedot') }}
                </b-dropdown-item>
                <b-dropdown-item :to="{ name: 'dokumentti' }">
                  <fas icon="file-pdf" />
                  {{ $t('luo-pdf') }}
                </b-dropdown-item>
                <b-dropdown-item :to="{ name: 'termisto' }">
                  <fas icon="bookmark" />
                  {{ $t('kasitteet') }}
                </b-dropdown-item>
                <b-dropdown-item :to="{ name: 'poistetut' }">
                  <fas icon="trash" />
                  {{ $t('poistetut-sisallot') }}
                </b-dropdown-item>
                <b-dropdown-divider />
                <b-dropdown-item>
                  <fas icon="folder" />
                  {{ $t('arkistoi-peruste') }}
                </b-dropdown-item>
              </b-dropdown>
            </h1>
            <div class="diaarinumero">
              {{ peruste.diaarinumero }}
            </div>
          </div>
        </div>
      </div>
    </Portal>

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
            <template v-slot:padding="{ item }">
              <div :style="{ 'margin-left': item.depth * 20 + 'px' }">
              </div>
            </template>
            <template v-slot:viite="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'tekstikappale', params: { tekstiKappaleId: item.id } }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>
            <template v-slot:tutkinnonosaviite="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'tutkinnonosa', params: { tutkinnonOsaId: item.id } }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>
            <template v-slot:liite="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'tekstikappale', params: { tekstiKappaleId: item.id } }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>
            <template v-slot:tutkinnonosat="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'tutkinnonosat' }">
                  {{ $t('tutkinnonosat') }}
                </router-link>
              </div>
            </template>
            <template v-slot:muodostuminen="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'muodostuminen' }">
                  {{ $t('tutkinnon-rakenne') }}
                </router-link>
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

@Component({
  components: {
    EpIcon,
    EpMultiSelect,
    EpSearch,
    EpSidebar,
    EpSpinner,
    EpTreeNavibar,
    EpProgressPopover,
  },
})
export default class RoutePerusteprojekti extends PerusteprojektiRoute {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  private naviStore: EpTreeNavibarStore | null = null;
  private loading = false;

  async onProjektiChange(projektiId: number) {
    await this.perusteStore.init(projektiId);
    this.naviStore = new EpTreeNavibarStore(this.perusteStore.navigation);
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

  get yleisnakymaRoute() {
    if (this.peruste && (this.peruste.tyyppi as any) === 'opas') {
      return 'opas';
    }

    return 'perusteprojekti';
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
}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables';

.portal-menu {
  height: 140px;

  h1 {
    margin: 0;
    padding: 0;
    .hallinta {
      color: white;
    }
  }

  .upper-left {
    min-width: $sidebar-width;
    max-width: $sidebar-width;
  }
}

.navigation {
  min-height: 1200px;
}

.heading {
  margin-left: 20px;
}

.menu-item {
  padding: 6px;
  font-size: 0.8rem;

  a {
    color: #000;

    &.router-link-active {
      font-weight: 600;
    }
  }
}

.bottom-menu-item {
  margin-left: 20px;
  margin-bottom: 10px;
}

</style>
