import Vue from 'vue';
import { computed } from 'vue';
import { TutkinnonOsaViiteUpdateDto, TutkinnonRakenne, TutkinnonosatPrivate, Perusteenosat, PerusteDtoTilaEnum } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import _ from 'lodash';
import { EditointiStore, EditoitavaFeatures, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { Kielet } from '@shared/stores/kieli';
import { App } from 'vue';
import { Router } from 'vue-router';

export function notNull() {
  return {
    'not-null': (value: any) => !!value,
  };
}

interface TutkinnonOsaEditStoreConfig {
  perusteStore: PerusteStore;
  router: Router;
}

export class TutkinnonOsaEditStore implements IEditoitava {
  private static config: TutkinnonOsaEditStoreConfig;
  private tutkinnonOsaId: number | null = null;
  private projektitJoissaKaytossa: any[] | null = null;

  public static install(app: App, config: TutkinnonOsaEditStoreConfig) {
    TutkinnonOsaEditStore.config = config;
  }

  constructor(
    private readonly perusteId: number,
    // Jos undefined, luodaan uusi
    private readonly tutkinnonOsaViiteId?: any,
    private readonly el?: any,
    public versionumero?: number,
  ) {
    if (!TutkinnonOsaEditStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!TutkinnonOsaEditStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  public async load(supportDataProvider) {
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
          _geneerinenArviointiasteikko: null,
          arviointi: {
            arvioinninKohdealueet: [],
          },
        },
      };
    }
    let res;
    if (this.versionumero) {
      const revisions = (await TutkinnonosatPrivate.getViiteVersiot(this.tutkinnonOsaViiteId, this.versionumero)).data;
      const rev = revisions[revisions.length - this.versionumero];
      res = (await TutkinnonosatPrivate.getViiteVersio(this.tutkinnonOsaViiteId, Number(rev.numero)));
    }
    else {
      res = await TutkinnonRakenne.getTutkinnonOsaViite(this.perusteId, TutkinnonOsaEditStore.config.perusteStore.perusteSuoritustapa.value!, this.tutkinnonOsaViiteId);
    }
    this.projektitJoissaKaytossa = (await (Perusteenosat.getOwningProjektit((res.data as any).tutkinnonOsa.id))).data;
    this.tutkinnonOsaId = Number((res.data as any)._tutkinnonOsa);
    supportDataProvider({ projektitJoissaKaytossa: this.projektitJoissaKaytossa });

    return {
      ...res.data,
      tutkinnonOsa: {
        ...res.data.tutkinnonOsa,
        ...(res.data.tutkinnonOsa.arviointi ? {
          arviointi: {
            ...res.data.tutkinnonOsa.arviointi,
            arvioinninKohdealueet: _.map(res.data.tutkinnonOsa.arviointi?.arvioinninKohdealueet, aka => {
              return {
                ...aka,
                arvioinninKohteet: _.map(aka.arvioinninKohteet, ak => {
                  return {
                    ...ak,
                    osaamistasonKriteerit: _.sortBy(ak.osaamistasonKriteerit, '_osaamistaso'),
                  };
                }),
              };
            }),
          },
        } : {
          arviointi: {
            arvioinninKohdealueet: [],
          },
        }),
      },
    };
  }

  public async save(data: TutkinnonOsaViiteUpdateDto) {
    if (this.tutkinnonOsaViiteId) {
      const res = await TutkinnonRakenne.updateTutkinnonOsa(
        this.perusteId,
        TutkinnonOsaEditStore.config.perusteStore.perusteSuoritustapa.value!,
        this.tutkinnonOsaViiteId,
        data);

        TutkinnonOsaEditStore.config!.perusteStore!.updateNavigationEntry({
          id: data.id!,
          label: (data.tutkinnonOsa as any).nimi as any,
        });

        return res.data;
    }
    else {
      const res = await TutkinnonRakenne.addTutkinnonOsa(
        this.perusteId,
        TutkinnonOsaEditStore.config.perusteStore.perusteSuoritustapa.value!,
        data as any);
      await EditointiStore.cancelAll();
      await TutkinnonOsaEditStore.config.perusteStore.updateNavigation();
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
  });

  public async remove() {
    if (!this.tutkinnonOsaViiteId) {
      return;
    }
    await TutkinnonRakenne.removeTutkinnonOsa(this.perusteId, TutkinnonOsaEditStore.config.perusteStore.perusteSuoritustapa.value!, this.tutkinnonOsaViiteId);
    TutkinnonOsaEditStore.config!.perusteStore!.removeNavigationEntry({
      id: this.tutkinnonOsaViiteId,
    });
    TutkinnonOsaEditStore.config.router.push({ name: 'tutkinnonosat' });
  }

  public async lock() {
    try {
      const res = await Perusteenosat.checkLockByTutkinnonOsaViite(this.tutkinnonOsaViiteId!);
      return res.data;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    if (this.tutkinnonOsaId) {
      const res = await Perusteenosat.lockByTutkinnonOsaViite(this.tutkinnonOsaViiteId!);
      return res.data;
    }
    else {
      return null;
    }
  }

  public async release() {
    if (this.tutkinnonOsaId) {
      await Perusteenosat.unlockByTutkinnonOsaViite(this.tutkinnonOsaViiteId!);
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
    await this.acquire();
    await TutkinnonosatPrivate.revertToVersio(this.tutkinnonOsaViiteId, rev);
    await this.release();
  }

  public async copy(data) {
    await TutkinnonRakenne.kloonaaTutkinnonOsa(this.perusteId, TutkinnonOsaEditStore.config.perusteStore.perusteSuoritustapa.value as any, this.tutkinnonOsaViiteId as number);
    return true;
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: (_.toLower(TutkinnonOsaEditStore.config?.perusteStore.peruste.value?.tila) !== _.toLower(PerusteDtoTilaEnum.VALMIS) && _.size(this.projektitJoissaKaytossa) <= 1)
          || (data.tutkinnonOsa.tyyppi !== 'normaali' && data?.tutkinnonOsa?.alkuperainenPeruste?.id === this.perusteId),
        removable: true,
        hideable: false,
        recoverable: _.toLower(TutkinnonOsaEditStore.config?.perusteStore.peruste.value?.tila) !== _.toLower(PerusteDtoTilaEnum.VALMIS)
          && ((!data?.tutkinnonOsa?.alkuperainenPeruste && _.size(this.projektitJoissaKaytossa) <= 1)
          || data?.tutkinnonOsa?.alkuperainenPeruste?.id === this.perusteId),
        copyable: _.toLower(TutkinnonOsaEditStore.config?.perusteStore.peruste.value?.tila) !== _.toLower(PerusteDtoTilaEnum.VALMIS) && _.size(this.projektitJoissaKaytossa) > 1 && data.tutkinnonOsa.tyyppi === 'normaali',
      } as EditoitavaFeatures;
    });
  }
}
