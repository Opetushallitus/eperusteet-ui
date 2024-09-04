<template>
  <div class="perustiedot-content">
    <router-link :to="{ name: 'oppaanTiedot'}">
      <h3>{{$t('oppaan-tiedot')}}</h3>
    </router-link>

    <ep-spinner v-if="!(peruste && projekti) || !tyoryhma || !virkailijat" />

    <template v-else>
      <div class="row">
        <div class="col-5">
          <ep-perustieto-data icon="language" :topic="$t('julkaisukielet')">
            {{julkaisukielet}}
          </ep-perustieto-data>
        </div>
        <div class="col-7">
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
            <h4>{{$kaanna(tyoryhma.nimi)}}</h4>
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
            <template #header>{{ $t('esikatsele-opasta')}}</template>
            <template v-if="!projekti.esikatseltavissa">{{ $t('et-ole-sallinut-esikatselua') }}</template>
            <template v-else>
              <ep-external-link :url="esikatseluUrl"></ep-external-link>
            </template>
          </EpPerustietoData>
        </div>
      </div>

      <div class="row">
        <div class="col-5" v-if="peruste.oppaanKoulutustyypit">
          <ep-perustieto-data icon="account_balance" :topic="$t('koulutustyyppi')" >
            <div v-for="(koulutustyyppi, index) in peruste.oppaanKoulutustyypit" :key="'kt'+index">{{$t(koulutustyyppi)}}</div>
          </ep-perustieto-data>
        </div>
        <div class="col-7" v-if="peruste.oppaanPerusteet">
          <ep-perustieto-data icon="article" :topic="$t('peruste')">
            <div v-for="(peruste, index) in peruste.oppaanPerusteet" :key="'peruste'+index">{{$kaanna(peruste.nimi)}}</div>
          </ep-perustieto-data>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpPerustietoData from '@shared/components/EpPerustietoData/EpPerustietoData.vue';
import EpPerustePerustiedot from './EpPerustePerustiedot.vue';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpSpinner,
    EpButton,
    EpPerustietoData,
  },
})
export default class EpOpasPerustiedot extends EpPerustePerustiedot {
  get esikatseluUrl() {
    return buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/opas/${this.peruste.id}`);
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
@import "@/styles/_mixins.scss";
@include perustiedot-content;

</style>
