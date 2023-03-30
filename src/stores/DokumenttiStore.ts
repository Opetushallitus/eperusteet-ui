import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Dokumentit, PerusteDto, DokumenttiDto, DokumenttiDtoTilaEnum, baseURL, DokumentitParams } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { Kieli } from '@shared/tyypit';
import { Debounced } from '@shared/utils/delay';
import { Kielet } from '@shared/stores/kieli';

Vue.use(VueCompositionApi);

export class DokumenttiStore {
  private state = reactive({
    dokumentti: null as DokumenttiDto | null,
    polling: null as any | null,
    dokumenttiHref: null as string | null,
  });

  private pollingFrequency = 1000;

  constructor(private peruste: PerusteDto, private suoritustapa: string, private version: string) {
  }

  public readonly dokumentti = computed(() => this.state.dokumentti);
  public readonly polling = computed(() => this.state.polling);
  public readonly dokumenttiHref = computed(() => this.state.dokumenttiHref);

  async init() {
    if (this.peruste && this.suoritustapa) {
      await this.getDokumenttiTila();
      this.setHref();
    }
  }

  @Debounced(2000)
  async getDokumenttiTila() {
    if (!this.state.dokumentti) {
      this.state.dokumentti = (await Dokumentit.getLatestDokumentti((this.peruste.id as number), Kielet.getSisaltoKieli.value, this.suoritustapa, this.version)).data;
    }
    else {
      this.state.dokumentti = (await Dokumentit.queryDokumenttiTila((this.state.dokumentti?.id as number))).data;
    }

    if (_.kebabCase(this.state.dokumentti.tila) === _.kebabCase(DokumenttiDtoTilaEnum.EPAONNISTUI)
        || _.kebabCase(this.state.dokumentti.tila) === _.kebabCase(DokumenttiDtoTilaEnum.VALMIS)) {
      this.state.polling = false;
      this.setHref();
    }
    else if (_.kebabCase(this.state.dokumentti.tila) !== _.kebabCase(DokumenttiDtoTilaEnum.EIOLE)) {
      this.state.polling = true;
      await this.getDokumenttiTila();
    }
  }

  setHref() {
    if (this.state.dokumentti) {
      if (_.kebabCase(this.state.dokumentti.tila) === _.kebabCase(DokumenttiDtoTilaEnum.VALMIS) && this.state.dokumentti.id) {
        this.state.dokumenttiHref = baseURL + DokumentitParams.getDokumentti(_.toString(this.state.dokumentti.id)).url;
      }
      else {
        this.state.dokumenttiHref = null;
      }
    }
  }

  async luoPdf() {
    this.state.polling = true;
    this.state.dokumentti = (await Dokumentit.createDokumentti((this.peruste.id as number), Kielet.getSisaltoKieli.value, this.suoritustapa, this.version)).data;
    await this.getDokumenttiTila();
  }
}
