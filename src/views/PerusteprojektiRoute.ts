import { Watch, Prop, Vue } from 'vue-property-decorator';
import { PerusteStore } from '@/stores/PerusteStore';


export abstract class PerusteprojektiRoute extends Vue {
  @Prop({ required: true })
  protected perusteStore!: PerusteStore;

  protected get projektiId() {
    return this.$route.params.projektiId;
  }

  protected get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  protected abstract onProjektiChange(projektiId: number): Promise<any>;

  @Watch('projektiId', { immediate: true })
  async onProjektiChangeImpl(newValue: number, oldValue: number) {
    if (newValue && newValue !== oldValue) {
      await this.perusteStore.init(newValue);
      await this.perusteStore.blockUntilInitialized();
      await this.onProjektiChange(newValue);
    }
  }

}
