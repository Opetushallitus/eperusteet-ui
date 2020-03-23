<template>
  <ep-main-view :tutoriaaliStore="tutoriaaliStore">
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t('tutkinnon-osat') }}</h1>
      </div>
    </template>

    <div class="d-md-flex justify-content-between align-items-center">
      <div>
        <ep-search v-model="query" />
      </div>
      <div>
        <ep-button @click="lisaaTutkinnonOsa" variant="outline" icon="plus">
          {{ $t('lisaa-tutkinnon-osa') }}
        </ep-button>
        <ep-button @click="tuoTutkinnonOsa" variant="outline" icon="plus">
          {{ $t('tuo-tutkinnon-osa') }}
        </ep-button>
      </div>
    </div>

    <ep-spinner v-if="!items" />
    <b-table
      v-else
      responsive
      borderless
      striped
      fixed
      hover
      :items="items"
      :fields="fields">
      <template v-slot:cell(nimi)="{ item }">
        <router-link :to="item.to">
          {{ $kaanna(item.nimi) }}
        </router-link>
      </template>
    </b-table>

  </ep-main-view>
</template>

<script lang="ts">
import { TutoriaaliStore } from '@shared/stores/tutoriaali';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import _ from 'lodash';


@Component({
  components: {
    EpMainView,
    EpSearch,
    EpSpinner,
    EpButton,
  },
})
export default class RouteTutkinnonosat extends PerusteprojektiRoute {
  @Prop({ required: true })
  private tutoriaaliStore!: TutoriaaliStore;

  @Prop({ required: true })
  private tutkinnonOsaStore!: TutkinnonOsaStore;

  private query = '';

  async onProjektiChange() {
    this.tutkinnonOsaStore.fetch();
  }

  get raw() {
    return _.map(this.tutkinnonOsaStore.tutkinnonOsat.value,
        (item, idx) => ({
          ...item,
          idx: idx + 1,
          to: {
            name: 'tutkinnonosa',
            params: {
              tutkinnonOsaId: item.id,
            },
          },
        }));
  }

  get items() {
    return _.filter(this.raw, this.$filterBy('nimi', this.query));
  }

  get fields() {
    return [{
      key: 'idx',
      thStyle: { width: '4rem' },
      label: this.$t('no'),
      sortable: true,
    }, {
      key: 'nimi',
      label: this.$t('nimi'),
      sortable: true,
      sortByFormatted: true,
      thStyle: { width: '50%' },
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$kaanna(value);
      },
    }, {
      key: 'laajuus',
      label: this.$t('laajuus'),
      sortable: true,
      sortByFormatted: true,
    }, {
      key: 'muokattu',
      label: this.$t('muokattu'),
      sortable: true,
      formatter: (value: any, key: any, item: any) => {
        if (item.luotu !== item.muokattu) {
          return (this as any).$sdt(value);
        }
        return '';
      },
    }];
  }

  lisaaTutkinnonOsa() {
    this.$router.push({
      name: 'tutkinnonosa',
      params: {
        tutkinnonOsaId: 'uusi',
      },
    });
  }

  tuoTutkinnonOsa() {
    throw new Error('todo');
  }

}
</script>

<style lang="scss" scoped>
</style>
