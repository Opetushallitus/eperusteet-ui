import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Api, TutkinnonRakenne, Perusteet } from '@shared/api/eperusteet';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';

Vue.use(VueCompositionApi);

interface MuodostuminenStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class MuodostuminenStore implements IEditoitava {
  private static config: MuodostuminenStoreConfig;

  public static install(vue: typeof Vue, config: MuodostuminenStoreConfig) {
    MuodostuminenStore.config = config;
  }

  constructor(private readonly perusteId: number) {
    if (!MuodostuminenStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!MuodostuminenStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async load() {
    let data;
    let peruste;
    [peruste, data] = _.map(await (Promise.all([
      Perusteet.getPerusteenTiedot(this.perusteId),
      TutkinnonRakenne.getRakenne(this.perusteId, MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!),
    ])), 'data');
    return {
      rakenne: {
        ...data,
        muodostumisSaanto: data.muodostumisSaanto || {
          laajuus: {
            minimi: 0,
          },
        },
      },
      osaamisalat: peruste.osaamisalat || [],
      tutkintonimikkeet: peruste.tutkintonimikkeet || [],
    };
  }

  public async save(data) {
    const rakenne = data.rakenne;
    if (rakenne?.muodostumisSaanto?.laajuus) {
      rakenne.muodostumisSaanto.laajuus.maksimi = rakenne.muodostumisSaanto.laajuus.minimi;
    }

    await Perusteet.updateOsaamisalat(this.perusteId, data.osaamisalat);
    await Perusteet.updateTutkintonimikkeet(this.perusteId, data.tutkintonimikkeet);
    await TutkinnonRakenne.updatePerusteenRakenne(this.perusteId, MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!, rakenne as any);
  }

  public readonly validator = computed(() => {
    return {
    };
  });

  public async history() {
  }

  public async cancel() {
    // Noop
  }

  public async remove() {
  }

  public async lock() {
    try {
      const res = await Api.get(`/perusteet/${this.perusteId}/suoritustavat/${MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!}/rakenne/lukko`);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    const res = await Api.post(`/perusteet/${this.perusteId}/suoritustavat/${MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!}/rakenne/lukko`, {
      osanId: this.perusteId,
      suoritustapa: MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!,
    });
    return res.data;
  }

  public async release() {
    await Api.delete(`/perusteet/${this.perusteId}/suoritustavat/${MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!}/rakenne/lukko`);
  }

  public async preview() {
    return null;
  }

  public async editAfterLoad() {
    return false;
  }

  public async start() {
  }

  public async revisions() {
    const res = await TutkinnonRakenne.getRakenneVersiot(this.perusteId, MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!);
    return res.data as any;
  }

  public async restore(rev: number) {
    await TutkinnonRakenne.revertRakenneVersio(this.perusteId, MuodostuminenStore.config?.perusteStore.perusteSuoritustapa.value!, rev);
  }

  public async validate() {
    return {
      valid: true,
    };
  }
}
