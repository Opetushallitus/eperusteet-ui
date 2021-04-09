<template>
  <div>
    <template v-if="palautteet">
      <div class="w-100 text-right">
        <b-form-checkbox v-model="showDeleted" v-if="palautteet.length > 0" switch>
          {{$t('nayta-arkistoidut')}}
        </b-form-checkbox>
      </div>

      <b-table
        v-if="palautteetFiltered.length > 0"
        striped
        :items="palautteetFiltered"
        :fields="fields"
        :per-page="perPage"
        :current-page="currentPage"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc">
        <template #table-colgroup="scope">
          <col
            v-for="{ key } in scope.fields"
            :key="key"
            :style="{
              width: key === Review.FEEDBACK ? '70%' : 'auto',
            }">
        </template>
        <template v-slot:cell(stars)="{ item }">
          <div
            class="d-flex align-items-center justify-content-start my-2">
            <fas
              v-for="rating in ratings"
              :key="rating"
              icon="tahti-taytetty"
              class="icon-tahti fa-lg ml-1"
              :class="{ 'icon-tahti--active': rating <= item[Review.STARS] }" />
          </div>
        </template>
        <template v-slot:cell(status)="{ item }">
            <EpMultiSelect
              v-if="item.status !== 'POISTETTU'"
              :disabled="item.updating"
              :options="tilaOptions"
              :searchable="false"
              :allowEmpty="false"
              openDirection="bottom"
              v-model="item.status"
              @input="paivitaStatus(item, item.status)">
              <template slot="singleLabel" slot-scope="{ option }">
                <span class="text-nowrap">
                  <EpColorIndicator :backgroundColor="statusColor[option]"/>
                  <span class="ml-2">{{ $t('palaute-status-' + option.toLowerCase()) }}</span>
                </span>
              </template>
              <template slot="option" slot-scope="{ option }">
                <span class="text-nowrap">
                  <EpColorIndicator :backgroundColor="statusColor[option]"/>
                  <span class="ml-2">{{ $t('palaute-status-' + option.toLowerCase()) }}</span>
                </span>
              </template>

            </EpMultiSelect>
            <span v-else>
              {{$t('poistettu')}}
            </span>
        </template>
        <template v-slot:cell(delete)="{ item }">
          <div v-if="item.status !== 'POISTETTU'">
             <fas
                icon="roskalaatikko"
                class="default-icon clickable mt-2"
                @click="paivitaStatus(item, 'POISTETTU')"/>
          </div>
        </template>
      </b-table>
      <p v-else>Ei palautteita</p>
    </template>
    <ep-spinner v-else />
    <b-pagination
      v-model="currentPage"
      :total-rows="totalItems"
      :per-page="perPage"
      align="center" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BvTableFieldArray } from 'bootstrap-vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { ITPalauteProvider } from '@shared/stores/types';
import * as _ from 'lodash';
import { PalauteDto, PalauteDtoStatusEnum } from '@shared/api/eperusteet';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { Kielet } from '@shared/stores/kieli';

enum Review {
  STARS = 'stars',
  FEEDBACK = 'feedback',
  CREATED = 'created-at',
  STATUS = 'status',
  DELETE = 'delete',
}

@Component({
  components: {
    EpSpinner,
    EpColorIndicator,
    EpMultiSelect,
  },
})
export default class EpPalautteet extends Vue {
  @Prop({ required: true })
  private palautteet!: PalauteDto[];

  @Prop({ required: true })
  private palauteProvider!: ITPalauteProvider;

  private currentPage = 1;
  private perPage = 10;
  private sortBy = Review.CREATED;
  private sortDesc = true;
  private showDeleted = false;

  ratings = Array.from({ length: 5 }, (_v, k) => k + 1);
  Review = Review;

  get averageReview() {
    return (this.palautteetFiltered.reduce((acc, curr) => acc + (curr[Review.STARS] || 0), 0) / this.palautteetFiltered.length).toFixed(2);
  }

  get palautteetFiltered() {
    return _.filter(this.palautteet, palaute => this.showDeleted || palaute.status !== PalauteDtoStatusEnum.POISTETTU);
  }

  get fields(): BvTableFieldArray {
    return [{
      key: Review.STARS,
      label: `${this.$t('palaute-arviointi') as string} (${this.$t('ka-keskiarvo')} ${this.averageReview})`,
      sortable: true,
      thStyle: { width: '200px' },
    }, {
      key: Review.FEEDBACK,
      sortable: true,
      label: this.$t('palaute') as string,
    }, {
      key: Review.CREATED,
      sortable: true,
      label: this.$t('pvm') as string,
      formatter: (_value: any, _key: string, item: any) => {
        return this.$sd(item![Review.CREATED]);
      },
    }, {
      key: Review.STATUS,
      sortable: true,
      label: this.$t('tila') as string,
      thStyle: { width: '300px' },
      sortByFormatted: true,
      formatter: (_value: any, _key: string, item: any) => {
        return this.statusSort[item.status];
      },
    }, {
      key: Review.DELETE,
      label: '',
    }];
  }

  get totalItems() {
    return this.palautteetFiltered?.length || 0;
  }

  async paivitaStatus(palaute, status) {
    try {
      if (status === 'POISTETTU'
          && !(await this.$bvModal.msgBoxConfirm(
            this.$t('vahvista-palaute-poisto') as string, {
              title: Kielet.kaannaOlioTaiTeksti('vahvista-arkistointi'),
              okTitle: Kielet.kaannaOlioTaiTeksti('arkistoi'),
              cancelTitle: Kielet.kaannaOlioTaiTeksti('peruuta'),
              cancelVariant: 'link',
              centered: true,
            }))) {
        return;
      }

      await this.palauteProvider.updatePalaute?.({
        ...palaute,
        status,
      });
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
  }

  get tilaOptions() {
    return [
      PalauteDtoStatusEnum.SAAPUNUT,
      PalauteDtoStatusEnum.JATKOKEHITYS,
      PalauteDtoStatusEnum.HYLATTY,
    ];
  }

  get statusColor() {
    return {
      [PalauteDtoStatusEnum.SAAPUNUT]: '#FFD900',
      [PalauteDtoStatusEnum.JATKOKEHITYS]: '#447F13',
      [PalauteDtoStatusEnum.HYLATTY]: '#B2B2B2',
    };
  }

  get statusSort() {
    return {
      [PalauteDtoStatusEnum.SAAPUNUT]: 1,
      [PalauteDtoStatusEnum.JATKOKEHITYS]: 2,
      [PalauteDtoStatusEnum.HYLATTY]: 3,
      [PalauteDtoStatusEnum.POISTETTU]: 4,
    };
  }
}
</script>

<style scoped lang="scss">
  @import '@shared/styles/_variables.scss';

  .icon-tahti {
    font-size: 1rem;
    color: $gray-lighten-11;

    &--active {
      color: $yellow;
    }
  }

  ::v-deep .b-table thead th {
    &,
    &:active,
    &:focus,
    &:focus-within {
      border-bottom: 2px solid $gray-lighten-3 !important;
    }

    &[aria-sort] {
      &:active,
      &:focus,
      &:focus-within {
        border-bottom: 2px solid $black !important;
      }
    }
  }
</style>
