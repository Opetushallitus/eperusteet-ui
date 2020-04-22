<template>

  <div class="dokumentit">
    <div class="ylapaneeli d-flex align-items-center">
        <h2 class="otsikko">{{ $t('luo-pdf') }}</h2>
    </div>
    <div class="sisalto">
      <div class="mb-4">
        <h5>{{ $t('luo-ja-lataa-pdf') }}</h5>
        <p>{{ $t(selitteenteksti)}}</p>
        <div class="row pdf-box align-items-center justify-content-between"
            :class="{'luotu': dokumenttiLuotu, 'ei-luotu': !dokumenttiLuotu, 'polling': isPolling}">
          <div class="col col-auto ikoni">
            <img src="../../public/img/icons/pdfkuva_lataus.svg" />
          </div>
          <div class="col-lg teksti">
            <span  v-if="dokumenttiLuotu">
              {{$kaanna(peruste.nimi)}}.pdf
            </span>
            <span v-else>
              {{$t('pdf-tiedostoa-ei-ole-viela-luotu')}}
            </span>
          </div>
          <div class="col-sm-2 text-left luomisaika" v-if="dokumenttiLuotu && !isPolling">
            {{$t('luotu')}}: {{$sd(dokumentti.valmistumisaika)}}
          </div>
          <div class="col-sm-2 text-left"  v-if="dokumenttiLuotu">
            <a class="btn btn-link pl-0" :href="dokumenttiHref" target="_blank" rel="noopener noreferrer" variant="link">
              <fas class="mr-2" icon="silma"></fas>
              <span>{{ $t('esikatsele-ja-lataa') }}</span>
            </a>
          </div>
        </div>

        <div class="btn-group">
          <ep-button @click="luoPdf" :disabled="isPolling" :show-spinner="isPolling" buttonClass="px-5"><span>{{ $t('luo-uusi-pdf') }}</span></ep-button>
        </div>
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
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { DokumenttiStore } from '@/stores/DokumenttiStore';
import { PerusteDto } from '@shared/api/eperusteet';

@Component({
  components: {
    EpButton,
    EpFormContent,
    EpSpinner,
  },
})
export default class RoutePdfLuonti extends PerusteprojektiRoute {
  @Prop({ required: false, default: 'luo-peruste-pdf-selite' })
  protected selitteenteksti!:string;

  private previewUrl = null;
  private dto: any | null = null;
  private polling: any = null;
  private pollingFrequency = 1000;
  private href: string | null = null;

  private store: DokumenttiStore | null = null;

  async onProjektiChange(projektiId: number, perusteId: number) {
    this.store = new DokumenttiStore(this.peruste, this.perusteenSuoritustapa);
    await this.store.haePdf(this.kieli);
  }

  get dokumenttiLuotu() {
    return this.dokumentti != null && this.dokumenttiHref != null;
  }

  get dokumentti() {
    return this.store?.dokumentti.value;
  }

  get dokumenttiHref() {
    return this.store?.dokumenttiHref.value;
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

  @Watch('kieli')
  async kieliChanged() {
    await this.store?.haePdf(this.kieli);
  }

  luoPdf() {
    this.store?.luoPdf(this.kieli);
  }

  get isPolling() {
    return this.store?.polling.value != null;
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

    .pdf-box {
      margin: 25px 0px;
      width: 100%;
      border-radius: 2px;
      padding: 25px;

      .ikoni {
        font-size: 1.5rem;
      }

      &.luotu {
        background-color: $gray-lighten-10;

        .ikoni {
          color: $blue-lighten-6;
        }

        @media(max-width: 575px) {

          .ikoni {
            display: none;
          }
        }

        .teksti {
          font-weight: 600;
        }
      }

      &.ei-luotu {
        border: 1px solid $gray-lighten-9;
        color: $gray-lighten-2;
        font-style: italic;
      }

    }

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

  .polling {
    opacity: 0.5;
  }
}

</style>
