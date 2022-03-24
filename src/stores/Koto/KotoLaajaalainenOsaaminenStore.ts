import { PerusteStore } from '@/stores/PerusteStore';
import VueRouter from 'vue-router';
import Vue from 'vue';
import VueCompositionApi, { computed, reactive } from '@vue/composition-api';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import _ from 'lodash';

Vue.use(VueCompositionApi);

interface KotoLaajaalainenOsaaminenStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class KotoLaajaalainenOsaaminenStore implements IEditoitava {
  private state = reactive({
    kotoLaajaalainenOsaaminen: null as Matala | null,
  });

  private static config: KotoLaajaalainenOsaaminenStoreConfig;

  public static install(vue: typeof Vue, config: KotoLaajaalainenOsaaminenStoreConfig) {
    KotoLaajaalainenOsaaminenStore.config = config;
  }

  public readonly kotoLaajaalainenOsaaminen = computed(() => this.state.kotoLaajaalainenOsaaminen);
  public readonly id = computed(() => this.state.kotoLaajaalainenOsaaminen?.id);

  constructor(
    private readonly perusteId?: number,
    private readonly kotoLaajaalainenOsaaminenId?: number,
  ) {
    if (!KotoLaajaalainenOsaaminenStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!KotoLaajaalainenOsaaminenStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async fetch() {
    try {
      this.state.kotoLaajaalainenOsaaminen = (await Perusteenosat.getPerusteenOsatByViite(this.kotoLaajaalainenOsaaminenId!)).data;
    }
    catch (err) {
      console.log(err);
    }
  }

  public async load() {
    await this.fetch();
    return this.kotoLaajaalainenOsaaminen.value;
  }

  async editAfterLoad() {
    return false;
  }

  public async save(data: any) {
    const res = await Perusteenosat.updatePerusteenOsa(this.id.value!, data);

    KotoLaajaalainenOsaaminenStore.config!.perusteStore!.updateNavigationEntry({
      id: this.kotoLaajaalainenOsaaminenId!,
      type: 'koto_laajaalainenosaaminen',
      label: (res.data as any).nimi as any,
    });

    return res.data;
  }

  public async remove() {
    debugger;
    // await Sisallot.removeSisaltoViite(this.perusteId!, KotoOpintoStore.config?.perusteStore.perusteSuoritustapa.value!, this.kotoOpintoId!);
    // KotoOpintoStore.config!.perusteStore!.removeNavigationEntry({
    //   id: this.kotoOpintoId!,
    //   type: 'koto_opinto',
    // });
    // KotoOpintoStore.config.router.push({ name: 'perusteprojekti' });
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

  public async create(otsikko, tekstikappaleIsa) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: 'koto_laajaalainenosaaminen',
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        KotoLaajaalainenOsaaminenStore.config.perusteStore.perusteId.value!,
        KotoLaajaalainenOsaaminenStore.config?.perusteStore.perusteSuoritustapa.value!,
        perusteenOsa
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        KotoLaajaalainenOsaaminenStore.config.perusteStore.perusteId.value!,
        KotoLaajaalainenOsaaminenStore.config?.perusteStore.perusteSuoritustapa.value!,
        tekstikappaleIsa.id,
        perusteenOsa
      ));

      return tallennettu.data;
    }
  }
}
