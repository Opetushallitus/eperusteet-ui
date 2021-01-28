<template>
  <EpMainView>
    <h2 aria-level="1" class="mb-4">{{ $t('palautteet-otsikko') }}</h2>
    <template v-if="palautteet">
      <b-table
        v-if="palautteet.length > 0"
        striped
        responsive
        :items="currentPagePalautteet"
        :fields="fields"
        @sort-changed="sortingChanged">
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
      </b-table>
      <p v-else>Ei palautteita</p>
    </template>
    <ep-spinner v-else />
    <ep-pagination
      v-model="page"
      :per-page="perPage"
      :total-rows="totalItems"/>
  </EpMainView>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { BvTableFieldArray } from 'bootstrap-vue';

import { ITEMS_PER_PAGE, PalautteetStore } from '@/stores/PalautteetStore';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

enum Review {
  STARS = 'stars',
  FEEDBACK = 'feedback',
  CREATED = 'created-at'
}

@Component({
  components: {
    EpMainView,
    EpSpinner,
    EpPagination,
  },
})
export default class RoutePalautteet extends Vue {
  @Prop({ required: true })
  palautteetStore!: PalautteetStore;

  private currentPage = 0;

  ratings = Array.from({ length: 5 }, (_v, k) => k + 1);
  Review = Review;

  async mounted() {
    await this.palautteetStore.fetch();
  }

  sortingChanged({ sortDesc }: { sortDesc: boolean }) {
    this.palautteetStore.sortData(sortDesc);
  }

  get palautteet() {
    return this.palautteetStore.palautteet.value;
  }

  get currentPagePalautteet() {
    return this.palautteetStore.paginated.value?.[this.currentPage];
  }

  get averageReview() {
    return (this.palautteet!.reduce((acc, curr) => acc + (curr[Review.STARS] || 0), 0) / this.palautteet!.length).toFixed(2);
  }

  get fields(): BvTableFieldArray {
    return [{
      key: Review.STARS,
      label: `${this.$t('arviointi') as string} (${this.$t('ka-keskiarvo')} ${this.averageReview})`,
      sortable: false,
    }, {
      key: Review.FEEDBACK,
      sortable: false,
      label: this.$t('palaute') as string,
    }, {
      key: Review.CREATED,
      sortable: true,
      label: this.$t('pvm') as string,
      formatter: (_value: any, _key: string, item: any) => {
        return this.$sd(item![Review.CREATED]);
      },
    }];
  }

  get page() {
    return this.currentPage + 1;
  }

  set page(value: number) {
    this.currentPage = value - 1;
  }

  get perPage() {
    return ITEMS_PER_PAGE;
  }

  get totalItems() {
    return this.palautteet?.length || 0;
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
