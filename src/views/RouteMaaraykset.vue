<template>
  <ep-main-view :tutoriaaliStore="tutoriaaliStore">
    <template slot="icon">
      <ep-icon class="float-right" icon="luo-uusi">
      </ep-icon>
    </template>
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t('maaraykset') }}</h1>
        <EpMaaraysModal
          ref="epmaaraysmodal"
          :maarayksetStore="maarayksetStore"
          :oikeustarkastelu="{oikeus:'hallinta'}" />
      </div>
    </template>

    <ep-spinner v-if="!maaraykset" />

    <div v-else-if="maaraykset.length === 0">
      {{$t('ei-maarayksia')}}
    </div>

    <div v-else>
      <div class="mb-3">{{$t('ammatillisen-koulutuksen-valtakunnalliset-maaraykset-pdf-formaatissa')}}</div>
      <ep-search v-model="nimiFilter" :placeholder="$t('etsi-maarayksia')"/>

      <b-table
        class="mt-3"
        responsive
        borderless
        striped
        fixed
        hover
        :items="maarayksetFiltered"
        :fields="tableFields"
        :per-page="perPage"
        @row-clicked="avaaMaarays">

      <template v-slot:cell(nimi)="{ item }">
        <div class="nimi">{{$kaanna(item.nimi)}}</div>
      </template>

      </b-table>
    </div>

  </ep-main-view>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Prop, Component, Vue } from 'vue-property-decorator';
import { MaarayksetStore } from '@/stores/MaarayksetStore';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { TutoriaaliStore } from '@shared/stores/tutoriaali';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { MaaraysDto } from '@shared/api/eperusteet';
import EpMaaraysModal from '@/components/EpMaarays/EpMaaraysModal.vue';
import { Kielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpIcon,
    EpMainView,
    EpSearch,
    EpSpinner,
    EpMaaraysModal,
    EpButton,
  },
})
export default class RouteMaaraykset extends Vue {
  @Prop({ required: true })
  private maarayksetStore!: MaarayksetStore;

  @Prop({ required: true })
  private tutoriaaliStore!: TutoriaaliStore;

  private perPage = 10;
  private nimiFilter = ''

  async mounted() {
    await this.maarayksetStore.fetch();
  }

  get maaraykset() {
    return this.maarayksetStore.maaraykset.value;
  }

  get maarayksetFiltered() {
    return _.filter(this.maarayksetStore.maaraykset.value, maarays => Kielet.search(this.nimiFilter, maarays.nimi));
  }

  avaaMaarays(maarays: MaaraysDto) {
    (this as any).$refs['epmaaraysmodal'].muokkaa(maarays);
  }

  get tableFields() {
    return [{
      key: 'nimi',
      label: this.$t('maarayksen-nimi'),
      sortable: true,
      sortByFormatted: true,
      thStyle: { width: '80%' },
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$kaanna(value);
      },
    }, {
      key: 'muokattu',
      label: this.$t('julkaistu'),
      sortable: true,
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$sd(value);
      },
    },
    ];
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.nimi {
  color: $paletti-blue;
}

</style>
