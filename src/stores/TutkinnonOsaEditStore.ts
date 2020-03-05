import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { TutkinnonOsaViiteUpdateDto, TutkinnonRakenne, TutkinnonosatPrivate, TutkinnonOsat, Perusteenosat, Sisallot, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import { Revision, Page } from '@shared/tyypit';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
// import { NotifikaatiotStore } from '@shared/stores/NotifikaatiotStore';

Vue.use(VueCompositionApi);


interface TutkinnonOsaEditStoreConfig {
  // notifikaatiotStore: NotifikaatiotStore;
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class TutkinnonOsaEditStore implements IEditoitava {
  private static config: TutkinnonOsaEditStoreConfig;
  private tutkinnonOsaId: number | null = null;

  public static install(config: TutkinnonOsaEditStoreConfig) {
    TutkinnonOsaEditStore.config = config;
  }

  constructor(
    private readonly perusteId: number,
    private readonly tutkinnonOsaViiteId: number,
  ) {
    // if (!TutkinnonOsaEditStore.config?.notifikaatiotStore) {
    //   throw new Error('NotifikaatiotStore missing');
    // }
    if (!TutkinnonOsaEditStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!TutkinnonOsaEditStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async load() {
    const res = await TutkinnonRakenne.getTutkinnonOsaViite(this.perusteId, 'REFORMI', this.tutkinnonOsaViiteId);
    this.tutkinnonOsaId = Number((res.data as any)._tutkinnonOsa);
    return res.data;
  }

  public async save(data: TutkinnonOsaViiteUpdateDto) {
    const res = await TutkinnonRakenne.updateTutkinnonOsa(
      this.perusteId,
      'REFORMI',
      this.tutkinnonOsaViiteId,
      data);
    return res.data;
  }

  public async history() {
  }

  public async cancel() {
    // Noop
  }

  public async remove() {
    await TutkinnonRakenne.removeTutkinnonOsa(this.perusteId, 'REFORMI', this.tutkinnonOsaViiteId);
    TutkinnonOsaEditStore.config!.perusteStore!.removeNavigationEntry({
      id: this.tutkinnonOsaViiteId,
      type: 'tutkinnonosa',
    });
    TutkinnonOsaEditStore.config.router.push({ name: 'tutkinnonosat' });
  }

  public async lock() {
    try {
      const res = await Perusteenosat.checkPerusteenOsaLock(this.tutkinnonOsaId!);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    const res = await Perusteenosat.lockPerusteenOsa(this.tutkinnonOsaId!);
    return res.data;
  }

  public async release() {
    await Perusteenosat.unlockPerusteenOsa(this.tutkinnonOsaId!);
  }

  public async preview() {
    return null;
  }

  public async editAfterLoad() {
    return false;
  }

  public async start() {
    // Noop
  }

  public async revisions() {
    const res = await TutkinnonosatPrivate.getViiteVersiot(this.tutkinnonOsaViiteId);
    return res.data as Revision[];
  }

  public async restore(rev: number) {
    await TutkinnonosatPrivate.revertToVersio(this.tutkinnonOsaViiteId, rev);
  }

  public async validate() {
    return {
      valid: true,
    };
  }
}
