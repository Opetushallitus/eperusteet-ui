import { Watch, Prop, Vue } from 'vue-property-decorator';
import { PerusteStore } from '@/stores/PerusteStore';
import _ from 'lodash';
import { BrowserStore } from '@shared/stores/BrowserStore';

const browserStore = new BrowserStore();

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

  protected async onProjektiChange(projektiId: number, perusteId: number) {
  }

  @Watch('projektiId', { immediate: true })
  async onProjektiChangeImpl(newValue: string, oldValue: string) {
    if (newValue && newValue !== oldValue && !this.isInitingProjekti) {
      const projektiId = _.parseInt(newValue);
      this.isInitingProjekti = true;
      try {
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
}
