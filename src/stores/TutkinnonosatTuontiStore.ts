import { reactive, computed, watch } from 'vue';
import { Debounced } from '@shared/utils/delay';
import * as _ from 'lodash';
import { Page } from '@shared/tyypit';
import { getAllPerusteetInternal, PerusteDto, PerusteHakuInternalDto, Tutkinnonosat, TutkinnonOsaViiteKontekstiDto, TutkinnonRakenne, TutkinnonOsaViiteLuontiDto } from '@shared/api/eperusteet';
import { AmmatillisetKoulutustyypit, perusteenSuoritustapa } from '@shared/utils/perusteet';

export class TutkinnonosatTuontiStore {
  public state = reactive({
    perusteet: null as Page<PerusteHakuInternalDto> | null,
    tutkinnonosat: null as Page<TutkinnonOsaViiteKontekstiDto> | null,
  });

  constructor(
    private readonly peruste: PerusteDto) {
    this.state.perusteet = { data: [] } as any;
  }

  public readonly perusteet = computed(() => this.state.perusteet);
  public readonly tutkinnonosat = computed(() => this.state.tutkinnonosat);

  @Debounced(300)
  public async fetchPerusteet(query: string) {
    this.state.perusteet = null;
    this.state.perusteet = (await getAllPerusteetInternal({
      sivukoko: 100,
      nimi: query,
      koulutustyyppi: AmmatillisetKoulutustyypit,
      tila: ['valmis', 'luonnos'],
    })).data as any;
  }

  @Debounced(300)
  public async fetchTutkinnonosat({ sivu, sivukoko, nimi, peruste, vanhentuneet, kieli }) {
    this.state.tutkinnonosat = null;
    this.state.tutkinnonosat = (await Tutkinnonosat.getAllTutkinnonOsatBy(sivu, sivukoko, nimi, peruste?.id, vanhentuneet, kieli)).data as any;
  }

  public async tuoSisaltoa(tutkinnonosat: TutkinnonOsaViiteLuontiDto[]) {
    await TutkinnonRakenne.attachTutkinnonOsat(this.peruste.id!, perusteenSuoritustapa(this.peruste) as any, tutkinnonosat);
  }
}
