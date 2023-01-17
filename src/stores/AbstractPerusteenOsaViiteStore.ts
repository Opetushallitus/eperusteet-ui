import Vue from 'vue';
import VueCompositionApi, { computed, reactive } from '@vue/composition-api';
import { Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export abstract class AbstractPerusteenOsaViiteStore {
  private state = reactive({
    perusteenOsaId: null as number | null,
  });

  public readonly perusteenOsaId = computed(() => this.state.perusteenOsaId);

  protected constructor(
    public perusteId?: number,
    public perusteenOsaViiteId?: number,
    public versionumero?: number,
    public config?: any) {
    if (!this.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!this.config?.router) {
      throw new Error('VueRouter missing');
    }
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
    const res = await Perusteenosat.updatePerusteenOsa(this.perusteenOsaId.value!, data);

    this.config.perusteStore!.updateNavigationEntry({
      id: this.perusteenOsaViiteId!,
      type: '',
      label: (res.data as any).nimi as any,
    });
    return res.data;
  }

  public async remove() {
    await Sisallot.removeSisaltoViite(this.perusteId!, this.config?.perusteStore.perusteSuoritustapa.value!, this.perusteenOsaViiteId!);
    this.config!.perusteStore!.removeNavigationEntry({
      id: this.perusteenOsaViiteId!,
      type: '',
    });
    this.config.router.push({ name: 'perusteprojekti' });
  }

  public async create(otsikko, tekstikappaleIsa) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: this.getOsanType(),
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        this.config.perusteStore.perusteId.value!,
        this.config?.perusteStore.perusteSuoritustapa.value!,
        perusteenOsa
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        this.config.perusteStore.perusteId.value!,
        this.config?.perusteStore.perusteSuoritustapa.value!,
        tekstikappaleIsa.id,
        perusteenOsa
      ));
      return tallennettu.data;
    }
  }

  public async lock() {
    try {
      const res = await Perusteenosat.checkPerusteenOsaLock(this.perusteenOsaId.value!);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    const res = await Perusteenosat.lockPerusteenOsa(this.perusteenOsaId.value!);
    return res.data;
  }

  public async release() {
    await Perusteenosat.unlockPerusteenOsa(this.perusteenOsaId.value!);
  }

  public async revisions() {
    const res = await Perusteenosat.getPerusteenOsaVersiot(this.perusteenOsaId.value!);
    return res.data as Revision[];
  }

  public async restore(rev: number) {
    await this.acquire();
    await Perusteenosat.revertPerusteenOsaToVersio(this.perusteenOsaId.value!, rev);
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
