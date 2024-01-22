import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { getAllPerusteetInternal, PerusteHakuInternalDto, PerusteprojektiLuontiDto, Ulkopuoliset, getPerusteprojektit, PerusteprojektiKevytDto, Perusteet, Perusteprojektit, PerusteQuery, PerusteprojektiListausDto, Maintenance, PerusteKevytDto } from '@shared/api/eperusteet';
import { Page } from '@shared/tyypit';
import { IProjektiProvider } from '@/components/EpPerusteprojektiListaus/types';
import { Debounced } from '@shared/utils/delay';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class PerusteprojektiStore {
  public state = reactive({
    pohjat: null as PerusteKevytDto[] | null,
    perusteet: null as PerusteKevytDto[] | null,
  });

  public readonly perusteet = computed(() => this.state.perusteet);
  public readonly pohjat = computed(() => this.state.pohjat);

  public async fetchPohjat() {
    this.state.pohjat = (await Perusteet.getPohjaperusteet('pohja')).data;
  }

  public async fetchPohjaProjektit() {
    this.state.perusteet = (await Perusteet.getPohjaperusteet('normaali')).data;
  }

  public async fetchPohjaDigitaalisetOsaamiset() {
    this.state.perusteet = (await Perusteet.getPohjaperusteet('digitaalinen_osaaminen')).data;
  }

  public async addPerusteprojekti(luontiDto: PerusteprojektiLuontiDto) {
    const res = await Perusteprojektit.addPerusteprojekti(luontiDto);
    return res.data;
  }

  public async addPerusteprojektiPohja(luontiDto: PerusteprojektiLuontiDto) {
    const res = await Perusteprojektit.addPerusteprojektiPohja(luontiDto);
    return res.data;
  }

  public async importPerusteprojekti(importDto: any) {
    const res = await Maintenance.tuoPeruste(importDto);
    return res.data;
  }

  public async getPerusteprojekti(perusteProjektiId: number) {
    const res = await Perusteprojektit.getPerusteprojekti(perusteProjektiId);
    return res.data;
  }

  public async getPerusteprojektiTyoryhma(perusteProjektiId: number) {
    const res = await Perusteprojektit.getPerusteprojektiTyoryhmat(perusteProjektiId);
    return res.data;
  }
}
