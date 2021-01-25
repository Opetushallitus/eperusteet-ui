import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';

import { PalauteDto, Palautteet } from '@shared/api/eperusteet';

Vue.use(VueCompositionApi);

export const ITEMS_PER_PAGE = 10;

export class PalautteetStore {
  public state = reactive({
    palautteet: null as PalauteDto[] | null,
    paginated: null as PalauteDto[][] | null,
  })

  public readonly palautteet = computed(() => this.state.palautteet);
  public readonly paginated = computed(() => this.state.paginated);

  public async fetch() {
    const { data } = await Palautteet.palautteet();
    let pageItemsMaxCount = ITEMS_PER_PAGE;
    let page = 0;
    let paginated = [
      new Array<PalauteDto>()
    ];

    ((data as unknown) as PalauteDto[]).forEach((item: PalauteDto, i: number) => {
      if (i + 1 === pageItemsMaxCount) {
        pageItemsMaxCount = pageItemsMaxCount + ITEMS_PER_PAGE;
        page++;
        paginated = [
          ...paginated,
          new Array<PalauteDto>()
        ]
      }

      if (i < pageItemsMaxCount) {
        paginated[page].push(item)
      }
    });

    this.state.palautteet = (data as unknown) as PalauteDto[];
    this.state.paginated = paginated;
  }
}
