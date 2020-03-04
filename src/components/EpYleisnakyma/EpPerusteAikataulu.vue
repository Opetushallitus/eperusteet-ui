<template>
  <div class="content">

    <div class="d-flex justify-content-between">
      <h3>{{$t('aikataulu')}}</h3>
      <!-- <ep-aikataulu-modal :aikataulut="aikataulut" /> -->
    </div>

    <ep-aikataulu :aikataulut="aikataulut" />

  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpAikatauluModal from '@shared/components/EpAikataulu/EpAikatauluModal.vue';
import { success } from '@/utils/notifications';
import { PerusteprojektiDto, PerusteDto } from '@shared/api/eperusteet';
import { AikatauluStore } from '@/stores/AikatauluStore';

@Component({
  components: {
    EpSpinner,
    EpButton,
    EpAikataulu,
    EpAikatauluModal,
  },
})
export default class EpPerusteAikataulu extends Vue {
  @Prop({ required: true })
  private aikatauluStore!: AikatauluStore;

  get aikataulut() {
    return this.aikatauluStore.aikataulutapahtumat.value;
  }

  async tallenna(aikataulut) {
    await this.aikatauluStore.saveAikataulut(aikataulut);
    success('aikataulu-tallennettu');
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

</style>
