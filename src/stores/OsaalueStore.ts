import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { watch, reactive, computed } from '@vue/composition-api';
import { TutkinnonOsaViiteDto, OsaAlueet, TutkinnonRakenne } from '@shared/api/eperusteet';
import { EditoitavaFeatures, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from './PerusteStore';
import _ from 'lodash';
import { required } from 'vuelidate/lib/validators';
import { translated, requiredOneLang } from '@shared/validators/required';

Vue.use(VueCompositionApi);

interface OsaalueStoreConfig {
  perusteStore: PerusteStore;
}

export class OsaalueStore implements IEditoitava {
  constructor(
    private readonly perusteId: number,
    private tovId: number,
    private osaalueId: number | string,
    private router: VueRouter,
  ) { }

  private static config: OsaalueStoreConfig;

  public static install(vue: typeof Vue, config: OsaalueStoreConfig) {
    OsaalueStore.config = config;
  }

  public async load(supportDataProvider) {
    if (this.osaalueId === 'uusi') {
      return {
        piilotaValinnaiset: false,
        nimi: null,
        koodi: null,
        tyyppi: 'osaalue2020',
        pakollisetOsaamistavoitteet: null,
        valinnaisetOsaamistavoitteet: null,
        arviointi: {
          id: null,
        },
      };
    }
    else {
      const tutkinnonOsaViite = (await TutkinnonRakenne.getTutkinnonOsaViite(this.perusteId, OsaalueStore.config?.perusteStore.perusteSuoritustapa.value!, this.tovId)).data;
      supportDataProvider(tutkinnonOsaViite);

      return (await OsaAlueet.getOsaAlueV2(this.tovId, Number(this.osaalueId))).data;
    }
  }

  async lock() {
    try {
      if (this.osaalueId !== 'uusi') {
        const res = await OsaAlueet.getOsaAlueLock(this.tovId, Number(this.osaalueId));
        return res.data;
      }
      else {
        return null;
      }
    }
    catch (err) {
      return null;
    }
  }

  async acquire() {
    if (this.osaalueId !== 'uusi') {
      return (await OsaAlueet.lockOsaAlue(this.tovId, Number(this.osaalueId))).data;
    }
    return null;
  }

  async release() {
    try {
      if (this.osaalueId !== 'uusi') {
        await OsaAlueet.unlockOsaAlue(this.tovId, Number(this.osaalueId));
      }
    }
    catch (err) {
    }
  }

  public async save(data: any) {
    if (this.osaalueId === 'uusi') {
      const saved = (await OsaAlueet.addOsaAluePerusteella(OsaalueStore.config.perusteStore.perusteId.value!, this.tovId, data)).data;
      await OsaalueStore.config.perusteStore.updateNavigation();

      return () => {
        this.router.replace({
          name: 'osaalue',
          params: {
            osaalueId: '' + saved.id!,
          },
        });
      };
    }
    else {
      await OsaAlueet.updateOsaAluePerusteella(OsaalueStore.config.perusteStore.perusteId.value!, this.tovId, Number(this.osaalueId), data);
    }
  }

  public async editAfterLoad() {
    return this.osaalueId === 'uusi';
  }

  public async preview() {
    return null;
  }

  public readonly validator = computed(() => {
    return {
      nimi: requiredOneLang(),
      koodi: {
        required,
      },
      arviointi: {
        id: {
          required,
        },
      },
    };
  });

  public features(data: any, supportData: any) {
    return computed(() => {
      return {
        editable: supportData?.tutkinnonOsa?.alkuperainenPeruste?.id === this.perusteId,
      } as EditoitavaFeatures;
    });
  }
}
