<template>

  <div class="perustiedot-content">
    <router-link :to="{ name: 'projektinTiedot'}">
      <h3>{{$t('projektin-tiedot')}}</h3>
    </router-link>

    <div class="row">
      <div class="col-12">
        <ep-perustieto-data icon="info" :topic="$t('projektin-kuvaus')" class="w-100">
          <div v-html="$kaanna(projektinKuvaus)"></div>
        </ep-perustieto-data>
      </div>
    </div>

    <div class="row">
      <div class="col-5">
        <ep-perustieto-data icon="comment" :topic="$t('yhteyshenkilo')">
          {{yhteyshenkilo}}
        </ep-perustieto-data>
      </div>
      <div class="col-7">
        <ep-perustieto-data icon="language" :topic="$t('julkaisukielet')">
          {{julkaisukielet}}
        </ep-perustieto-data>
      </div>
    </div>

    <div class="row">
      <div class="col-5">
        <ep-perustieto-data icon="calendar_today" :topic="$t('luotu')">
          {{$sdt(peruste.luotu)}}
        </ep-perustieto-data>
      </div>
      <div class="col-7">
        <ep-perustieto-data icon="calendar_today" :topic="$t('julkaistu')">
          {{$sdt(peruste.viimeisinJulkaisuAika)}}
        </ep-perustieto-data>
      </div>
    </div>

    <div class="row">
      <div class="col-5">
        <ep-perustieto-data icon="groups" :topic="$t('tyoryhma')" class="w-60" v-if="virkailijat">
          <p v-for="virkailija in virkailijat" :key="virkailija.oid" class="mb-1">
            {{ virkailija.esitysnimi }}
          </p>
          <ep-button v-if="!naytaLisaaTyoryhmaa && virkailijat && virkailijat.length > tyoryhmaAlkuMaara" @click="naytaLisaaTyoryhmaa = true" variant="link" buttonClass="pl-0 mt-2">
            {{$t('nayta-lisaa')}}
          </ep-button>
      </ep-perustieto-data>
      </div>
      <div class="col-7">
        <EpPerustietoData icon="visibility">
          <template #header>{{ $t('esikatsele-perustetta')}}</template>
          <template v-if="!projekti.esikatseltavissa">{{ $t('esikatselua-ei-ole-sallittu') }}</template>
          <template v-else>
            <ep-external-link :url="esikatseluUrl"></ep-external-link>
          </template>
        </EpPerustietoData>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpPerustietoData from '@shared/components/EpPerustietoData/EpPerustietoData.vue';
import { Kielet } from '@shared/stores/kieli';
import { PerusteprojektiDto, PerusteDto } from '@shared/api/eperusteet';
import { TyoryhmaStore } from '@/stores/TyoryhmaStore';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';
import { buildPerusteEsikatseluUrl } from '@/utils/esikatselu';

@Component({
  components: {
    EpSpinner,
    EpButton,
    EpPerustietoData,
    EpInput,
  },
})
export default class EpPerustePerustiedot extends Vue {
  private tyoryhmaAlkuMaara = 5;
  private naytaLisaaTyoryhmaa: boolean = false;

  @Prop({ required: true })
  protected projekti!: PerusteprojektiDto;

  @Prop({ required: true })
  protected peruste!: PerusteDto;

  @Prop({ required: true })
  private tyoryhmaStore!: TyoryhmaStore;

  get projektinKuvaus() {
    return this.projekti.kuvaus;
  }

  get yhteyshenkilo() {
    return this.projekti?.yhteistyotaho || null;
  }

  get julkaisukielet() {
    if (this.peruste) {
      return _.map(this.peruste.kielet, (kieli) => Kielet.kaannaOlioTaiTeksti(kieli)).join(', ');
    }
  }

  get tyoryhma() {
    return this.tyoryhmaStore.perusteenTyoryhma.value;
  }

  get virkailijat() {
    if (this.tyoryhmaStore.tyoryhmanVirkailiijat.value) {
      return _.chain(this.tyoryhmaStore.tyoryhmanVirkailiijat.value)
        .map(virkailija => {
          return {
            ...virkailija,
            esitysnimi: parsiEsitysnimi(virkailija),
          };
        })
        .value();
    }
    else {
      return null;
    }
  }

  get esikatseluUrl() {
    if (this.peruste) {
      return buildPerusteEsikatseluUrl(this.peruste);
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
@import "@/styles/_mixins.scss";
@include perustiedot-content;

</style>
