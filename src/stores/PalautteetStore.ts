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

  public async fetch(sortDesc = true) {
    this.state.palautteet = null;
    const { data } = await Palautteet.palautteet();
    const palauteData = (data as unknown) as PalauteDto[];
    const sortedData = sortDesc ? _.chain(palauteData)
      .sortBy('created-at')
      .reverse()
      .value() : palauteData;

    this.state.palautteet = sortedData;
    this.state.paginated = this.paginateData(sortedData);
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
}
