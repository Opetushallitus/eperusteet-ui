import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';

import * as _ from 'lodash';

import { PalauteDto, Palautteet } from '@shared/api/eperusteet';

Vue.use(VueCompositionApi);

export const ITEMS_PER_PAGE = 18;

export class PalautteetStore {
  public state = reactive({
    palautteet: null as PalauteDto[] | null,
    paginated: null as PalauteDto[][] | null,
  })

  public readonly palautteet = computed(() => this.state.palautteet);
  public readonly paginated = computed(() => this.state.paginated);

  public async fetch() {
    const { data } = await Palautteet.palautteet();
    this.state.palautteet = this.sortDesc((data as unknown) as PalauteDto[]);
    this.state.paginated = this.paginateData(this.state.palautteet as PalauteDto[]);
  }

  public sortData(sortDesc: boolean) {
    const currentPalautteet = [...this.state.palautteet as PalauteDto[]];
    const sortedPalautteet = sortDesc ? this.sortDesc(currentPalautteet) : this.sortAsc(currentPalautteet);
    this.state.paginated = this.paginateData(sortedPalautteet);
  }

  private paginateData(data: PalauteDto[]): PalauteDto[][] {
    let pageItemsMaxCount = ITEMS_PER_PAGE;
    let page = 0;
    let paginated = [
      [] as PalauteDto[],
    ];

    data.forEach((item: PalauteDto, i: number) => {
      if (i + 1 === pageItemsMaxCount) {
        pageItemsMaxCount = pageItemsMaxCount + ITEMS_PER_PAGE;
        page++;
        paginated = [
          ...paginated,
          [],
        ];
      }

      if (i < pageItemsMaxCount) {
        paginated[page].push(item);
      }
    });

    return paginated;
  }

  private sortDesc(data: PalauteDto[]): PalauteDto[] {
    return _.chain(data)
    .sortBy('created-at')
    .reverse()
    .value();
  }

  private sortAsc(data: PalauteDto[]): PalauteDto[] {
    return _.chain(data)
    .sortBy('created-at')
    .value();
  }
}
