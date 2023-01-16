import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { required } from 'vuelidate/lib/validators';
import _ from 'lodash';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { TuvaLaajaAlainenOsaaminenDto } from '@shared/generated/eperusteet';

Vue.use(VueCompositionApi);

interface LaajaalainenOsaaminenStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class LaajaalainenOsaaminenStore implements IEditoitava {
  private state = reactive({
    laajaalainenosaaminen: null as Matala | null,
  });

  private static config: LaajaalainenOsaaminenStoreConfig;

  public static install(vue: typeof Vue, config: LaajaalainenOsaaminenStoreConfig) {
    LaajaalainenOsaaminenStore.config = config;
  }

  public readonly laajaalainenosaaminen = computed(() => this.state.laajaalainenosaaminen);
  public readonly id = computed(() => this.state.laajaalainenosaaminen?.id);

  constructor(
    private readonly perusteId: number,
    private readonly laajaalainenosaaminenId: number,
    public versionumero?: number,
  ) {
    if (!LaajaalainenOsaaminenStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!LaajaalainenOsaaminenStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async fetch() {
    try {
      if (this.versionumero && this.laajaalainenosaaminenId) {
        const revisions = (await Perusteenosat.getPerusteenOsaViiteVersiot(this.laajaalainenosaaminenId)).data as Revision[];
        const rev = revisions[revisions.length - this.versionumero];
        this.state.laajaalainenosaaminen = (await Perusteenosat.getPerusteenOsaVersioByViite(this.laajaalainenosaaminenId, rev.numero)).data;
      }
      else {
        this.state.laajaalainenosaaminen = (await Perusteenosat.getPerusteenOsatByViite(this.laajaalainenosaaminenId)).data;
      }
    }
    catch (err) {
    }
  }

  public async load() {
    await this.fetch();
    return this.laajaalainenosaaminen.value;
  }

  public async save(data: TuvaLaajaAlainenOsaaminenDto) {
    data.nimi = data.nimiKoodi?.nimi;
    const res = await Perusteenosat.updatePerusteenOsa(this.id.value!, data as any);

    LaajaalainenOsaaminenStore.config!.perusteStore!.updateNavigationEntry({
      id: this.laajaalainenosaaminenId,
      type: 'laajaalainenosaaminen',
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
    await Sisallot.removeSisaltoViite(this.perusteId, LaajaalainenOsaaminenStore.config?.perusteStore.perusteSuoritustapa.value!, this.laajaalainenosaaminenId);
    LaajaalainenOsaaminenStore.config!.perusteStore!.removeNavigationEntry({
      id: this.laajaalainenosaaminenId,
      type: 'laajaalainenosaaminen',
    });
    LaajaalainenOsaaminenStore.config.router.push({ name: 'perusteprojekti' });
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
    return {
      nimiKoodi: { required },
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
        osanTyyppi: 'laajaalainenosaaminen',
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        LaajaalainenOsaaminenStore.config.perusteStore.perusteId.value!,
        LaajaalainenOsaaminenStore.config?.perusteStore.perusteSuoritustapa.value!,
        perusteenOsa
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        LaajaalainenOsaaminenStore.config.perusteStore.perusteId.value!,
        LaajaalainenOsaaminenStore.config?.perusteStore.perusteSuoritustapa.value!,
        tekstikappaleIsa.id,
        perusteenOsa
      ));

      return tallennettu.data;
    }
  }
}
