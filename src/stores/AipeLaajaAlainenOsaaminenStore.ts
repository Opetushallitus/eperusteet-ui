import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Aipeopetuksensisalto, LaajaalainenOsaaminenDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { PerusteStore } from './PerusteStore';
import { useRouter } from 'vue-router';

export class AipeLaajaAlainenOsaaminenStore implements IEditoitava {
  constructor(
    private perusteId: number,
    private laoId: number | null,
    private perusteStore: PerusteStore,
  ) {
  }

  async acquire() {
    return null;
  }

  async editAfterLoad() {
    return !this.laoId;
  }

  async load() {
    if (this.laoId) {
      return (await Aipeopetuksensisalto.getAipeOsaaminen(this.perusteId, this.laoId)).data;
    }

    return {};
  }

  async save(data: any) {
    if (this.laoId) {
      await Aipeopetuksensisalto.updateAipeOsaaminen(this.perusteId, this.laoId, data);
      await this.perusteStore.updateNavigation();
    }
    else {
      const lao = (await Aipeopetuksensisalto.addAipeOsaaminen(this.perusteId, data)).data;
      this.laoId = lao.id!;
      await this.perusteStore.updateNavigation();
      await EditointiStore.cancelAll();
      const router = useRouter();
      router.push({ name: 'aipelaajaAlainenOsaaminen', params: { laoId: lao.id } });
    }
  }

  public async remove() {
    if (this.laoId) {
      await Aipeopetuksensisalto.deleteAipeOsaaminen(this.perusteId, this.laoId);
      await this.perusteStore.updateNavigation();
      const router = useRouter();
      router.push({ name: 'aipeLaajaAlaisetOsaamiset' });
    }
  }
}
