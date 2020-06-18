import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Dokumentit, PerusteDto, DokumenttiDto, DokumenttiDtoTilaEnum, baseURL, DokumentitParams } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { Kieli } from '@shared/tyypit';

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

  async haePdf(kieli: Kieli) {
    if (this.peruste && this.suoritustapa) {
      this.state.dokumentti = (await Dokumentit.getLatestDokumentti((this.peruste.id as number), kieli.toString(), this.suoritustapa, this.version)).data;
      this.setHref();
    }
  }

  async getDokumenttiTila() {
    if (this.state.dokumentti?.id) {
      this.state.dokumentti = (await Dokumentit.queryDokumenttiTila((this.state.dokumentti?.id as number))).data;

      if (_.kebabCase(this.state.dokumentti.tila) === _.kebabCase(DokumenttiDtoTilaEnum.EPAONNISTUI)
        || _.kebabCase(this.state.dokumentti.tila) === _.kebabCase(DokumenttiDtoTilaEnum.VALMIS)) {
        clearInterval(this.state.polling);
        this.state.polling = null;

        this.setHref();
      }
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

  async luoPdf(kieli: Kieli) {
    clearInterval(this.state.polling);
    this.state.polling = true;

    this.state.dokumentti = (await Dokumentit.createDokumentti((this.peruste.id as number), kieli.toString(), this.suoritustapa, this.version)).data;

    setTimeout(() => {
      this.state.polling = setInterval(() => {
        this.getDokumenttiTila();
      }, this.pollingFrequency);
    }, this.pollingFrequency);
  }
}
