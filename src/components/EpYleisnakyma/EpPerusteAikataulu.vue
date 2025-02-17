<template>
  <div class="content">

    <div class="d-flex justify-content-between">
      <h3>{{$t('aikataulu')}}</h3>
      <ep-aikataulu-modal :aikataulut="aikataulut" @tallenna="tallenna" :julkinen-valinta="isAmmatillinen" :pakollisetTapahtumat="['tavoite']">
        <label slot="aikataululistaus-julkaisu-header">
          {{$t('peruste-astuu-voimaan')}}
        </label>
        <span slot="luomispaiva-topic" v-html="$t('projektin-luomispaiva')"></span>
        <span slot="julkaisupaiva-topic" v-html="$t('peruste-astuu-voimaan')"></span>
      </ep-aikataulu-modal>
    </div>

    <ep-aikataulu :aikataulut="aikataulut">
      <span slot="luomispaiva-topic" v-html="$t('projektin-luomispaiva')"></span>
      <span slot="julkaisupaiva-topic" v-html="$t('peruste-astuu-voimaan')"></span>
    </ep-aikataulu>

  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpAikatauluModal from '@shared/components/EpAikataulu/EpAikatauluModal.vue';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { Kielet } from '@shared/stores/kieli';
import * as _ from 'lodash';
import { PerusteAikatauluDtoTapahtumaEnum } from '@shared/api/eperusteet';
import { isKoulutustyyppiAmmatillinen } from '@shared/utils/perusteet';

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
    if (this.aikatauluStore.aikataulutapahtumat.value) {
      let aikataulu = this.aikatauluStore.aikataulutapahtumat.value as any;

      if (!this.hasTapahtuma(PerusteAikatauluDtoTapahtumaEnum.LUOMINEN)) {
        aikataulu = [
          ...aikataulu,
          this.createDefaultTapahtuma(
            PerusteAikatauluDtoTapahtumaEnum.LUOMINEN,
            { [Kielet.getSisaltoKieli.value]: this.$t('peruste-luotu') },
            this.aikatauluStore.peruste.value!.luotu as Date),
        ];
      }

      if (!this.hasTapahtuma(PerusteAikatauluDtoTapahtumaEnum.LAUSUNTOKIERROS)) {
        aikataulu = [
          ...aikataulu,
          this.createDefaultTapahtuma(
            PerusteAikatauluDtoTapahtumaEnum.LAUSUNTOKIERROS,
            { [Kielet.getSisaltoKieli.value]: this.$t('lausuntokierros-alkaa') }),
        ];
      }

      if (!this.hasTapahtuma(PerusteAikatauluDtoTapahtumaEnum.JOHTOKUNNANKASITTELY)) {
        aikataulu = [
          ...aikataulu,
          this.createDefaultTapahtuma(
            PerusteAikatauluDtoTapahtumaEnum.JOHTOKUNNANKASITTELY,
            { [Kielet.getSisaltoKieli.value]: this.$t('johtokunnan-kasittely') }),
        ];
      }

      if (!this.hasTapahtuma(PerusteAikatauluDtoTapahtumaEnum.ARVIOITUJULKAISUPAIVA)) {
        aikataulu = [
          ...aikataulu,
          this.createDefaultTapahtuma(
            PerusteAikatauluDtoTapahtumaEnum.ARVIOITUJULKAISUPAIVA,
            { [Kielet.getSisaltoKieli.value]: this.$t('perusteen-arvioitu-julkaisupaiva') }),
        ];
      }

      if (!this.hasTapahtuma(PerusteAikatauluDtoTapahtumaEnum.JULKAISU)) {
        aikataulu = [
          ...aikataulu,
          this.createDefaultTapahtuma(
            PerusteAikatauluDtoTapahtumaEnum.JULKAISU,
            { [Kielet.getSisaltoKieli.value]: this.$t('peruste-astuu-voimaan') }),
        ];
      }

      return aikataulu;
    }
  }

  hasTapahtuma(tapahtumaEnum: PerusteAikatauluDtoTapahtumaEnum) {
    return _.head(_.filter(this.aikatauluStore.aikataulutapahtumat.value, tapahtuma => _.toLower(tapahtuma.tapahtuma) === _.toLower(tapahtumaEnum)));
  }

  createDefaultTapahtuma(tapahtuma: PerusteAikatauluDtoTapahtumaEnum, tavoite: any, tapahtumapaiva?: Date) {
    return {
      tapahtuma: _.toLower(tapahtuma),
      tavoite: tavoite,
      tapahtumapaiva: tapahtumapaiva,
      julkinen: false,
    };
  }

  get isAmmatillinen() {
    if (this.aikatauluStore.peruste.value) {
      return isKoulutustyyppiAmmatillinen(this.aikatauluStore.peruste.value.koulutustyyppi!);
    }
  }

  async tallenna(aikataulut) {
    try {
      await this.aikatauluStore.saveAikataulut(_.filter(aikataulut, 'tapahtumapaiva'));
      this.$success(this.$t('aikataulu-tallennettu') as string);
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

</style>
