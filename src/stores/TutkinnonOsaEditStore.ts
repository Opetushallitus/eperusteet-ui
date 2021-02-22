import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { TutkinnonOsaViiteUpdateDto, TutkinnonRakenne, TutkinnonosatPrivate, Tutkinnonosat, Perusteenosat } from '@shared/api/eperusteet';
import { Revision, Page, Kieli } from '@shared/tyypit';
import { Computed } from '@shared/utils/interfaces';
import _ from 'lodash';
import { EditoitavaFeatures, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { minValue, translated, warning } from '@shared/validators/required';
import { required } from 'vuelidate/lib/validators';
import { Kielet } from '@shared/stores/kieli';
import { perusteenSuoritustapa } from '@shared/utils/perusteet';

export function notNull() {
  return {
    'not-null': (value: any) => !!value,
  };
}

// import { NotifikaatiotStore } from '@shared/stores/NotifikaatiotStore';

Vue.use(VueCompositionApi);

interface TutkinnonOsaEditStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class TutkinnonOsaEditStore implements IEditoitava {
  private static config: TutkinnonOsaEditStoreConfig;
  private tutkinnonOsaId: number | null = null;
  private projektitJoissaKaytossa: any[] | null = null;

  public static install(vue: typeof Vue, config: TutkinnonOsaEditStoreConfig) {
    TutkinnonOsaEditStore.config = config;
  }

  constructor(
    private readonly perusteId: number,
    // Jos undefined, luodaan uusi
    private readonly tutkinnonOsaViiteId?: number,
    private readonly el?: any,
  ) {
    if (!TutkinnonOsaEditStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!TutkinnonOsaEditStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async load() {
    if (!this.tutkinnonOsaViiteId) {
      return {
        tyyppi: 'normaali',
        tutkinnonOsa: {
          nimi: {},
          geneerinenArviointiasteikko: null,
          ammattitaidonOsoittamistavat: null,
          koodi: null,
          osaAlueet: [],
          tyyppi: 'normaali',
          osanTyyppi: 'tutkinnonosa',
          ammattitaitovaatimukset2019: {
            kohde: { [Kielet.getSisaltoKieli.value]: this.el.$t('opiskelija') },
            vaatimukset: [],
            kohdealueet: [],
          },
          vapaatTekstit: [],
        },
      };
    }
    const res = await TutkinnonRakenne.getTutkinnonOsaViite(this.perusteId, TutkinnonOsaEditStore.config?.perusteStore.perusteSuoritustapa.value!, this.tutkinnonOsaViiteId);
    this.projektitJoissaKaytossa = (await (Perusteenosat.getOwningProjektit((res.data as any).tutkinnonOsa.id))).data;
    this.tutkinnonOsaId = Number((res.data as any)._tutkinnonOsa);
    return res.data;
  }

  public async save(data: TutkinnonOsaViiteUpdateDto) {
    if (this.tutkinnonOsaViiteId) {
      const res = await TutkinnonRakenne.updateTutkinnonOsa(
        this.perusteId,
        TutkinnonOsaEditStore.config?.perusteStore.perusteSuoritustapa.value!,
        this.tutkinnonOsaViiteId,
        data);
      return res.data;
    }
    else {
      const res = await TutkinnonRakenne.addTutkinnonOsa(
        this.perusteId,
        TutkinnonOsaEditStore.config?.perusteStore.perusteSuoritustapa.value!,
        data as any);
      setTimeout(() => {
        TutkinnonOsaEditStore.config.router.replace({
          name: 'tutkinnonosa',
          params: {
            tutkinnonOsaId: '' + res.data.id,
          },
        });
      });
    }
  }

  public async history() {
  }

  public async cancel() {
    // Noop
  }

  public readonly validator = computed(() => {
    return {
      tutkinnonOsa: {},
    };

    // console.log('Initing validator', data.value);
    // const julkaisukielet = TutkinnonOsaEditStore.config.perusteStore.julkaisukielet.value;
    // const common = {
    //   laajuus: _.mapValues(minValue(1), warning),
    //   tutkinnonOsa: {
    //     nimi: translated(julkaisukielet),
    //     tyyppi: required,
    //     ammattitaidonOsoittamistavat: translated(julkaisukielet),
    //   },
    // };
    //
    // if (!data.tyyppi) {
    //   return { ...common };
    // }
    // else if (data.tyyppi === 'normaali') {
    //   return {
    //     ...common,
    //     tutkinnonOsa: {
    //       ammattitaitovaatimukset2019: {
    //         kohde: translated(julkaisukielet),
    //         vaatimukset: {
    //           $each: {
    //             vaatimus: translated(julkaisukielet),
    //           },
    //         },
    //         kohdealueet: {
    //           $each: {
    //             kuvaus: translated(julkaisukielet),
    //             vaatimukset: {
    //               $each: {
    //                 vaatimus: translated(julkaisukielet),
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   };
    // }
    // else {
    //   return {
    //     ...common,
    //   };
    // }
  });

  public async remove() {
    if (!this.tutkinnonOsaViiteId) {
      return;
    }
    await TutkinnonRakenne.removeTutkinnonOsa(this.perusteId, TutkinnonOsaEditStore.config?.perusteStore.perusteSuoritustapa.value!, this.tutkinnonOsaViiteId);
    TutkinnonOsaEditStore.config!.perusteStore!.removeNavigationEntry({
      id: this.tutkinnonOsaViiteId,
      type: 'tutkinnonosa',
    });
    TutkinnonOsaEditStore.config.router.push({ name: 'tutkinnonosat' });
  }

  public async lock() {
    try {
      const res = await Perusteenosat.checkPerusteenOsaLock(this.tutkinnonOsaId!);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    if (this.tutkinnonOsaId) {
      const res = await Perusteenosat.lockPerusteenOsa(this.tutkinnonOsaId);
      return res.data;
    }
    else {
      return null;
    }
  }

  public async release() {
    if (this.tutkinnonOsaId) {
      await Perusteenosat.unlockPerusteenOsa(this.tutkinnonOsaId);
    }
  }

  public async preview() {
    return null;
  }

  public async editAfterLoad() {
    return !this.tutkinnonOsaViiteId;
  }

  public async start() {
    // Noop
  }

  public async revisions() {
    if (!this.tutkinnonOsaViiteId) {
      return [];
    }
    const res = await TutkinnonosatPrivate.getViiteVersiot(this.tutkinnonOsaViiteId);
    return res.data as Revision[];
  }

  public async restore(rev: number) {
    if (!this.tutkinnonOsaViiteId) {
      return;
    }
    await TutkinnonosatPrivate.revertToVersio(this.tutkinnonOsaViiteId, rev);
  }

  public async copy(data) {
    await TutkinnonRakenne.kloonaaTutkinnonOsa(this.perusteId, TutkinnonOsaEditStore.config?.perusteStore.perusteSuoritustapa.value!, this.tutkinnonOsaViiteId!);
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: data?.tutkinnonOsa?.tila !== 'valmis'
          && ((!data?.tutkinnonOsa?.alkuperainenPeruste && _.size(this.projektitJoissaKaytossa) <= 1)
          || data?.tutkinnonOsa?.alkuperainenPeruste?.id === this.perusteId),
        removable: true,
        hideable: false,
        recoverable: data?.tutkinnonOsa?.tila !== 'valmis'
          && ((!data?.tutkinnonOsa?.alkuperainenPeruste && _.size(this.projektitJoissaKaytossa) <= 1)
          || data?.tutkinnonOsa?.alkuperainenPeruste?.id === this.perusteId),
        copyable: !data?.tutkinnonOsa?.alkuperainenPeruste && (data?.tutkinnonOsa?.tila === 'valmis' || _.size(this.projektitJoissaKaytossa) > 1),
      } as EditoitavaFeatures;
    });
  }
}
