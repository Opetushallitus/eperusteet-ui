import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Matala, Perusteenosat, Sisallot } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { required, requiredIf } from 'vuelidate/lib/validators';
import { koodistoKoodiValidator, requiredOneLang } from '@shared/validators/required';
import { Kielet } from '@shared/stores/kieli';

Vue.use(VueCompositionApi);

interface TavoitesisaltoalueStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class TavoitesisaltoalueStore implements IEditoitava {
  private state = reactive({
    tavoitesisaltoalue: null as Matala | null,
  });

  private static config: TavoitesisaltoalueStoreConfig;

  public static install(vue: typeof Vue, config: TavoitesisaltoalueStoreConfig) {
    TavoitesisaltoalueStore.config = config;
  }

  public readonly tavoitesisaltoalue = computed(() => this.state.tavoitesisaltoalue);
  public readonly id = computed(() => this.state.tavoitesisaltoalue?.id);

  constructor(
    private readonly perusteId: number,
    private readonly tavoitesisaltoalueId: number,
  ) {
    if (!TavoitesisaltoalueStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!TavoitesisaltoalueStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async fetch() {
    try {
      this.state.tavoitesisaltoalue = (await Perusteenosat.getPerusteenOsatByViite(this.tavoitesisaltoalueId)).data;
    }
    catch (err) {
    }
  }

  public async load() {
    await this.fetch();
    return this.tavoitesisaltoalue.value;
  }

  public async save(data: any) {
    data.nimi = data.nimiKoodi.nimi;
    const res = await Perusteenosat.updatePerusteenOsa(this.id.value!, data);

    TavoitesisaltoalueStore.config!.perusteStore!.updateNavigationEntry({
      id: this.tavoitesisaltoalueId,
      type: 'tavoitesisaltoalue',
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
    await Sisallot.removeSisaltoViite(this.perusteId, TavoitesisaltoalueStore.config?.perusteStore.perusteSuoritustapa.value!, this.tavoitesisaltoalueId);
    TavoitesisaltoalueStore.config!.perusteStore!.removeNavigationEntry({
      id: this.tavoitesisaltoalueId,
      type: 'tavoitesisaltoalue',
    });
    TavoitesisaltoalueStore.config.router.push({ name: 'perusteprojekti' });
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
    const julkaisukielet = TavoitesisaltoalueStore.config!.perusteStore.julkaisukielet.value;
    return {
      nimiKoodi: {
        nimi: required,
      },
      tavoitealueet: {
        $each: {
          otsikko: {
            required: requiredIf((value) => {
              return value && value.tavoiteAlueTyyppi === 'OTSIKKO';
            }),
          },
          tavoitteet: {
            $each: {
              ...koodistoKoodiValidator(),
            },
          },
          keskeisetSisaltoalueet: {
            $each: {
              ...requiredOneLang(),
            },
          },
        },
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
        osanTyyppi: 'tavoitesisaltoalue',
      } as any,
    };

    if (_.isEmpty(tekstikappaleIsa)) {
      const tallennettu = (await Sisallot.addSisaltoViiteUUSI(
        TavoitesisaltoalueStore.config.perusteStore.perusteId.value!,
        TavoitesisaltoalueStore.config?.perusteStore.perusteSuoritustapa.value!,
        perusteenOsa
      ));
      return tallennettu.data;
    }
    else {
      const tallennettu = (await Sisallot.addSisaltoUusiLapsiViitteella(
        TavoitesisaltoalueStore.config.perusteStore.perusteId.value!,
        TavoitesisaltoalueStore.config?.perusteStore.perusteSuoritustapa.value!,
        tekstikappaleIsa.id,
        perusteenOsa
      ));

      return tallennettu.data;
    }
  }
}
