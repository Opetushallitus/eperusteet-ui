import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Ulkopuoliset, getPerusteprojektit, PerusteprojektiKevytDto, Perusteprojektit, PerusteQuery, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import { Page } from '@shared/tyypit';
import { IProjektiProvider } from '@/components/EpPerusteprojektiListaus/types';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class TyoryhmaStore {
  private state = reactive({
    perusteenTyoryhma: null as any[] | null,
    tyoryhmanVirkailiijat: null as any[] | null,
  });

  public readonly perusteenTyoryhma = computed(() => this.state.perusteenTyoryhma);
  public readonly tyoryhmanVirkailiijat = computed(() => this.state.tyoryhmanVirkailiijat);

  clear() {
    this.state.perusteenTyoryhma = null;
    this.state.tyoryhmanVirkailiijat = null;
  }

  async init(oid) {
    try {
      this.state.perusteenTyoryhma = (await Ulkopuoliset.getOrganisaatioRyhmatByOid(oid)).data as any;
    }
    catch (e) {
      this.state.perusteenTyoryhma = [];
    }

    try {
      this.state.tyoryhmanVirkailiijat = (await Ulkopuoliset.getOrganisaatioVirkailijat(oid)).data as any;
    }
    catch (e) {
      this.state.tyoryhmanVirkailiijat = [];
    }
  }
}
