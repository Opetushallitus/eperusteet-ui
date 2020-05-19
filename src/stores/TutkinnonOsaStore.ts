import Vue from 'vue';
import VueCompositionApi, { watch, reactive, computed } from '@vue/composition-api';
import { TutkinnonOsaViiteDto, TutkinnonRakenne } from '@shared/api/eperusteet';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from './PerusteStore';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class TutkinnonOsaStore implements IEditoitava {
  constructor(
    private perusteStore: PerusteStore,
  ) { }

  private state = reactive({
    tutkinnonOsat: null as TutkinnonOsaViiteDto[] | null,
  });

  public readonly tutkinnonOsat = computed(() => this.state.tutkinnonOsat);

  public async fetch() {
    const perusteId = this.perusteStore.perusteId.value;
    const st = this.perusteStore.suoritustavat.value;
    if (perusteId && st) {
      await this.init(perusteId, st);
    }
  }

  public async init(projektiId: number, suoritustapakoodit: readonly string[]) {
    if (!_.isEmpty(suoritustapakoodit)) {
      const tutkinnonosat = _.chain(await Promise.all(
        _.map(suoritustapakoodit, suoritustapakoodi => TutkinnonRakenne.getPerusteenTutkinnonOsat(projektiId, (suoritustapakoodi as any)))))
        .map('data')
        .flatMap()
        .value();
      this.state.tutkinnonOsat = tutkinnonosat;
    }
    else {
      this.state.tutkinnonOsat = [];
    }
  }

  public async load() {
    await this.fetch();
    return this.tutkinnonOsat.value;
  }

  public async save(data: any[]) {
    const perusteId = this.perusteStore.perusteId.value;
    const st = this.perusteStore.suoritustavat.value[0] as any;
    const payload = _.map(data, (tosa, idx) => ({
      id: tosa.id,
      jarjestys: idx,
    }));
    const res = await TutkinnonRakenne.sortPerusteenOsaViitteet(perusteId!, st, payload);
    return res.data;
  }

  public async editAfterLoad() {
    return false;
  }

  public async preview() {
    return null;
  }

  public features() {
    return computed(() => ({
      editable: false,
    }));
  }
}
