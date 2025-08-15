import Vue from 'vue';
import { Router } from 'vue-router';
import { reactive, computed } from 'vue';
import { Matala, Perusteenosat, Sisallot, PerusteDtoTyyppiEnum, Laaja } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { requiredOneLang } from '@shared/validators/required';
import { PerusteenOsaDto } from '@shared/generated/eperusteet';
import { App } from 'vue';

interface TekstikappaleStoreConfig {
  perusteStore: PerusteStore;
  router: Router;
}

export class TekstikappaleStore implements IEditoitava {
  private state = reactive({
    tekstikappale: null as Laaja | PerusteenOsaDto | null,
  });

  private static config: TekstikappaleStoreConfig;

  public static install(app: App, config: TekstikappaleStoreConfig) {
    TekstikappaleStore.config = config;
  }

  public readonly tekstikappale = computed(() => this.state.tekstikappale);
  public readonly id = computed(() => this.state.tekstikappale?.id);

  constructor(
    private readonly perusteId: number,
    private readonly tekstiKappaleViiteId: number,
    public versionumero?: number,
  ) {
    // if (!TekstikappaleStore.config?.notifikaatiotStore) {
    //   throw new Error('NotifikaatiotStore missing');
    // }
    if (!TekstikappaleStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!TekstikappaleStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async fetch() {
    if (this.versionumero) {
      const revisions = (await Perusteenosat.getPerusteenOsaViiteVersiot(this.tekstiKappaleViiteId)).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      this.state.tekstikappale = (await Perusteenosat.getPerusteenOsaVersioByViite(this.tekstiKappaleViiteId, rev.numero)).data;
    }
    else {
      this.state.tekstikappale = (await Perusteenosat.getPerusteenOsatByViite(this.tekstiKappaleViiteId)).data;
    }
  }

  public async load() {
    await this.fetch();
    return {
      ...this.tekstikappale,
      originalNimi: (this.tekstikappale as any).nimi,
    };
  }

  public async save(data: Matala) {
    const res = await Perusteenosat.updatePerusteenOsaPerusteella(this.tekstiKappaleViiteId, this.perusteId, this.state.tekstikappale!.id!, data);

    if ((data as any)?.liite === (this.state.tekstikappale! as any)?.liite) {
      TekstikappaleStore.config!.perusteStore!.updateNavigationEntry({
        id: this.tekstiKappaleViiteId,
        label: (res.data as any).nimi as any,
      });
    }
    else {
      await TekstikappaleStore.config!.perusteStore!.updateNavigation();
    }

    return res.data;
  }

  public async history() {
  }

  public async cancel() {
    // Noop
  }

  public async remove() {
    await Sisallot.removeSisaltoViite(this.perusteId, TekstikappaleStore.config.perusteStore.perusteSuoritustapa.value!, this.tekstiKappaleViiteId);
    TekstikappaleStore.config!.perusteStore!.removeNavigationEntry({
      id: this.tekstiKappaleViiteId,
    });
  }

  public async lock() {
    try {
      const res = await Perusteenosat.checkPerusteenOsaLock(this.state.tekstikappale!.id!);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    const res = await Perusteenosat.lockPerusteenOsa(this.state.tekstikappale!.id!);
    return res.data;
  }

  public async release() {
    await Perusteenosat.unlockPerusteenOsa(this.state.tekstikappale!.id!);
  }

  public async preview() {
    return null;
  }

  public readonly validator = computed(() => {
    return {
      nimi: requiredOneLang(),
    };
  });

  public async editAfterLoad() {
    return false;
  }

  public async start() {
    // Noop
  }

  public async revisions() {
    const res = await Perusteenosat.getPerusteenOsaVersiot(this.state.tekstikappale!.id!);
    return res.data as Revision[];
  }

  public async restore(rev: number) {
    await this.acquire();
    await Perusteenosat.revertPerusteenOsaToVersio(this.state.tekstikappale!.id!, rev);
    await this.release();
  }

  public async validate() {
    return {
      valid: true,
    };
  }

  public async create(otsikko, tekstikappaleIsa, osaamisala) {
    let suoritustapakoodi;
    if (_.lowerCase(TekstikappaleStore.config.perusteStore.peruste.value?.tyyppi) === _.lowerCase(PerusteDtoTyyppiEnum.OPAS)) {
      suoritustapakoodi = 'opas';
    }
    else {
      suoritustapakoodi = _.get(_.head(TekstikappaleStore.config.perusteStore.peruste.value?.suoritustavat), 'suoritustapakoodi');
    }

    if (!suoritustapakoodi) {
      suoritustapakoodi = 'reformi';
    }

    if (TekstikappaleStore.config.perusteStore.perusteId.value && suoritustapakoodi) {
      if (_.isEmpty(tekstikappaleIsa)) {
        if (TekstikappaleStore.config.perusteStore.perusteId.value && suoritustapakoodi) {
          const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
            TekstikappaleStore.config.perusteStore.perusteId.value,
            suoritustapakoodi,
            {
              perusteenOsa: {
                nimi: otsikko,
                osanTyyppi: 'tekstikappale',
                osaamisala,
              } as any,
            },
          ));
          return tallennettu.data;
        }
      }
      else {
        const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
          TekstikappaleStore.config.perusteStore.perusteId.value,
          suoritustapakoodi,
          tekstikappaleIsa.id,
          {
            perusteenOsa: {
              nimi: otsikko,
              osanTyyppi: 'tekstikappale',
              osaamisala,
            } as any,
          }));

        return tallennettu.data;
      }
    }
  }
}
