<template>
  <EpEditointi :store="store">
    <template v-slot:header>
      <div class="d-flex justify-content-between">
        <h1>{{ $t('tutkinnon-osat') }}</h1>
      </div>
    </template>

    <template v-slot:default="{ isEditing }">
      <div v-if="!isEditing" class="d-md-flex justify-content-between align-items-center">
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
          <EpTutkinnonosaTuontiModal ref="tutkinnonosaTuontiModal" :peruste="peruste" @refresh="refresh"/>
        </div>
      </div>

      <ep-spinner v-if="!items" />
      <div v-else-if="items.length === 0" class="p-4">
        <EpAlert :text="$t('tutkinnon-osia-ei-luotu')" />
      </div>
      <div v-else>
        <div class="table-responsive" v-if="isEditing">
          <table class="table table-borderless table-striped table-hover" role="table">
            <thead role="rowgroup">
              <tr>
                <th>{{ $t('no') }}</th>
                <th>{{ $t('nimi') }}</th>
                <th>{{ $t('laajuus') }}</th>
                <th>{{ $t('muokattu') }}</th>
              </tr>
            </thead>
            <draggable v-model="items"
                       tag="tbody"
                       v-bind="options">
              <tr v-for="(item, idx) in raw" :key="idx" role="row">
                <td>
                  <fas icon="dragindicator"></fas>
                  {{ idx + 1 }}
                </td>
                <td>{{ $kaanna(item.nimi) || $t('nimeton-tutkinnonosa') }}</td>
                <td>{{ item.laajuus }}</td>
                <td>{{ $ago(item.muokattu) }}</td>
              </tr>
            </draggable>
          </table>
        </div>

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
              {{ $kaanna(item.nimi) || $t('nimeton-tutkinnonosa') }}
            </router-link>
          </template>
        </b-table>
      </div>
    </template>
  </EpEditointi>
</template>

<script lang="ts">
import { TutoriaaliStore } from '@shared/stores/tutoriaali';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import draggable from 'vuedraggable';
import _ from 'lodash';
import EpTutkinnonosaTuontiModal from '@/components/EpTutkinnonosaTuontiModal.vue';

@Component({
  components: {
    EpAlert,
    EpButton,
    EpEditointi,
    EpSearch,
    EpSpinner,
    draggable,
    EpTutkinnonosaTuontiModal,
  },
})
export default class RouteTutkinnonosat extends PerusteprojektiRoute {
  @Prop({ required: true })
  private tutoriaaliStore!: TutoriaaliStore;

  @Prop({ required: true })
  private tutkinnonOsaStore!: TutkinnonOsaStore;

  private store: EditointiStore | null = null;

  private query = '';

  async onProjektiChange() {
    this.store = new EditointiStore(this.tutkinnonOsaStore);
  }

  get options() {
    return {
      animation: 300,
      handle: '.handle',
      disabled: false,
      ghostClass: 'placeholder',
      forceFallback: true,
    };
  }

  get raw() {
    if (!this.store) {
      return null;
    }

    return _.map(this.store.data.value,
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
    if (!this.store) {
      return null;
    }

    return _.filter(this.raw, this.$filterBy('nimi', this.query));
  }

  set items(value: any) {
    this.store!.setData(value);
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
    (this.$refs.tutkinnonosaTuontiModal as any).show();
  }

  get peruste() {
    return this.perusteStore.peruste.value;
  }

  async refresh() {
    await this.onProjektiChange();
    await this.perusteStore.updateNavigation();
  }
}
</script>

<style lang="scss" scoped>
</style>
