import { reactive, computed } from 'vue';
import { MuokkaustietoKayttajallaDto, Muokkaustiedot } from '@shared/api/eperusteet';
import _ from 'lodash';
import { IMuokkaustietoProvider } from '@shared/components/EpViimeaikainenToiminta/types';

export class MuokkaustietoStore implements IMuokkaustietoProvider {
  private state = reactive({
    muokkaustiedot: null as MuokkaustietoKayttajallaDto[] | null,
    viimeinenHaku: null as MuokkaustietoKayttajallaDto[] | null,
    perusteId: null as number | null,
    hakuLukumaara: 8 as number,
  });

  clear() {
    this.state.muokkaustiedot = null;
  }

  async init(perusteId: number) {
    this.state.perusteId = perusteId;
    this.state.muokkaustiedot = null;
    await this.update();
  }

  public readonly muokkaustiedot = computed(() => this.state.muokkaustiedot);
  public readonly viimeinenHaku = computed(() => this.state.viimeinenHaku);
  public readonly hakuLukumaara = computed(() => this.state.hakuLukumaara);

  public async fetch() {
    this.state.muokkaustiedot = null;
    await this.update();
  }

  public async update() {
    if (this.state.perusteId) {
      if (this.state.muokkaustiedot && !_.isEmpty(this.state.muokkaustiedot)) {
        this.state.viimeinenHaku = (await Muokkaustiedot.getPerusteenMuokkausTiedotWithLuomisaika(this.state.perusteId, (_.last(this.state.muokkaustiedot) as any).luotu, this.state.hakuLukumaara) as any).data;

        if (this.state.viimeinenHaku) {
          this.state.muokkaustiedot = [
            ...this.state.muokkaustiedot,
            ...this.state.viimeinenHaku,
          ];
        }
      }
      else {
        this.state.muokkaustiedot = (await Muokkaustiedot.getPerusteenMuokkausTiedotWithLuomisaika(this.state.perusteId, undefined, this.state.hakuLukumaara) as any).data;
      }
    }
  }
}
