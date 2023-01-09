import { PerusteStore } from '@/stores/PerusteStore';
import VueRouter from 'vue-router';
import Vue from 'vue';
import VueCompositionApi, { computed, reactive } from '@vue/composition-api';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import _ from 'lodash';
import { Revision } from '@shared/tyypit';
import { requiredOneLang } from '@shared/validators/required';

Vue.use(VueCompositionApi);

interface OsaamiskokonaisuusStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class OsaamiskokonaisuusStore implements IEditoitava {
  private state = reactive({
    osaamiskokonaisuus: null as Matala | null,
  });

  private static config: OsaamiskokonaisuusStoreConfig;

  public static install(vue: typeof Vue, config: OsaamiskokonaisuusStoreConfig) {
    OsaamiskokonaisuusStore.config = config;
  }

  public readonly osaamiskokonaisuus = computed(() => this.state.osaamiskokonaisuus);
  public readonly id = computed(() => this.state.osaamiskokonaisuus?.id);

  constructor(
    private readonly perusteId?: number,
    private readonly osaamiskokonaisuusViiteId?: number,
    public readonly versionumero?: number,
  ) {
    if (!OsaamiskokonaisuusStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!OsaamiskokonaisuusStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async fetch() {
    if (this.versionumero) {
      const revisions = (await Perusteenosat.getPerusteenOsaViiteVersiot(this.osaamiskokonaisuusViiteId!)).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      this.state.osaamiskokonaisuus = (await Perusteenosat.getPerusteenOsaVersioByViite(this.osaamiskokonaisuusViiteId!, rev.numero)).data;
    }
    else {
      this.state.osaamiskokonaisuus = (await Perusteenosat.getPerusteenOsatByViite(this.osaamiskokonaisuusViiteId!)).data;
    }
  }

  public async load(supportDataProvider) {
    await this.fetch();
    const viiteLapsilla = (await Perusteenosat.getPerusteenOsaViiteLapsilla(this.perusteId!, this.osaamiskokonaisuusViiteId!)).data;
    supportDataProvider({ paaAlueet: _.filter(viiteLapsilla.lapset, lapsi => _.get(lapsi.perusteenOsa, 'osanTyyppi') === 'osaamiskokonaisuus_paa_alue') });
    return this.osaamiskokonaisuus.value;
  }

  async editAfterLoad() {
    return false;
  }

  public async save(data: any) {
    const res = await Perusteenosat.updatePerusteenOsa(this.id.value!, data);

    OsaamiskokonaisuusStore.config!.perusteStore!.updateNavigationEntry({
      id: this.osaamiskokonaisuusViiteId!,
      type: 'osaamiskokonaisuus',
      label: (res.data as any).nimi as any,
    });

    return res.data;
  }

  public async remove() {
    await Sisallot.removeSisaltoViite(this.perusteId!, OsaamiskokonaisuusStore.config?.perusteStore.perusteSuoritustapa.value!, this.osaamiskokonaisuusViiteId!);
    OsaamiskokonaisuusStore.config!.perusteStore!.removeNavigationEntry({
      id: this.osaamiskokonaisuusViiteId!,
      type: 'osaamiskokonaisuus',
    });
    OsaamiskokonaisuusStore.config.router.push({ name: 'perusteprojekti' });
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
    };
  });

  public async create(tekstikappaleIsa) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: 'osaamiskokonaisuus',
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        OsaamiskokonaisuusStore.config.perusteStore.perusteId.value!,
        OsaamiskokonaisuusStore.config?.perusteStore.perusteSuoritustapa.value!,
        perusteenOsa
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        OsaamiskokonaisuusStore.config.perusteStore.perusteId.value!,
        OsaamiskokonaisuusStore.config?.perusteStore.perusteSuoritustapa.value!,
        tekstikappaleIsa.id,
        perusteenOsa
      ));

      return tallennettu.data;
    }
  }
}
