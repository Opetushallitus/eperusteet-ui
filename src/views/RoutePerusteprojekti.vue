<template>
  <div class="minfull p-0 m-0">
    <Portal to="headerExtension">
      <div class="portal-menu d-flex">
        <div class="upper-left"></div>
        <div class="flex-grow-1 align-self-center">
          <div class="mb-5 p-2" v-if="peruste && projekti">
            <h1>{{ $kaanna(peruste.nimi) || projekti.nimi }}</h1>
            <div class="diaarinumero">
              {{ peruste.diaarinumero }}
            </div>
          </div>
          <EpSpinner v-else />
        </div>
      </div>
    </Portal>

    <EpSpinner v-if="!navigation" />
    <div v-else class="d-flex align-items-stretch">
      <div class="sidenav minfull">
        <div class="m-3">
          <EpSearch v-model="query" />
        </div>
        <EpTreeNavibar :store="naviStore">
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
      <div class="actual flex-grow-1">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import EpTreeNavibar from '@shared/components/EpTreeNavibar/EpTreeNavibar.vue';
import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';


export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

@Component({
  components: {
    EpIcon,
    EpMultiSelect,
    EpSearch,
    EpSpinner,
    EpTreeNavibar,
  },
})
export default class RoutePerusteprojekti extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  private naviStore: EpTreeNavibarStore | null = null;

  @Watch('projektiId', { immediate: true })
  async onProjektiChange(value: number) {
    await this.perusteStore.init(value);
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
    return this.perusteStore.projekti.value
  }

  get navigation() {
    return this.perusteStore.navigation.value;
  }

  get peruste() {
    return this.perusteStore.peruste.value;
  }

}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables';

.sidenav {
  min-width: $sidebar-width;
  max-width: $sidebar-width;
  background: #fff;
  padding-left: 10px;
}

.portal-menu {
  height: 140px;

  h1 {
    margin: 0;
    padding: 0;
  }

  .upper-left {
    min-width: $sidebar-width;
    max-width: $sidebar-width;
  }
}

.actual {
  background: #f2f2f2;
}

.menu-item {
  margin-top: 12px;
  font-size: 0.8rem;
}

</style>
