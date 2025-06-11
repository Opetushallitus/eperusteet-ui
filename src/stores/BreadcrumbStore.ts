import { reactive, computed } from 'vue';
import { Oppaat, OpasLuontiDto, PerusteHakuDto } from '@shared/api/eperusteet';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';

interface Breadcrumb {
  label: string;
  route: Location;
}

export class BreadcrumbStore {
  private state = reactive({
    crumbs: [] as Breadcrumb[],
  });

  public readonly breacrumbs = computed(() => this.state.crumbs);

  @Debounced(10)
  public async update(value: Breadcrumb[]) {
    this.state.crumbs = value;
  }
}
