import { reactive, computed, ref, watch } from 'vue';
import { Ulkopuoliset, getPerusteprojektit, PerusteprojektiKevytDto, Perusteprojektit, PerusteQuery, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import { Page } from '@shared/tyypit';
import { IProjektiProvider } from '@/components/EpPerusteprojektiListaus/types';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';

export class UlkopuolisetStore {
  public state = reactive({
    tyoryhmat: null as any[] | null,
  });

  public readonly tyoryhmat = computed(() => this.state.tyoryhmat);

  @Debounced(100)
  public async fetchTyoryhmat() {
    const res = await Ulkopuoliset.getOrganisaatioRyhmat();
    this.state.tyoryhmat = res.data as any;
  }
}
