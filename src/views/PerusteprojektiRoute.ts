import { Watch, Prop, Vue } from 'vue-property-decorator';
import { PerusteStore } from '@/stores/PerusteStore';
import _ from 'lodash';


export abstract class PerusteprojektiRoute extends Vue {
  @Prop({ required: true })
  protected perusteStore!: PerusteStore;

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

  protected abstract onProjektiChange(projektiId: number, perusteId: number): Promise<any>;

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
