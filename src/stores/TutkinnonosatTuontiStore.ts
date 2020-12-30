import Vue from 'vue';
import VueCompositionApi, { reactive, computed, watch } from '@vue/composition-api';
import { Debounced } from '@shared/utils/delay';
import * as _ from 'lodash';
import { Page } from '@shared/tyypit';
import { getAllPerusteetInternal, PerusteDto, PerusteHakuInternalDto, Tutkinnonosat, TutkinnonOsaViiteKontekstiDto, TutkinnonRakenne, TutkinnonOsaViiteLuontiDto } from '@shared/api/eperusteet';
import { ammatillisetKoulutustyypit, perusteenSuoritustapa } from '@shared/utils/perusteet';

Vue.use(VueCompositionApi);

export class TutkinnonosatTuontiStore {
  public state = reactive({
    perusteet: null as Page<PerusteHakuInternalDto> | null,
    tutkinnonosat: null as Page<TutkinnonOsaViiteKontekstiDto> | null,
  })

  constructor(
    private readonly peruste: PerusteDto) {
  }

  public readonly perusteet = computed(() => this.state.perusteet);
  public readonly tutkinnonosat = computed(() => this.state.tutkinnonosat);

  @Debounced(300)
  public async fetchPerusteet(query: string) {
    this.state.perusteet = null;
    this.state.perusteet = (await getAllPerusteetInternal({
      sivukoko: 100,
      nimi: query,
      koulutustyyppi: ammatillisetKoulutustyypit,
      tila: ['valmis', 'luonnos'],
    })).data as any;
  }

  @Debounced(300)
  public async fetchTutkinnonosat({ sivu, sivukoko, nimi, peruste, vanhentuneet }) {
    this.state.tutkinnonosat = null;
    this.state.tutkinnonosat = (await Tutkinnonosat.getAllTutkinnonOsatBy(sivu, sivukoko, nimi, peruste?.id, vanhentuneet)).data as any;
  }

  public async tuoSisaltoa(tutkinnonosat: TutkinnonOsaViiteLuontiDto[]) {
    await TutkinnonRakenne.attachTutkinnonOsat(this.peruste.id!, perusteenSuoritustapa(this.peruste) as any, tutkinnonosat);
  }
}
