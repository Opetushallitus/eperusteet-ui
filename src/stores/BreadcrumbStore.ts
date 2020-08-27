import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Oppaat, OpasLuontiDto, PerusteHakuDto } from '@shared/api/eperusteet';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';

Vue.use(VueCompositionApi);

interface Breadcrumb {
  label: string;
  route: Location;
}

export class BreadcrumbStore {
  private state = reactive({
    crumbs: [] as Breadcrumb[],
  })

  public readonly breacrumbs = computed(() => this.state.crumbs);

  @Debounced(10)
  public async update(value: Breadcrumb[]) {
    this.state.crumbs = value;
  }
}
