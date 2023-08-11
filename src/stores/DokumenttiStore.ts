import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Dokumentit, PerusteDto, DokumenttiDto, DokumenttiDtoTilaEnum, baseURL, DokumentitParams } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { Debounced } from '@shared/utils/delay';
import { Kielet } from '@shared/stores/kieli';

Vue.use(VueCompositionApi);

export class DokumenttiStore {
  private state = reactive({
    dokumentti: null as DokumenttiDto | null,
    dokumenttiJulkaisu: null as DokumenttiDto | null,
    polling: null as any | null,
    dokumenttiHref: null as string | null,
    dokumenttiJulkaisuHref: null as string | null,
  });

  private pollingFrequency = 1000;

  constructor(private peruste: PerusteDto, private suoritustapa: string, private version: string) {
  }

  public readonly dokumentti = computed(() => this.state.dokumentti);
  public readonly dokumenttiJulkaisu = computed(() => this.state.dokumenttiJulkaisu);
  public readonly polling = computed(() => this.state.polling);
  public readonly dokumenttiHref = computed(() => this.state.dokumenttiHref);
  public readonly dokumenttiJulkaisuHref = computed(() => this.state.dokumenttiJulkaisuHref);

  async init() {
    this.state.dokumentti = null;
    this.state.dokumenttiJulkaisu = null;
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

    if (!this.state.dokumentti.julkaisuDokumentti && !this.state.dokumenttiJulkaisu && this.version === 'uusi') {
      this.state.dokumenttiJulkaisu = (await Dokumentit.getJulkaistuDokumentti((this.peruste.id as number), Kielet.getSisaltoKieli.value)).data;
      if (this.state.dokumenttiJulkaisu.id) {
        this.state.dokumenttiJulkaisuHref = baseURL + DokumentitParams.getDokumentti(_.toString(this.state.dokumenttiJulkaisu.id)).url;
      }
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
    try {
      this.state.polling = true;
      this.state.dokumentti = (await Dokumentit.createDokumentti((this.peruste.id as number), Kielet.getSisaltoKieli.value, this.suoritustapa, this.version)).data;
      await this.getDokumenttiTila();
    }
    catch (e) {
      this.state.polling = false;
    }
  }
}
