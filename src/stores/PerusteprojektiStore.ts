import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { getAllPerusteetInternal, PerusteHakuInternalDto, PerusteprojektiLuontiDto, Ulkopuoliset, getPerusteprojektit, PerusteprojektiKevytDto, Perusteet, Perusteprojektit, PerusteQuery, PerusteprojektiListausDto, Maintenance } from '@shared/api/eperusteet';
import { Page } from '@shared/tyypit';
import { IProjektiProvider } from '@/components/EpPerusteprojektiListaus/types';
import { Debounced } from '@shared/utils/delay';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class PerusteprojektiStore {
  public state = reactive({
    pohjat: null as Page<PerusteHakuInternalDto> | null,
    perusteet: null as Page<PerusteHakuInternalDto> | null,
  })

  public readonly perusteet = computed(() => this.state.perusteet);
  public readonly pohjat = computed(() => this.state.pohjat);

  public async fetchPohjat() {
    const res = await getAllPerusteetInternal({
      koulutusvienti: false,
      nimi: '',
      perusteTyyppi: 'pohja',
      sivu: 0,
      sivukoko: 1000,
      tila: ['valmis'],
    } as any);
    this.state.pohjat = res.data as any;
  }

  public async fetchPohjaProjektit() {
    const res = await getAllPerusteetInternal({
      koulutusvienti: false,
      nimi: '',
      perusteTyyppi: 'normaali',
      sivu: 0,
      sivukoko: 1000,
      tila: ['valmis'],
    } as any);
    this.state.perusteet = res.data as any;
  }

  public async addPerusteprojekti(luontiDto: PerusteprojektiLuontiDto) {
    const res = await Perusteprojektit.addPerusteprojekti(luontiDto);
    return res.data;
  }

  public async importPerusteprojekti(importDto: PerusteprojektiImportDto) {
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
