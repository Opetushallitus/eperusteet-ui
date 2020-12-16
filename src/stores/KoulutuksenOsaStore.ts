import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';

import { minLength, required } from 'vuelidate/lib/validators';
import _ from 'lodash';

import { KoulutuksenOsaDto, KoulutuksenOsaDtoKoulutusOsanKoulutustyyppiEnum, Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import { translated } from '@shared/validators/required';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';

import { PerusteStore } from '@/stores/PerusteStore';

Vue.use(VueCompositionApi);

interface KoulutuksenOsaStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class KoulutuksenOsaStore implements IEditoitava {
  private state = reactive({
    koulutuksenosa: null as Matala | null,
  });

  private static config: KoulutuksenOsaStoreConfig;

  public static install(vue: typeof Vue, config: KoulutuksenOsaStoreConfig) {
    KoulutuksenOsaStore.config = config;
  }

  public readonly koulutuksenosa = computed(() => this.state.koulutuksenosa);
  public readonly id = computed(() => this.state.koulutuksenosa?.id);

  constructor(
    private readonly perusteId: number,
    private readonly koulutuksenosaId: number,
  ) {
    if (!KoulutuksenOsaStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!KoulutuksenOsaStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async fetch() {
    try {
      this.state.koulutuksenosa = (await Perusteenosat.getPerusteenOsatByViite(this.koulutuksenosaId)).data;
    }
    catch (err) {
    }
  }

  public async load() {
    await this.fetch();
    return this.koulutuksenosa.value;
  }

  public async save(data: KoulutuksenOsaDto) {
    if (this.isTuvaKoulutusTyyppi(data.koulutusOsanKoulutustyyppi as string)) {
      data.nimi = data.nimiKoodi?.nimi;
    } else if (!!data.nimiKoodi) {
      data.nimiKoodi = undefined;
    }
    const res = await Perusteenosat.updatePerusteenOsa(this.id.value!, data as any);

    KoulutuksenOsaStore.config!.perusteStore!.updateNavigationEntry({
      id: this.koulutuksenosaId,
      type: 'koulutuksenosa',
      label: (res.data as any).nimi as any,
    });

    return res.data;
  }

  private isTuvaKoulutusTyyppi(type: string): boolean {
    return type === _.chain(KoulutuksenOsaDtoKoulutusOsanKoulutustyyppiEnum.TUTKINTOKOULUTUKSEENVALMENTAVA)
      .split('_')
      .join('')
      .toLower()
      .value();
  }

  public async history() {
  }

  public async cancel() {
    // Noop
  }

  public async remove() {
    await Sisallot.removeSisaltoViite(this.perusteId, 'REFORMI', this.koulutuksenosaId);
    KoulutuksenOsaStore.config!.perusteStore!.removeNavigationEntry({
      id: this.koulutuksenosaId,
      type: 'koulutuksenosa',
    });
    KoulutuksenOsaStore.config.router.push({ name: 'perusteprojekti' });
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
    const julkaisukielet = KoulutuksenOsaStore.config!.perusteStore.julkaisukielet.value;
    return {
      koulutusOsanKoulutustyyppi: { required },
      nimi: translated(julkaisukielet),
      laajuusMinimi: { required },
      laajuusMaksimi: { required },
      arvioinnit: {
        'min-length': minLength(1),
        required,
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
        osanTyyppi: 'koulutuksenosa',
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        KoulutuksenOsaStore.config.perusteStore.perusteId.value!,
        'reformi',
        perusteenOsa
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        KoulutuksenOsaStore.config.perusteStore.perusteId.value!,
        'reformi',
        tekstikappaleIsa.id,
        perusteenOsa
      ));

      return tallennettu.data;
    }
  }
}
