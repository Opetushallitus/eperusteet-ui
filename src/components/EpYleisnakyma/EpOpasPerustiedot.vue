<template>

  <div class="perustiedot-content">
    <h3>{{$t('oppaan-tiedot')}}</h3>

    <ep-spinner v-if="!(peruste && projekti)" />
    <div class="d-flex flex-wrap" v-else>
      <div class="w-40">

        <ep-perustieto-data icon="kielet" :topic="$t('julkaisukielet')">
          {{julkaisukielet}}
        </ep-perustieto-data>

        <ep-perustieto-data icon="kalenteri" :topic="$t('luotu')">
          {{$sdt(peruste.luotu)}}
        </ep-perustieto-data>

        <ep-perustieto-data icon="hallitus" :topic="$t('koulutustyyppi')" v-if="peruste.oppaanKoulutustyypit" >
          <div v-for="(koulutustyyppi, index) in peruste.oppaanKoulutustyypit" :key="'kt'+index">{{$t(koulutustyyppi)}}</div>
        </ep-perustieto-data>

        <ep-perustieto-data icon="opetussuunnitelma" :topic="$t('peruste')" v-if="peruste.oppaanPerusteet">
          <div v-for="(peruste, index) in peruste.oppaanPerusteet" :key="'peruste'+index">{{$kaanna(peruste.nimi)}}</div>
        </ep-perustieto-data>

      </div>

      <div>

        <ep-perustieto-data icon="tyoryhma" :topic="$t('tyoryhma')" v-if="tyoryhma">
          <h4>{{$kaanna(tyoryhma.nimi)}}</h4>
          <p v-for="virkailija in virkailijat" :key="virkailija.oid" class="mb-1">
            {{ virkailija.esitysnimi }}
          </p>
          <ep-button v-if="!naytaLisaaTyoryhmaa && virkailijat.length > tyoryhmaAlkuMaara" @click="naytaLisaaTyoryhmaa = true" variant="link" buttonClass="pl-0 mt-2">
            {{$t('nayta-lisaa')}}
          </ep-button>
        </ep-perustieto-data>

      </div>
    </div>

  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpPerustietoData from './EpPerustietoData.vue';
import { Kielet } from '@shared/stores/kieli';
import { PerusteprojektiDto, PerusteDto, Perusteprojektit, Perusteet } from '@shared/api/eperusteet';
import EpPerustePerustiedot from './EpPerustePerustiedot.vue';

@Component({
  components: {
    EpSpinner,
    EpButton,
    EpPerustietoData,
  },
})
export default class EpOpasPerustiedot extends EpPerustePerustiedot {

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
@import "@/styles/_mixins.scss";
@include perustiedot-content;

</style>
