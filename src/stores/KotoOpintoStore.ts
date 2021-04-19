import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { minLength, required } from 'vuelidate/lib/validators';
import { allTranslations, minValue, translated, warning } from '@shared/validators/required';

Vue.use(VueCompositionApi);

interface KotoOpintoStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class KotoOpintoStore implements IEditoitava {
  private state = reactive({
    kotoopinto: null as Matala | null,
  });

  private static config: KotoOpintoStoreConfig;

  public static install(vue: typeof Vue, config: KotoOpintoStoreConfig) {
    KotoOpintoStore.config = config;
  }

  public readonly kotoopinto = computed(() => this.state.kotoopinto);
  public readonly id = computed(() => this.state.kotoopinto?.id);

  constructor(
    private readonly perusteId?: number,
    private readonly kotoOpintoId?: number,
  ) {
    if (!KotoOpintoStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!KotoOpintoStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async fetch() {
    try {
      this.state.kotoopinto = (await Perusteenosat.getPerusteenOsatByViite(this.kotoOpintoId!)).data;
    }
    catch (err) {
    }
  }

  public async load() {
    await this.fetch();
    return this.kotoopinto.value;
  }

  public async save(data: any) {
    data.nimi = data.nimiKoodi.nimi;
    const res = await Perusteenosat.updatePerusteenOsa(this.id.value!, data);

    KotoOpintoStore.config!.perusteStore!.updateNavigationEntry({
      id: this.kotoOpintoId!,
      type: 'koto_opinto',
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
    await Sisallot.removeSisaltoViite(this.perusteId!, KotoOpintoStore.config?.perusteStore.perusteSuoritustapa.value!, this.kotoOpintoId!);
    KotoOpintoStore.config!.perusteStore!.removeNavigationEntry({
      id: this.kotoOpintoId!,
      type: 'koto_opinto',
    });
    KotoOpintoStore.config.router.push({ name: 'perusteprojekti' });
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
    const julkaisukielet = KotoOpintoStore.config!.perusteStore.julkaisukielet.value;
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
        osanTyyppi: 'koto_opinto',
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        KotoOpintoStore.config.perusteStore.perusteId.value!,
        KotoOpintoStore.config?.perusteStore.perusteSuoritustapa.value!,
        perusteenOsa
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        KotoOpintoStore.config.perusteStore.perusteId.value!,
        KotoOpintoStore.config?.perusteStore.perusteSuoritustapa.value!,
        tekstikappaleIsa.id,
        perusteenOsa
      ));

      return tallennettu.data;
    }
  }
}
