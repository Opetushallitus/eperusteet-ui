import Vue, { computed, reactive } from 'vue';
import { TutkinnonOsaViiteDto, TutkinnonRakenne } from '@shared/api/eperusteet';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from './PerusteStore';
import _ from 'lodash';
import { unref } from 'vue';

export class TutkinnonOsaStore implements IEditoitava {
  constructor(
    private perusteStore: PerusteStore,
  ) { }

  private state = reactive({
    tutkinnonOsat: null as TutkinnonOsaViiteDto[] | null,
  });

  public readonly tutkinnonOsat = computed(() => this.state.tutkinnonOsat);

  public async fetch() {
    const perusteId = unref(this.perusteStore.perusteId);
    const st = unref(this.perusteStore.suoritustavat);
    if (perusteId && st) {
      this.state.tutkinnonOsat = null;
      await this.init(perusteId, st);
    }
  }

  public async init(projektiId: number, suoritustapakoodit: readonly string[]) {
    if (!_.isEmpty(suoritustapakoodit)) {
      const tutkinnonosat = _.chain(await Promise.all(
        _.map(suoritustapakoodit, suoritustapakoodi => TutkinnonRakenne.getPerusteenTutkinnonOsat(projektiId, (suoritustapakoodi as any)))))
        .map('data')
        .flatMap()
        .sortBy('jarjestys')
        .value();
      this.state.tutkinnonOsat = tutkinnonosat;
    }
    else {
      this.state.tutkinnonOsat = [];
    }
  }

  public async load() {
    await this.fetch();
    return this.state.tutkinnonOsat;
  }

  public async save(data: any[]) {
    const perusteId = unref(this.perusteStore.perusteId);
    const st = unref(this.perusteStore.suoritustavat)[0] as any;
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
