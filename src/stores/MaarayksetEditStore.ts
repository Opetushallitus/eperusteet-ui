import { EditointiStore, EditoitavaFeatures, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import * as _ from 'lodash';
import { computed } from 'vue';
import { minLength, required, requiredIf } from 'vuelidate/lib/validators';
import { Api, Maaraykset, MaarayksetParams, MaaraysDto, MaaraysDtoLiittyyTyyppiEnum, MaaraysDtoTyyppiEnum, MaaraysLiiteDtoTyyppiEnum, Perusteet, baseURL } from '@shared/api/eperusteet';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { requiredOneLang } from '@shared/validators/required';
import { Kieli } from '@shared/tyypit';
import { App } from 'vue';
import { Router } from 'vue-router';

function kielilistaObjektiksi(objekti) {
  return _.reduce(objekti, (obj, param) => ({ ...obj, ...param }), {});
}

export function requireOneLiite() {
  return {
    'required-one-liite': (value: any) => {
      return _.some(UiKielet, kieli => maaraysDokumenttiExistsAnyKieli(value, kieli as Kieli));
    },
  };
}

export function maaraysDokumenttiExistsAnyKieli(value: any, kieli: Kieli) {
  return !!_.find(value[kieli].liitteet, liite => liite.tyyppi === MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI);
}

interface MaarayksetEditStoreConfig {
  router: Router;
}

export class MaarayksetEditStore implements IEditoitava {
  private static config: MaarayksetEditStoreConfig;

  public static install(app: App, config: MaarayksetEditStoreConfig) {
    MaarayksetEditStore.config = config;
  }

  constructor(
    private maaraysId: number | 'uusi',
  ) {
  }

  async editAfterLoad() {
    return this.maaraysId === 'uusi';
  }

  async load(supportDataProvider) {
    let maarays;
    if (this.maaraysId === 'uusi') {
      maarays = MaarayksetEditStore.createEmptyMaarays();
    }
    else {
      maarays = (await Maaraykset.getMaarays(this.maaraysId)).data;
      _.forEach(UiKielet, kieli => {
        if (maarays.liitteet && maarays.liitteet[kieli]) {
          maarays.liitteet[kieli].liitteet = _.map(maarays.liitteet[kieli].liitteet, liite => {
            return {
              ...liite,
              url: baseURL + MaarayksetParams.getMaaraysLiite(_.toString(liite.id)).url,
            };
          });
        }
      });
    }

    const maarayksetNimella = (await Maaraykset.getMaarayksetNimet()).data;
    const asiasanat = (await Maaraykset.getAsiasanat()).data;
    const peruste = maarays.peruste ? (await Perusteet.getPerusteenTiedot(maarays.peruste.id!)).data : null;
    supportDataProvider({ maarayksetNimella, asiasanat, peruste });

    return maarays;
  }

  async save(data: any) {
    if (this.maaraysId === 'uusi') {
      const maarays = (await Maaraykset.addMaarays(data)).data;
      this.maaraysId = maarays.id!;

      return async () => {
        await EditointiStore.cancelAll();
        MaarayksetEditStore.config.router.push({ name: 'maaraysMuokkaus', params: { maaraysId: _.toString(this.maaraysId) } });
      };
    }
    else {
      await Maaraykset.updateMaarays(this.maaraysId, data);
    }
  }

  public async remove() {
    if (this.maaraysId !== 'uusi') {
      await Maaraykset.deleteMaarays(this.maaraysId);
      MaarayksetEditStore.config.router.push({ name: 'maarayskokoelma' });
    }
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: !data.peruste,
      } as EditoitavaFeatures;
    });
  }

  public readonly validator = computed(() => {
    return {
      nimi: requiredOneLang(),
      diaarinumero: { required },
      voimassaoloAlkaa: { required },
      maarayspvm: { required },
      kuvaus: requiredOneLang(),
      liitteet: requireOneLiite(),
    };
  });

  public static createEmptyMaarays(osaMaarays?: MaaraysDto) {
    return {
      tyyppi: MaaraysDtoTyyppiEnum.OPETUSHALLITUKSENMUU,
      liittyyTyyppi: MaaraysDtoLiittyyTyyppiEnum.EILIITY,
      koulutustyypit: [],
      korvattavatMaaraykset: [],
      muutettavatMaaraykset: [],
      asiasanat: kielilistaObjektiksi(_.map(UiKielet, kieli => {
        return {
          [kieli]: {
            asiasana: [],
          },
        };
      })),
      liitteet: kielilistaObjektiksi(_.map(UiKielet, kieli => {
        return {
          [kieli]: {
            liitteet: [],
          },
        };
      })),
      ...(!!osaMaarays && osaMaarays),
    };
  }
}
