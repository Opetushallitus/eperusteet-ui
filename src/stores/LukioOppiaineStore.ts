import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Lops2019 } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';
import { computed } from 'vue';
import { required } from '@vuelidate/validators';
import { App } from 'vue';
import { Router } from 'vue-router';

interface LukioOppiaineStoreConfig {
  router: Router;
}

export class LukioOppiaineStore implements IEditoitava {
  private static config: LukioOppiaineStoreConfig;

  public static install(app: App, config: LukioOppiaineStoreConfig) {
    LukioOppiaineStore.config = config;
  }
  constructor(
    private perusteId: number,
    private oppiaineId: number | null,
    private parentId: number | null,
    private perusteStore: PerusteStore,
  ) {
  }

  async acquire() {
    return null;
  }

  async editAfterLoad() {
    return !this.oppiaineId;
  }

  async load(supportDataProvider) {
    let oppiaine = {} as any;

    if (this.oppiaineId) {
      oppiaine = {
        ...oppiaine,
        ...(await Lops2019.getOppiaine(this.perusteId, this.oppiaineId)).data,
      };
    }

    return {
      ...oppiaine,
      tehtava: oppiaine.tehtava || {},
      laajaAlaisetOsaamiset: oppiaine.laajaAlaisetOsaamiset || {},
      arviointi: oppiaine.arviointi || {},
      tavoitteet: oppiaine.tavoitteet || {
        tavoitealueet: [],
      },
    };
  }

  async save(data: any) {
    data = {
      ...data,
      nimi: data.koodi?.nimi,
    };

    if (this.oppiaineId) {
      await Lops2019.updateOppiaine(this.perusteId, this.oppiaineId, data);
      await this.perusteStore.updateNavigation();
    }
    else {
      let oppiaine;
      if (this.parentId) {
        oppiaine = (await Lops2019.getOppiaine(this.perusteId, this.parentId)).data;
        oppiaine = (await Lops2019.updateOppiaine(this.perusteId, this.parentId, {
          ...oppiaine,
          oppimaarat: [
            ...oppiaine.oppimaarat!,
            data,
          ],
        })).data;
        oppiaine = (await Lops2019.getOppiaine(this.perusteId, _.get(_.last(oppiaine.oppimaarat), 'id')!)).data;
      }
      else {
        oppiaine = (await Lops2019.addOppiaine(this.perusteId, data)).data;
      }

      await this.perusteStore.updateNavigation();
      await EditointiStore.cancelAll();
      LukioOppiaineStore.config.router.push({ name: 'lukio_oppiaine', params: { oppiaineId: oppiaine.id } });
    }
  }

  public async remove() {
    if (this.oppiaineId) {
      await Lops2019.deleteOppiaine(this.perusteId, this.oppiaineId);
      await this.perusteStore.updateNavigation();
      LukioOppiaineStore.config.router.push({ name: 'perusteprojekti', params: { projektiId: this.perusteStore.projektiId.value } });
    }
  }

  public readonly validator = computed(() => {
    return {
      koodi: {
        required,
      },
    };
  });
}
