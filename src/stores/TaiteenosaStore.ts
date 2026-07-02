import { computed, reactive } from 'vue';
import * as _ from 'lodash';
import { Perusteenosat } from '@shared/api/eperusteet';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Revision } from '@shared/tyypit';
import { requiredOneLang } from '@shared/validators/required';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

export class TaiteenosaStore implements IEditoitava {
  private state = reactive({
    perusteenOsaId: null as number | null,
    taiteenala: null as any,
  });

  public constructor(
    public perusteId: number,
    public taiteenalaViiteId: number,
    public taiteenosaId: number,
    public versionumero?: number,
  ) {
    if (!AbstractPerusteenOsaViiteStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!AbstractPerusteenOsaViiteStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public readonly validator = computed(() => ({
    nimi: {
      ...requiredOneLang(),
    },
  }));

  public static async create(perusteId: number, taiteenalaViiteId: number, nimi: any) {
    const store = new TaiteenosaStore(perusteId, taiteenalaViiteId, 0);
    const taiteenala = await store.fetchTaiteenala();
    const vanhatIdt = _.map(taiteenala.taiteenOsat, 'id');
    await store.acquire();
    try {
      const taiteenOsat = [...(taiteenala.taiteenOsat || []), { nimi }];
      const res = await Perusteenosat.updatePerusteenOsa(taiteenala.id, {
        ...taiteenala,
        taiteenOsat,
      });
      const uusiTaiteenosa = _.find(res.data.taiteenOsat, (taiteenosa: any) => !_.includes(vanhatIdt, taiteenosa.id))
        || _.last(res.data.taiteenOsat);
      return { taiteenalaViiteId, uusiTaiteenosa };
    }
    finally {
      await store.release();
    }
  }

  public async load() {
    const taiteenala = await this.fetchTaiteenala();
    const taiteenosa = _.find(taiteenala.taiteenOsat, { id: this.taiteenosaId });
    if (!taiteenosa) {
      throw new Error('Taiteenosa not found');
    }
    if (!taiteenosa.tavoitteet) {
      taiteenosa.tavoitteet = [];
    }
    if (!taiteenosa.kuvaus) {
      taiteenosa.kuvaus = {};
    }
    return taiteenosa;
  }

  public async save(data: any) {
    const taiteenala = await this.fetchTaiteenala();
    const taiteenOsat = [...(taiteenala.taiteenOsat || [])];
    const index = _.findIndex(taiteenOsat, { id: this.taiteenosaId });
    if (index >= 0) {
      taiteenOsat[index] = { ...taiteenOsat[index], ...data };
    }
    await Perusteenosat.updatePerusteenOsa(taiteenala.id, {
      ...taiteenala,
      taiteenOsat,
    });
    AbstractPerusteenOsaViiteStore.config.perusteStore!.updateNavigationEntry({
      id: this.taiteenosaId,
      label: data.nimi,
    });
    return data;
  }

  public async remove() {
    const taiteenala = await this.fetchTaiteenala();
    await this.acquire();
    try {
      const taiteenOsat = (taiteenala.taiteenOsat || []).filter((taiteenosa: any) => taiteenosa.id !== this.taiteenosaId);
      await Perusteenosat.updatePerusteenOsa(taiteenala.id, {
        ...taiteenala,
        taiteenOsat,
      });
      AbstractPerusteenOsaViiteStore.config.perusteStore!.removeNavigationEntry({
        id: this.taiteenosaId,
      });
      await AbstractPerusteenOsaViiteStore.config.perusteStore!.updateNavigation();
      await AbstractPerusteenOsaViiteStore.config.router.push({
        name: 'taiteenala',
        params: {
          taiteenalaId: '' + this.taiteenalaViiteId,
        },
      });
    }
    finally {
      await this.release();
    }
  }

  public async lock() {
    try {
      const res = await Perusteenosat.checkPerusteenOsaLock(this.state.perusteenOsaId!);
      return res.data;
    }
    catch {
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

  public async editAfterLoad() {
    return false;
  }

  public async preview() {
    return null;
  }

  public async start() {
  }

  public async history() {
  }

  public async cancel() {
  }

  private async fetchTaiteenala() {
    let taiteenala;
    if (this.versionumero) {
      const revisions = (await Perusteenosat.getPerusteenOsaViiteVersiot(this.taiteenalaViiteId)).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      taiteenala = (await Perusteenosat.getPerusteenOsaVersioByViite(this.taiteenalaViiteId, rev.numero)).data;
    }
    else {
      taiteenala = (await Perusteenosat.getPerusteenOsatByViite(this.taiteenalaViiteId)).data;
    }
    this.state.perusteenOsaId = taiteenala.id;
    this.state.taiteenala = taiteenala;
    return taiteenala;
  }
}
