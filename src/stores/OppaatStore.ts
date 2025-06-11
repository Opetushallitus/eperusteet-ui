import { reactive, computed } from 'vue';
import { Oppaat, OpasLuontiDto, PerusteHakuDto } from '@shared/api/eperusteet';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';

export class OppaatStore {
  private state = reactive({
    oppaat: null as PerusteHakuDto[] | null,

  });

  public readonly oppaat = computed(() => this.state.oppaat);

  public async saveOpas(opas: OpasLuontiDto) {
    const res = await Oppaat.addOpas(opas);
    this.state.oppaat = [
      (res.data as any),
      ...this.state.oppaat || [],
    ];

    return res.data;
  }

  @Debounced(300)
  public async updateQuery() {
    const res = (await Oppaat.getAllOppaatKevyt(1000)).data;
    this.state.oppaat = (res as any).data as any;
  }
}
