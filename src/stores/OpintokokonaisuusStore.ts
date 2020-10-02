import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { minLength, required } from 'vuelidate/lib/validators';
import { minValue, translated, warning } from '@shared/validators/required';

Vue.use(VueCompositionApi);

interface OpintokokonaisuusStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class OpintokokonaisuusStore implements IEditoitava {
  private state = reactive({
    opintokokonaisuus: null as Matala | null,
  });

  private static config: OpintokokonaisuusStoreConfig;

  public static install(vue: typeof Vue, config: OpintokokonaisuusStoreConfig) {
    OpintokokonaisuusStore.config = config;
  }

  public readonly opintokokonaisuus = computed(() => this.state.opintokokonaisuus);
  public readonly id = computed(() => this.state.opintokokonaisuus?.id);

  constructor(
    private readonly perusteId: number,
    private readonly opintokokonaisuusId: number,
  ) {
    if (!OpintokokonaisuusStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!OpintokokonaisuusStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async fetch() {
    try {
      this.state.opintokokonaisuus = (await Perusteenosat.getPerusteenOsatByViite(this.opintokokonaisuusId)).data;
    }
    catch (err) {
    }
  }

  public async load() {
    await this.fetch();
    return this.opintokokonaisuus.value;
  }

  public async save(data: any) {
    data.nimi = data.nimiKoodi.nimi;
    const res = await Perusteenosat.updatePerusteenOsa(this.id.value!, data);

    OpintokokonaisuusStore.config!.perusteStore!.updateNavigationEntry({
      id: this.opintokokonaisuusId,
      type: 'opintokokonaisuus',
      label: res.data.nimi as any,
    });

    return res.data;
  }

  public async history() {
  }

  public async cancel() {
    // Noop
  }

  public async remove() {
    await Sisallot.removeSisaltoViite(this.perusteId, 'REFORMI', this.opintokokonaisuusId);
    OpintokokonaisuusStore.config!.perusteStore!.removeNavigationEntry({
      id: this.opintokokonaisuusId,
      type: 'viite',
    });
    OpintokokonaisuusStore.config.router.push({ name: 'perusteprojekti' });
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
    const julkaisukielet = OpintokokonaisuusStore.config!.perusteStore.julkaisukielet.value;
    return {
      nimiKoodi: {
        nimi: required,
      },
      laajuus: minValue(1),
      kuvaus: translated(julkaisukielet),
      opetuksenTavoiteOtsikko: translated(julkaisukielet),
      opetuksenTavoitteet: {
        'min-length': minLength(1),
        required,
      },
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
        osanTyyppi: 'opintokokonaisuus',
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        OpintokokonaisuusStore.config.perusteStore.perusteId.value!,
        'reformi',
        perusteenOsa
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        OpintokokonaisuusStore.config.perusteStore.perusteId.value!,
        'reformi',
        tekstikappaleIsa.id,
        perusteenOsa
      ));

      return tallennettu.data;
    }
  }
}
