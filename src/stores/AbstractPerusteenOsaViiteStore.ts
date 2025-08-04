import Vue from 'vue';
import { computed, reactive, unref } from 'vue';
import { Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import _ from 'lodash';
import { PerusteStore } from '@/stores/PerusteStore';
import { Router } from 'vue-router';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { App } from 'vue';

interface AbstractPerusteenOsaViiteStoreStoreConfig {
  perusteStore: PerusteStore;
  router: Router;
}

export abstract class AbstractPerusteenOsaViiteStore implements IEditoitava {
  protected static config: AbstractPerusteenOsaViiteStoreStoreConfig;

  public static install(app: App, config: AbstractPerusteenOsaViiteStoreStoreConfig) {
    AbstractPerusteenOsaViiteStore.config = config;
  }

  private state = reactive({
    perusteenOsaId: null as number | null,
  });

  public readonly perusteenOsaId = computed(() => this.state.perusteenOsaId);

  public constructor(
    public perusteId?: number,
    public perusteenOsaViiteId?: number,
    public versionumero?: number) {
    if (!AbstractPerusteenOsaViiteStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!AbstractPerusteenOsaViiteStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async load(supportDataProvider?) {
    return this.fetchPerusteenOsat();
  }

  public async fetchPerusteenOsat() {
    try {
      let perusteenOsa;
      if (this.versionumero && this.perusteenOsaViiteId) {
        const revisions = (await Perusteenosat.getPerusteenOsaViiteVersiot(this.perusteenOsaViiteId)).data as Revision[];
        const rev = revisions[revisions.length - this.versionumero];
        perusteenOsa = (await Perusteenosat.getPerusteenOsaVersioByViite(this.perusteenOsaViiteId, rev.numero)).data;
        this.state.perusteenOsaId = perusteenOsa.id;
      }
      else {
        perusteenOsa = (await Perusteenosat.getPerusteenOsatByViite(this.perusteenOsaViiteId!)).data;
        this.state.perusteenOsaId = perusteenOsa.id;
      }
      return perusteenOsa;
    }
    catch (err) {
      console.error(err);
    }
  }

  public async save(data: any) {
    if (data.nimiKoodi) {
      data.nimi = data.nimiKoodi.nimi;
    }
    const res = await Perusteenosat.updatePerusteenOsa(this.state.perusteenOsaId!, data);

    AbstractPerusteenOsaViiteStore.config.perusteStore!.updateNavigationEntry({
      id: this.perusteenOsaViiteId!,
      label: (res.data as any).nimi as any,
    });
    return res.data;
  }

  public async remove() {
    await Sisallot.removeSisaltoViite(this.perusteId!, AbstractPerusteenOsaViiteStore.config.perusteStore.perusteSuoritustapa.value!, this.perusteenOsaViiteId!);
    AbstractPerusteenOsaViiteStore.config!.perusteStore!.removeNavigationEntry({
      id: this.perusteenOsaViiteId!,
    });
    AbstractPerusteenOsaViiteStore.config.router.push({ name: 'perusteprojekti' });
  }

  public async create(otsikko?, tekstikappaleIsa?) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: this.getOsanType(),
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        AbstractPerusteenOsaViiteStore.config.perusteStore.perusteId.value as number,
        AbstractPerusteenOsaViiteStore.config.perusteStore.perusteSuoritustapa.value as any,
        perusteenOsa,
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        AbstractPerusteenOsaViiteStore.config.perusteStore.perusteId.value as number,
        AbstractPerusteenOsaViiteStore.config.perusteStore.perusteSuoritustapa.value as any,
        tekstikappaleIsa.id,
        perusteenOsa,
      ));
      return tallennettu.data;
    }
  }

  public async lock() {
    try {
      const res = await Perusteenosat.checkPerusteenOsaLock(this.state.perusteenOsaId!);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    const res = await Perusteenosat.lockPerusteenOsa(this.state.perusteenOsaId!);
    return res.data;
  }

  public async release() {
    await Perusteenosat.unlockPerusteenOsa(this.state.perusteenOsaId!);
  }

  public async revisions() {
    const res = await Perusteenosat.getPerusteenOsaVersiot(this.state.perusteenOsaId!);
    return res.data as Revision[];
  }

  public async restore(rev: number) {
    await this.acquire();
    await Perusteenosat.revertPerusteenOsaToVersio(this.state.perusteenOsaId!, rev);
    await this.release();
  }

  public abstract getOsanType();

  public async preview() {
    return null;
  }

  public async editAfterLoad() {
    return false;
  }

  public async start() {
  }

  public async history() {
  }

  public async cancel() {
  }
}
