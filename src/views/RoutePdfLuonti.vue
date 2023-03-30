<template>

  <div class="dokumentit">
    <div class="ylapaneeli d-flex align-items-center">
        <h2 class="otsikko">{{ $t('luo-pdf') }}</h2>
    </div>
    <div class="sisalto">
      <div class="mb-4">
        <h3>{{ $t('luo-ja-lataa-pdf') }}</h3>
        <p>{{ $t(selitteenteksti)}}</p>
        <ep-pdf-luonti :store="perusteDokumenttiStore" :pdfnimi="perusteNimi"/>

        <h4 v-if="kvliite" class="mt-5">{{$t('kvliite')}}</h4>
        <ep-pdf-luonti v-if="kvliite" :store="kvliiteStore" pdfnimi="kvliite"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Watch, Prop } from 'vue-property-decorator';
import { Kielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpPdfLuonti from '@shared/components/EpPdfLuonti/EpPdfLuonti.vue';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { DokumenttiStore } from '@/stores/DokumenttiStore';
import { PerusteDto } from '@shared/api/eperusteet';
import { isKoulutustyyppiAmmatillinen } from '@shared/utils/perusteet';

@Component({
  components: {
    EpButton,
    EpFormContent,
    EpSpinner,
    EpPdfLuonti,
  },
})
export default class RoutePdfLuonti extends PerusteprojektiRoute {
  @Prop({ required: false, default: 'luo-peruste-pdf-selite' })
  protected selitteenteksti!:string;

  private perusteDokumenttiStore: DokumenttiStore | null = null;
  private kvliiteStore: DokumenttiStore | null = null;

  async onProjektiChange(projektiId: number, perusteId: number) {
    this.perusteDokumenttiStore = new DokumenttiStore(this.peruste, this.perusteenSuoritustapa, 'uusi');
    this.perusteDokumenttiStore.init();

    this.kvliiteStore = new DokumenttiStore(this.peruste, this.perusteenSuoritustapa, 'kvliite');
    this.kvliiteStore.init();
  }

  get perusteenSuoritustapa(): string {
    return this.perusteStore.perusteSuoritustapa.value as string;
  }

  get peruste(): PerusteDto {
    return this.perusteStore.peruste.value as PerusteDto;
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get perusteNimi() {
    if (this.peruste) {
      return this.$kaanna(this.peruste.nimi as any);
    }
  }

  @Watch('kieli')
  async kieliChanged() {
    await this.perusteDokumenttiStore?.init();
    await this.kvliiteStore?.init();
  }

  get kvliite() {
    if (this.peruste) {
      return isKoulutustyyppiAmmatillinen(this.peruste.koulutustyyppi as string) && !this.perusteStore.isOpas.value;
    }
  }
}

</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.dokumentit {
  margin-top: 4px;

  .ylapaneeli {
    border-bottom: 1px solid #eee;
    font-weight: 600;
    padding: 5px 15px 5px 15px;
    height: 50px;

    .otsikko {
      margin-bottom: 0;
    }
  }

  .sisalto {
    margin: 35px 50px 20px 15px;

    @media(max-width: 575px) {

      .sijaintikuva {
        display:none;
      }

    }

    .kuvalataus {
      min-width: 300px;
    }

    .sijainti-topic {
      margin-bottom: 40px;
      font-weight: 600;
    }

  }

}

</style>
