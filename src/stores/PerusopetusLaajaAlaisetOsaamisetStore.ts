import { reactive, computed } from 'vue';

import _ from 'lodash';
import { LaajaalainenOsaaminenDto, PerusopetuksenPerusteenSisalto } from '@shared/api/eperusteet';

export class PerusopetusLaajaAlaisetOsaamisetStore {
  constructor(private perusteId: number) {
    this.fetch();
  }

  public state = reactive({
    laajaAlaisetOsaamiset: null as LaajaalainenOsaaminenDto[] | null,
  });

  public readonly laajaAlaisetOsaamiset = computed(() => this.state.laajaAlaisetOsaamiset);

  public async fetch() {
    this.state.laajaAlaisetOsaamiset = (await PerusopetuksenPerusteenSisalto.getOsaamiset(this.perusteId)).data;
  }
}
