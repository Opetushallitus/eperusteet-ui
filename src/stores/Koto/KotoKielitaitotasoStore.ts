import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { required } from 'vuelidate/lib/validators';

Vue.use(VueCompositionApi);

interface KotoKielitaitotasoStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class KotoKielitaitotasoStore implements IEditoitava {
  private state = reactive({
    kotokielitaitotaso: null as Matala | null,
  });

  private static config: KotoKielitaitotasoStoreConfig;

  public static install(vue: typeof Vue, config: KotoKielitaitotasoStoreConfig) {
    KotoKielitaitotasoStore.config = config;
  }

  public readonly kotokielitaitotaso = computed(() => this.state.kotokielitaitotaso);
  public readonly id = computed(() => this.state.kotokielitaitotaso?.id);

  constructor(
    private readonly perusteId?: number,
    private readonly kotokielitaitotasoId?: number,
    public versionumero?: number,
  ) {
    if (!KotoKielitaitotasoStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!KotoKielitaitotasoStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async fetch() {
    try {
      if (this.versionumero && this.kotokielitaitotasoId) {
        const revisions = (await Perusteenosat.getPerusteenOsaViiteVersiot(this.kotokielitaitotasoId)).data as Revision[];
        const rev = revisions[revisions.length - this.versionumero];
        this.state.kotokielitaitotaso = (await Perusteenosat.getPerusteenOsaVersioByViite(this.kotokielitaitotasoId, rev.numero)).data;
      }
      else {
        this.state.kotokielitaitotaso = (await Perusteenosat.getPerusteenOsatByViite(this.kotokielitaitotasoId!)).data;
      }
    }
    catch (err) {
    }
  }

  public async load() {
    await this.fetch();
    return this.kotokielitaitotaso.value;
  }

  public async save(data: any) {
    data.nimi = data.nimiKoodi.nimi;
    const res = await Perusteenosat.updatePerusteenOsa(this.id.value!, data);

    KotoKielitaitotasoStore.config!.perusteStore!.updateNavigationEntry({
      id: this.kotokielitaitotasoId!,
      type: 'koto_kielitaitotaso',
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
    await Sisallot.removeSisaltoViite(this.perusteId!, KotoKielitaitotasoStore.config?.perusteStore.perusteSuoritustapa.value!, this.kotokielitaitotasoId!);
    KotoKielitaitotasoStore.config!.perusteStore!.removeNavigationEntry({
      id: this.kotokielitaitotasoId!,
      type: 'koto_kielitaitotaso',
    });
    KotoKielitaitotasoStore.config.router.push({ name: 'perusteprojekti' });
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
    const julkaisukielet = KotoKielitaitotasoStore.config!.perusteStore.julkaisukielet.value;
    return {
      nimiKoodi: {
        nimi: required,
      },
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
    await Perusteenosat.revertPerusteenOsaToVersio(this.id.value!, rev);
  }

  public async create(otsikko, tekstikappaleIsa) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: 'koto_kielitaitotaso',
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        KotoKielitaitotasoStore.config.perusteStore.perusteId.value!,
        KotoKielitaitotasoStore.config?.perusteStore.perusteSuoritustapa.value!,
        perusteenOsa
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        KotoKielitaitotasoStore.config.perusteStore.perusteId.value!,
        KotoKielitaitotasoStore.config?.perusteStore.perusteSuoritustapa.value!,
        tekstikappaleIsa.id,
        perusteenOsa
      ));

      return tallennettu.data;
    }
  }
}
