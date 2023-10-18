<template>
  <EpMainView>
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t('osaamismerkki-kategorioiden-hallinta') }}</h1>
        <div class="d-flex">
          <EpButton class="m-0 p-0"
                    variant="outlined"
                    icon="add"
                    @click="avaaKategoriaModal">{{$t('lisaa-kategoria')}}</EpButton>
        </div>
      </div>
    </template>

    <EpSpinner v-if="!kategoriat" />

    <div v-else>
      <b-table responsive
               borderless
               striped
               fixed
               hover
               no-local-sorting
               :items="kategoriat"
               :fields="tableFields"
               @row-clicked="avaaKategoriaModal"/>
    </div>
    <EpOsaamismerkkiKategoriaModal ref="osaamismerkkiKategoriaModal" :store="osaamismerkitStore"/>
  </EpMainView>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { OsaamismerkkiKategoriaDto } from '@shared/generated/eperusteet';
import EpOsaamismerkkiKategoriaModal from '@/components/EpOsaamismerkki/EpOsaamismerkkiKategoriaModal.vue';
import { OsaamismerkitStore } from '@/stores/OsaamismerkitStore';

@Component({
  components: {
    EpMainView,
    EpSpinner,
    EpMultiSelect,
    EpSearch,
    EpFormContent,
    EpButton,
    EpOsaamismerkkiKategoriaModal,
  },
})
export default class RouteOsaamismerkkiKategoriat extends Vue {
  @Prop({ required: true })
  private osaamismerkitStore!: OsaamismerkitStore;

  async mounted() {
    await this.osaamismerkitStore.fetchKategoriat();
  }

  get kategoriat() {
    return this.osaamismerkitStore.kategoriat.value;
  }

  get tableFields() {
    return [
      {
        key: 'nimi',
        label: this.$t('nimi'),
        sortable: false,
        thStyle: { width: '50%', borderBottom: '0px' },
        formatter: (value: any, key: any, item: any) => {
          return (this as any).$kaanna(value);
        },
      }, {
        key: 'muokattu',
        label: this.$t('muokattu'),
        sortable: true,
        thStyle: { width: '50%', borderBottom: '0px' },
        formatter: (value: any, key: any, item: any) => {
          return (this as any).$sdt(value);
        },
      },
    ];
  }

  avaaKategoriaModal(kategoria: OsaamismerkkiKategoriaDto) {
    (this as any).$refs['osaamismerkkiKategoriaModal'].muokkaa(kategoria);
  }
};
</script>

<style lang="scss" scoped>

</style>
