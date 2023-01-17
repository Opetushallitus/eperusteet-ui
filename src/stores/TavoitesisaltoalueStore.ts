import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { required, requiredIf } from 'vuelidate/lib/validators';
import { koodistoKoodiValidator, requiredOneLang } from '@shared/validators/required';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';

Vue.use(VueCompositionApi);

interface TavoitesisaltoalueStoreConfig {
  perusteStore: PerusteStore;
  router: VueRouter;
}

export class TavoitesisaltoalueStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  private static config: TavoitesisaltoalueStoreConfig;

  public static install(vue: typeof Vue, config: TavoitesisaltoalueStoreConfig) {
    TavoitesisaltoalueStore.config = config;
  }

  constructor(
    public perusteId: number,
    public tavoitesisaltoalueId: number,
    public versionumero?: number,
  ) {
    super(perusteId, tavoitesisaltoalueId, versionumero, TavoitesisaltoalueStore.config);
  }

  public async load() {
    return this.fetchPerusteenOsat();
  }

  public readonly validator = computed(() => {
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

  getOsanType() {
    return 'tavoitesisaltoalue';
  }
}
