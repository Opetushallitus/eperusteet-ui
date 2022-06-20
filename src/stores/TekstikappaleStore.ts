import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Matala, Perusteenosat, Sisallot, PerusteprojektiListausDto, PerusteDtoTyyppiEnum, Laaja } from '@shared/api/eperusteet';
import { Revision, Page } from '@shared/tyypit';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { translated } from '@shared/validators/required';
import { PerusteenOsaDto } from '@shared/generated/eperusteet';
// import { NotifikaatiotStore } from '@shared/stores/NotifikaatiotStore';

Vue.use(VueCompositionApi);

interface TekstikappaleStoreConfig {
  // notifikaatiotStore: NotifikaatiotStore;
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class TekstikappaleStore implements IEditoitava {
  private state = reactive({
    tekstikappale: null as Laaja | PerusteenOsaDto | null,
  });

  private static config: TekstikappaleStoreConfig;

  public static install(vue: typeof Vue, config: TekstikappaleStoreConfig) {
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
    try {
      if (this.versionumero) {
        const revisions = (await Perusteenosat.getPerusteenOsaViiteVersiot(this.tekstiKappaleViiteId)).data as Revision[];
        const rev = revisions[revisions.length - this.versionumero];
        this.state.tekstikappale = (await Perusteenosat.getPerusteenOsaVersioByViite(this.tekstiKappaleViiteId, rev.numero)).data;
      }
      else {
        this.state.tekstikappale = (await Perusteenosat.getPerusteenOsatByViite(this.tekstiKappaleViiteId)).data;
      }
    }
    catch (err) {
    }
  }

  public async load() {
    await this.fetch();
    return {
      ...this.tekstikappale.value,
      originalNimi: this.tekstikappale.value?.nimi,
    };
  }

  public async save(data: Matala) {
    const res = await Perusteenosat.updatePerusteenOsaPerusteella(this.tekstiKappaleViiteId, this.perusteId, this.id.value!, data);

    TekstikappaleStore.config!.perusteStore!.updateNavigationEntry({
      id: this.tekstiKappaleViiteId,
      type: 'viite',
      label: (res.data as any).nimi as any,
    });

    return res.data;
  }

  public async history() {
  }

  public async cancel() {
    // Noop
  }

  public async remove() {
    await Sisallot.removeSisaltoViite(this.perusteId, TekstikappaleStore.config?.perusteStore.perusteSuoritustapa.value!, this.tekstiKappaleViiteId);
    TekstikappaleStore.config!.perusteStore!.removeNavigationEntry({
      id: this.tekstiKappaleViiteId,
      type: 'viite',
    });
    TekstikappaleStore.config.router.push({ name: 'perusteprojekti' });
  }

  public async lock() {
    try {
      const res = await Perusteenosat.checkPerusteenOsaLock(this.id.value!);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    const res = await Perusteenosat.lockPerusteenOsa(this.id.value!);
    return res.data;
  }

  public async release() {
    await Perusteenosat.unlockPerusteenOsa(this.id.value!);
  }

  public async preview() {
    return null;
  }

  public readonly validator = computed(() => {
    const julkaisukielet = TekstikappaleStore.config!.perusteStore.julkaisukielet.value;
    return {
      nimi: translated(julkaisukielet),
    };
  });

  public async editAfterLoad() {
    return false;
  }

  public async start() {
    // Noop
  }

  public async revisions() {
    const res = await Perusteenosat.getPerusteenOsaVersiot(this.id.value!);
    return res.data as Revision[];
  }

  public async restore(rev: number) {
    await this.acquire();
    await Perusteenosat.revertPerusteenOsaToVersio(this.id.value!, rev);
    await this.release();
  }

  public async validate() {
    return {
      valid: true,
    };
  }

  public async create(otsikko, tekstikappaleIsa) {
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
              } as any,
            }
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
            } as any,
          }));

        return tallennettu.data;
      }
    }
  }
}
