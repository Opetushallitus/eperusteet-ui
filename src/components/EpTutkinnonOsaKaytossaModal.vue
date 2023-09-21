<template>
  <div>
    <ep-button variant="link" @click="avaa" micon="edit" inherit-style>{{ $t('muokkaa') }}</ep-button>

    <b-modal
      id="EpTutkinnonOsaKaytossaModal"
      :title="$t('muokkaa-tutkinnon-osaa')"
      size="lg"
      hide-footer>

      <div class="mb-4">
        {{ $t('tutkinnon-osa-kaytossa-useammassa-perustessa-yla-selite') }}
      </div>

      <EpButton @click="kaynnistaMuokkaus" :showSpinner="muokkausLoading">{{$t('muokkaa-tutkinnon-osaa')}}</EpButton>

      <div class="font-weight-bold mt-4 mb-2">{{$t('perusteet-jotka-muuttuvat-kun-tutkinnon-osaa-muokataan')}}:</div>
      <div v-for="peruste in perusteet" :key="'peruste'+peruste.id">
        {{$kaanna(peruste.nimi)}}
        <span v-if="peruste.voimassaoloAlkaa || peruste.voimassaoloLoppuu">
          (<span v-if="peruste.voimassaoloAlkaa">{{$sd(peruste.voimassaoloAlkaa)}}</span> - <span v-if="peruste.voimassaoloLoppuu">{{$sd(peruste.voimassaoloLoppuu)}}</span>)
        </span>
        <span v-if="peruste.alkuperainen" class="font-italic">({{$t('tutkinnon-osa-on-luotu-tassa-perusteessa')}})</span>
      </div>

      <template v-if="!kasitellaanAlkuperaista">
        <hr class="my-4"/>
        <div v-html="$t('tutkinnon-osa-kaytossa-useammassa-perustessa-ala-selite', {perusteNimi})" />
        <EpButton @click="teeKopio" class="pl-0" variant="link" :showSpinner="kopiointiLoading">{{$t('kopioi-tutkinnon-osa-muokattavaksi')}}</EpButton>
      </template>

    </b-modal>

  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PerusteprojektinPerusteenosaDto, PerusteInfoDto } from '@shared/api/eperusteet';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpButton,
  },
})
export default class EpTutkinnonOsaKaytossaModal extends Vue {
  @Prop({ required: true })
  projektit!: PerusteprojektinPerusteenosaDto[]

  @Prop({ required: false })
  alkuperainenPeruste!: PerusteInfoDto;

  @Prop({ required: true })
  private kopioi!: Function;

  @Prop({ required: true })
  private muokkaa!: Function;

  private kopiointiLoading: boolean = false;
  private muokkausLoading: boolean = false;

  async avaa() {
    this.$bvModal.show('EpTutkinnonOsaKaytossaModal');
  }

  get perusteet() {
    return _.chain(this.projektit)
      .map(projekti => {
        return {
          ...projekti.peruste,
          alkuperainen: projekti?.peruste?.id === this.alkuperainenPeruste?.id,
        };
      })
      .sortBy(['alkuperainen', 'id'])
      .reverse()
      .value();
  }

  get kasiteltavaPeruste() {
    return _.get(_.find(this.projektit, projekti => projekti.id === _.toNumber(this.$route.params.projektiId)), 'peruste');
  }

  get perusteNimi() {
    return this.kasiteltavaPeruste?.nimi ? this.kasiteltavaPeruste.nimi[Kielet.getSisaltoKieli.value] : '';
  }

  get kasitellaanAlkuperaista() {
    return this.kasiteltavaPeruste?.id === this.alkuperainenPeruste?.id;
  }

  get eiAlkuperaa() {
    return !_.some(this.perusteet, 'alkuperainen');
  }

  async teeKopio() {
    this.kopiointiLoading = true;
    await this.kopioi();
    this.$bvModal.hide('EpTutkinnonOsaKaytossaModal');
  }

  async kaynnistaMuokkaus() {
    this.muokkausLoading = true;
    await this.muokkaa();
    this.$bvModal.hide('EpTutkinnonOsaKaytossaModal');
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

  ::v-deep .ep-button.pl-0 {

    .btn {
      padding-left: 0 !important;
    }
    .teksti {
      padding-left: 0 !important;
    }
  }

</style>
