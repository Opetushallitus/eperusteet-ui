import { Component, Watch, Prop, Vue } from 'vue-property-decorator';
import { PerusteStore } from '@/stores/PerusteStore';
import { BrowserStore } from '@shared/stores/BrowserStore';
import _ from 'lodash';
import { PerusteDtoTyyppiEnum } from '@shared/api/eperusteet';
import { KayttajaStore } from '@/stores/kayttaja';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { TyoryhmaStore } from '@/stores/TyoryhmaStore';
import { isYleissivistavaKoulutustyyppi } from '@shared/utils/perusteet';

const browserStore = new BrowserStore();

@Component
export class PerusteprojektiRoute extends Vue {
  @Prop({ required: true })
  protected perusteStore!: PerusteStore;

  @Prop({ required: true })
  protected kayttajaStore!: KayttajaStore;

  @Prop({ required: true })
  protected tiedotteetStore!: TiedotteetStore;

  @Prop({ required: true })
  protected muokkaustietoStore!: MuokkaustietoStore;

  @Prop({ required: true })
  protected aikatauluStore!: AikatauluStore;

  @Prop({ required: true })
  protected tyoryhmaStore!: TyoryhmaStore;

  protected get showNavigation() {
    return browserStore.navigationVisible.value;
  }

  private isInitingProjekti = false;

  protected get isInitializing() {
    return this.isInitingProjekti;
  }

  protected get projektiId() {
    return this.$route.params.projektiId;
  }

  protected get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  protected get isAmmatillinen() {
    return this.perusteStore.isAmmatillinen.value;
  }

  protected get isVapaasivistystyo() {
    return this.perusteStore.isVapaasivistystyo.value;
  }

  protected get peruste() {
    return this.perusteStore?.peruste?.value || null;
  }

  protected get projekti() {
    return this.perusteStore?.projekti?.value || null;
  }

  protected get julkaisukielet() {
    return this.perusteStore.julkaisukielet.value;
  }

  protected get isPohja() {
    if (this.peruste) {
      return _.toLower(this.peruste.tyyppi) === _.toLower(PerusteDtoTyyppiEnum.POHJA);
    }
  }

  protected get isNormaali() {
    if (this.peruste) {
      return _.toLower(this.peruste.tyyppi) === _.toLower(PerusteDtoTyyppiEnum.NORMAALI);
    }
  }

  protected async onProjektiChange(projektiId?: number, perusteId?: number) {
  }

  @Watch('projektiId', { immediate: true })
  async onProjektiChangeImpl(newValue: string, oldValue: string) {
    if (newValue && newValue !== oldValue && !this.isInitingProjekti) {
      const projektiId = _.parseInt(newValue);
      this.isInitingProjekti = true;
      window.scrollTo(0, 0);
      try {
        this.kayttajaStore.clear();
        this.muokkaustietoStore.clear();
        this.aikatauluStore.clear();
        this.tiedotteetStore.clear();
        this.tyoryhmaStore.clear();
        await this.kayttajaStore.setPerusteprojekti(projektiId);
        await this.perusteStore.init(projektiId);
        await this.perusteStore.blockUntilInitialized();
        await this.onProjektiChange(projektiId, this.perusteStore.perusteId.value!);
      }
      catch (err) {
        console.error(err);
        throw err;
      }
      finally {
        this.isInitingProjekti = false;
      }
    }
  }

  protected get koulutustyyppiKohtaisetKaannokset() {
    return {
      perusteentiedot: isYleissivistavaKoulutustyyppi(this.perusteStore.peruste.value?.koulutustyyppi)
        ? 'perusteen-tiedot-yleissivistava'
        : 'perusteen-tiedot',
      perusteennimi: isYleissivistavaKoulutustyyppi(this.perusteStore.peruste.value?.koulutustyyppi)
        ? 'perusteen-nimi-yleissivistava'
        : 'perusteen-nimi',
    };
  }
}
