import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { TutkinnonOsaViiteUpdateDto, TutkinnonRakenne, TutkinnonosatPrivate, Tutkinnonosat, Perusteenosat } from '@shared/api/eperusteet';
import { Revision, Page, Kieli } from '@shared/tyypit';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { minValue, translated, warning } from '@shared/validators/required';

// import { NotifikaatiotStore } from '@shared/stores/NotifikaatiotStore';

Vue.use(VueCompositionApi);

interface TutkinnonOsaEditStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class TutkinnonOsaEditStore implements IEditoitava {
  private static config: TutkinnonOsaEditStoreConfig;
  private tutkinnonOsaId: number | null = null;

  public static install(vue: typeof Vue, config: TutkinnonOsaEditStoreConfig) {
    TutkinnonOsaEditStore.config = config;
  }

  constructor(
    private readonly perusteId: number,
    // Jos undefined, luodaan uusi
    private readonly tutkinnonOsaViiteId?: number,
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
          koodi: null,
          osaAlueet: [],
          tyyppi: 'normaali',
          osanTyyppi: 'tutkinnonosa',
          ammattitaitovaatimukset2019: {
            kohde: null,
            vaatimukset: [],
            kohdealueet: [],
          },
          vapaatTekstit: [],
        },
      };
    }
    const res = await TutkinnonRakenne.getTutkinnonOsaViite(this.perusteId, 'REFORMI', this.tutkinnonOsaViiteId);
    this.tutkinnonOsaId = Number((res.data as any)._tutkinnonOsa);
    return res.data;
  }

  public async save(data: TutkinnonOsaViiteUpdateDto) {
    if (this.tutkinnonOsaViiteId) {
      const res = await TutkinnonRakenne.updateTutkinnonOsa(
        this.perusteId,
        'REFORMI',
        this.tutkinnonOsaViiteId,
        data);
      return res.data;
    }
    else {
      const res = await TutkinnonRakenne.addTutkinnonOsa(
        this.perusteId,
        'REFORMI',
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
    const julkaisukielet = TutkinnonOsaEditStore.config.perusteStore.julkaisukielet.value;
    return {
      laajuus: _.mapValues(minValue(1), warning),
      tutkinnonOsa: {
        nimi: translated(julkaisukielet),
        ammattitaidonOsoittamistavat: translated(julkaisukielet),
        ammattitaitovaatimukset2019: {
          kohde: translated(julkaisukielet),
          vaatimukset: {
            $each: {
              vaatimus: translated(julkaisukielet),
            },
          },
          kohdealueet: {
            $each: {
              kuvaus: translated(julkaisukielet),
              vaatimukset: {
                $each: {
                  vaatimus: translated(julkaisukielet),
                },
              },
            },
          },
        },
      },
    };
  });

  public async remove() {
    if (!this.tutkinnonOsaViiteId) {
      return;
    }
    await TutkinnonRakenne.removeTutkinnonOsa(this.perusteId, 'REFORMI', this.tutkinnonOsaViiteId);
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
}
