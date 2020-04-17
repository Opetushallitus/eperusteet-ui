<template>
  <div class="content">

    <div class="d-flex justify-content-between">
      <h3>{{$t('aikataulu')}}</h3>
      <ep-aikataulu-modal :aikataulut="aikataulut" @tallenna="tallenna"/>
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
import { PerusteprojektiDto, PerusteDto } from '@shared/api/eperusteet';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { Kielet } from '@shared/stores/kieli';
import * as _ from 'lodash';

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
    if (!this.julkaisutapahtuma) {
      return [
        ...this.aikatauluStore.aikataulutapahtumat.value,
        {
          tapahtuma: 'julkaisu',
          tavoite: { [Kielet.getSisaltoKieli.value]: this.$t('perusteen-arvioitu-julkaisupaiva') },
          tapahtumapaiva: null,
        },
      ];
    }

    return this.aikatauluStore.aikataulutapahtumat.value;
  }

  get julkaisutapahtuma() {
    return _.head(_.filter(this.aikatauluStore.aikataulutapahtumat.value, tapahtuma => tapahtuma.tapahtuma === 'julkaisu'));
  }

  async tallenna(aikataulut) {
    await this.aikatauluStore.saveAikataulut(aikataulut);
    this.$success((this as any).$t('aikataulu-tallennettu'));
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

</style>
