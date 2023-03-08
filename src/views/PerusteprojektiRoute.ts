import { Component, Watch, Prop, Vue } from 'vue-property-decorator';
import { PerusteStore } from '@/stores/PerusteStore';
import { BrowserStore } from '@shared/stores/BrowserStore';
import _ from 'lodash';
import { PerusteDtoTyyppiEnum } from '@shared/api/eperusteet';

const browserStore = new BrowserStore();

@Component
export class PerusteprojektiRoute extends Vue {
  @Prop({ required: true })
  protected perusteStore!: PerusteStore;

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
      return this.peruste.tyyppi === _.toLower(PerusteDtoTyyppiEnum.POHJA);
    }
  }

  protected async onProjektiChange(projektiId: number, perusteId: number) {
  }

  @Watch('projektiId', { immediate: true })
  async onProjektiChangeImpl(newValue: string, oldValue: string) {
    if (newValue && newValue !== oldValue && !this.isInitingProjekti) {
      const projektiId = _.parseInt(newValue);
      this.isInitingProjekti = true;
      window.scrollTo(0, 0);
      try {
        await Promise.all([
          this.perusteStore.init(projektiId),
          this.perusteStore.blockUntilInitialized(),
          this.onProjektiChange(projektiId, this.perusteStore.perusteId.value!),
        ]);
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
}
