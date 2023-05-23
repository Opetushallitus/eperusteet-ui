import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Lops2019, Lops2019ModuuliDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';
import { computed } from '@vue/composition-api';
import { required } from 'vuelidate/lib/validators';

export class LukioModuuliStore implements IEditoitava {
  constructor(
    private perusteId: number,
    private oppiaineId: number,
    private moduuliId: number | null,
    private pakollinen: boolean,
    private perusteStore: PerusteStore,
    private el: any,
  ) {
  }

  async acquire() {
    return null;
  }

  async editAfterLoad() {
    return !this.moduuliId;
  }

  async load(supportDataProvider) {
    let moduuli = {
      pakollinen: this.pakollinen,
    } as any;

    if (this.moduuliId) {
      moduuli = {
        ...moduuli,
        ...(await Lops2019.getModuuli(this.perusteId, this.oppiaineId, this.moduuliId)).data,
      };
    }

    return {
      ...moduuli,
      sisallot: moduuli.sisallot || [],
      tavoitteet: moduuli.tavoitteet || { tavoitteet: [] },
    };
  }

  async save(data: Lops2019ModuuliDto) {
    data = {
      ...data,
      nimi: data.koodi?.nimi,
    };

    if (this.moduuliId) {
      await Lops2019.updateModuuli(this.perusteId, this.oppiaineId, this.moduuliId, data);
      await this.perusteStore.updateNavigation();
    }
    else {
      let oppiaine = (await Lops2019.getOppiaine(this.perusteId, this.oppiaineId)).data;
      oppiaine = (await Lops2019.updateOppiaine(this.perusteId, this.oppiaineId, {
        ...oppiaine,
        moduulit: [
          ...oppiaine.moduulit!,
          data,
        ],
      })).data;
      const moduuli = (await Lops2019.getModuuli(this.perusteId, oppiaine.id!, _.get(_.last(oppiaine.moduulit), 'id')!)).data;
      await (Lops2019.updateModuuli(this.perusteId, this.oppiaineId, moduuli.id!, {
        ...moduuli,
        kuvaus: data.kuvaus,
        sisallot: data.sisallot,
        tavoitteet: data.tavoitteet,
      }));
      await this.perusteStore.updateNavigation();
      await EditointiStore.cancelAll();
      this.el.$router.push({
        name: 'moduuli',
        params: {
          oppiaineId: oppiaine.id,
          moduuliId: moduuli.id,
        },
      });
    }
  }

  public async remove() {
    if (this.moduuliId) {
      await Lops2019.deleteModuuli(this.perusteId, this.oppiaineId, this.moduuliId);
      await this.perusteStore.updateNavigation();
      this.el.$router.push({ name: 'lukio_oppiaine', params: { oppiaineId: this.oppiaineId } });
    }
  }

  public readonly validator = computed(() => {
    return {
      koodi: {
        required,
      },
      laajuus: {
        required,
      },
      pakollinen: {
        required,
      },
    };
  });
}
