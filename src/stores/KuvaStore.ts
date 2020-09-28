import { IKuvaStore } from '@shared/components/EpContent/KuvaHandler';
import { Api, Liitetiedostot } from '@shared/api/eperusteet';

export class KuvaStore implements IKuvaStore {
  constructor(private readonly perusteId: number) {
  }

  getEndpoint() {
    return `/perusteet/${this.perusteId}/kuvat`;
  }
  getAllKuvat() {
    return Liitetiedostot.getAllKuvat(this.perusteId);
  }

  getBaseUrl() {
    return Api.defaults.baseURL + this.getEndpoint();
  }

  getApi() {
    return Api;
  }
}
