import { PerusteStore } from '@/stores/PerusteStore';
import VueRouter from 'vue-router';
import Vue from 'vue';
import VueCompositionApi, { computed, reactive } from '@vue/composition-api';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Matala, OsaamiskokonaisuusDto, OsaamiskokonaisuusPaaAlueDto, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import _ from 'lodash';
import { Revision } from '@shared/tyypit';
import { requiredOneLang } from '@shared/validators/required';

Vue.use(VueCompositionApi);

interface OsaamiskokonaisuusPaaAlueStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class OsaamiskokonaisuusPaaAlueStore implements IEditoitava {
  private state = reactive({
    osaamiskokonaisuusPaaAlue: null as Matala | null,
  });

  private static config: OsaamiskokonaisuusPaaAlueStoreConfig;

  public static install(vue: typeof Vue, config: OsaamiskokonaisuusPaaAlueStoreConfig) {
    OsaamiskokonaisuusPaaAlueStore.config = config;
  }

  public readonly osaamiskokonaisuusPaaAlue = computed(() => this.state.osaamiskokonaisuusPaaAlue);
  public readonly id = computed(() => this.state.osaamiskokonaisuusPaaAlue?.id);

  constructor(
    private readonly perusteId?: number,
    private readonly osaamiskokonaisuusPaaAlueViiteId?: number,
    public readonly versionumero?: number,
  ) {
    if (!OsaamiskokonaisuusPaaAlueStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!OsaamiskokonaisuusPaaAlueStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async fetch() {
    if (this.versionumero) {
      const revisions = (await Perusteenosat.getPerusteenOsaViiteVersiot(this.osaamiskokonaisuusPaaAlueViiteId!)).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      this.state.osaamiskokonaisuusPaaAlue = (await Perusteenosat.getPerusteenOsaVersioByViite(this.osaamiskokonaisuusPaaAlueViiteId!, rev.numero)).data;
    }
    else {
      this.state.osaamiskokonaisuusPaaAlue = (await Perusteenosat.getPerusteenOsatByViite(this.osaamiskokonaisuusPaaAlueViiteId!)).data;
    }
  }

  public async load() {
    await this.fetch();
    return this.osaamiskokonaisuusPaaAlue.value;
  }

  async editAfterLoad() {
    return false;
  }

  public async save(data: any) {
    const res = await Perusteenosat.updatePerusteenOsa(this.id.value!, data);

    OsaamiskokonaisuusPaaAlueStore.config!.perusteStore!.updateNavigationEntry({
      id: this.osaamiskokonaisuusPaaAlueViiteId!,
      type: 'osaamiskokonaisuus_paa_alue',
      label: (res.data as any).nimi as any,
    });

    return res.data;
  }

  public async remove() {
    await Sisallot.removeSisaltoViite(this.perusteId!, OsaamiskokonaisuusPaaAlueStore.config?.perusteStore.perusteSuoritustapa.value!, this.osaamiskokonaisuusPaaAlueViiteId!);
    OsaamiskokonaisuusPaaAlueStore.config!.perusteStore!.removeNavigationEntry({
      id: this.osaamiskokonaisuusPaaAlueViiteId!,
      type: 'osaamiskokonaisuus_paa_alue',
    });
    OsaamiskokonaisuusPaaAlueStore.config.router.push({ name: 'perusteprojekti' });
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

  public async revisions() {
    const res = await Perusteenosat.getPerusteenOsaVersiot(this.id.value!);
    return res.data as Revision[];
  }

  public async restore(rev: number) {
    await this.acquire();
    await Perusteenosat.revertPerusteenOsaToVersio(this.id.value!, rev);
    await this.release();
  }

  public readonly validator = computed(() => {
    return {
      nimi: {
        ...requiredOneLang(),
      },
      osaAlueet: {
        $each: {
          nimi: {
            ...requiredOneLang(),
          },
          tasokuvaukset: {
            $each: {
              kuvaukset: {
                $each: {
                  ...requiredOneLang(),
                },
              },
            },
          },
        },
      },
    };
  });

  public static async create(osaamiskokonaisuusId) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: 'osaamiskokonaisuus_paa_alue',
      } as any,
    };

    const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        OsaamiskokonaisuusPaaAlueStore.config.perusteStore.perusteId.value!,
        OsaamiskokonaisuusPaaAlueStore.config?.perusteStore.perusteSuoritustapa.value!,
        osaamiskokonaisuusId,
        perusteenOsa
    ));

    return tallennettu.data;
  }
}
