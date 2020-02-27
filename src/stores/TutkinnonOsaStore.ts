import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { TutkinnonOsaViiteDto, TutkinnonRakenne } from '@shared/api/eperusteet';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class TutkinnonOsaStore {
  private state = reactive({
    tutkinnonOsat: null as TutkinnonOsaViiteDto[] | null,
  });

  public readonly tutkinnonOsat = computed(() => this.state.tutkinnonOsat);

  async init(projektiId: number, suoritustapakoodit: string[]) {
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
}
