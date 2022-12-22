import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { TutkinnonOsaViiteUpdateDto, TutkinnonRakenne, TutkinnonosatPrivate, Perusteenosat, PerusteDtoTilaEnum } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import _ from 'lodash';
import { EditoitavaFeatures, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { Kielet } from '@shared/stores/kieli';

export function notNull() {
  return {
    'not-null': (value: any) => !!value,
  };
}

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
    public versionumero?: number,
    private geneeriset?: any,
  ) {
    if (!TutkinnonOsaEditStore.config?.perusteStore) {
      throw new Error('PerusteStore missing');
    }
    if (!TutkinnonOsaEditStore.config?.router) {
      throw new Error('VueRouter missing');
    }
  }

  get geneerinenId() {
    return _.toNumber(_.get(_.find(this.geneeriset, 'oletusvalinta'), 'id'));
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
          _geneerinenArviointiasteikko: this.geneerinenId,
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
      res = await TutkinnonRakenne.getTutkinnonOsaViite(this.perusteId, TutkinnonOsaEditStore.config?.perusteStore.perusteSuoritustapa.value!, this.tutkinnonOsaViiteId);
    }
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

        TutkinnonOsaEditStore.config!.perusteStore!.updateNavigationEntry({
          id: data.id!,
          type: 'tutkinnonosaviite',
          label: data.tutkinnonOsa!.nimi as any,
        });

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
    await TutkinnonRakenne.kloonaaTutkinnonOsa(this.perusteId, TutkinnonOsaEditStore.config?.perusteStore.perusteSuoritustapa.value!, this.tutkinnonOsaViiteId!);
    return true;
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: TutkinnonOsaEditStore.config?.perusteStore.peruste.value?.tila !== _.toLower(PerusteDtoTilaEnum.VALMIS)
          && ((!data?.tutkinnonOsa?.alkuperainenPeruste && _.size(this.projektitJoissaKaytossa) <= 1)
          || data?.tutkinnonOsa?.alkuperainenPeruste?.id === this.perusteId),
        removable: true,
        hideable: false,
        recoverable: data?.tutkinnonOsa?.tila !== 'valmis'
          && ((!data?.tutkinnonOsa?.alkuperainenPeruste && _.size(this.projektitJoissaKaytossa) <= 1)
          || data?.tutkinnonOsa?.alkuperainenPeruste?.id === this.perusteId),
        copyable: data?.tutkinnonOsa?.alkuperainenPeruste?.id !== this.perusteId && (data?.tutkinnonOsa?.tila === 'valmis' || _.size(this.projektitJoissaKaytossa) > 1),
      } as EditoitavaFeatures;
    });
  }
}
