import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { MuokkaustietoKayttajallaDto, Muokkaustiedot } from '@shared/api/eperusteet';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class MuokkaustietoStore {
  private state = reactive({
    muokkaustiedot: null as MuokkaustietoKayttajallaDto[] | null,
    viimeinenHaku: null as MuokkaustietoKayttajallaDto[] | null,
    perusteId: null as number | null,
    hakuLukumaara: 8 as number,
  });

  async init(perusteId: number) {
    this.state.perusteId = perusteId;
    this.state.muokkaustiedot = null;
    await this.update();
  }

  public readonly muokkaustiedot = computed(() => this.state.muokkaustiedot);
  public readonly viimeinenHaku = computed(() => this.state.hakuLukumaara);
  public readonly hakuLukumaara = computed(() => this.state.hakuLukumaara);

  public async update() {
    console.log('update');
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
