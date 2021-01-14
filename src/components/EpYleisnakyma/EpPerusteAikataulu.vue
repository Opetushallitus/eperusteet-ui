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
    let aikataulu = this.aikatauluStore.aikataulutapahtumat.value as any;

    if (!this.luontitapahtuma) {
      aikataulu = [
        ...aikataulu,
        {
          tapahtuma: 'luominen',
          tavoite: { [Kielet.getSisaltoKieli.value]: this.$t('peruste-luotu') },
          tapahtumapaiva: this.aikatauluStore.peruste.value?.luotu,
        },
      ];
    }

    if (!this.julkaisutapahtuma) {
      aikataulu = [
        ...aikataulu,
        {
          tapahtuma: 'julkaisu',
          tavoite: { [Kielet.getSisaltoKieli.value]: this.$t('perusteen-arvioitu-julkaisupaiva') },
          tapahtumapaiva: null,
        },
      ];
    }

    return aikataulu;
  }

  get julkaisutapahtuma() {
    return _.head(_.filter(this.aikatauluStore.aikataulutapahtumat.value, tapahtuma => tapahtuma.tapahtuma === 'julkaisu'));
  }

  get luontitapahtuma() {
    return _.head(_.filter(this.aikatauluStore.aikataulutapahtumat.value, tapahtuma => tapahtuma.tapahtuma === 'luominen'));
  }

  async tallenna(aikataulut) {
    await this.aikatauluStore.saveAikataulut(aikataulut);
    this.$success(this.$t('aikataulu-tallennettu') as string);
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

</style>
