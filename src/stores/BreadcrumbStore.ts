import { reactive, computed } from 'vue';
import { Oppaat, OpasLuontiDto, PerusteHakuDto } from '@shared/api/eperusteet';
import { debounced } from '@shared/utils/delay';
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

  public update = debounced(async (value: Breadcrumb[]) => {
    this.state.crumbs = value;
  }, 10);
}
