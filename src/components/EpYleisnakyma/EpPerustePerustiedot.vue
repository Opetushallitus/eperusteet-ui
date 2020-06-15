<template>

  <div class="perustiedot-content">
    <h3>{{$t('projektin-tiedot')}}</h3>

    <div class="d-flex flex-wrap">

      <ep-perustieto-data icon="info" :topic="$t('projektin-kuvaus')" class="w-100">
        <ep-input type="localized" :value="projektinKuvaus" />
      </ep-perustieto-data>

      <ep-perustieto-data icon="tyoryhma" :topic="$t('tyoryhma')" class="w-60" v-if="virkailijat">
        <p v-for="virkailija in virkailijat" :key="virkailija.oid" class="mb-1">
          {{ virkailija.esitysnimi }}
        </p>
        <ep-button v-if="!naytaLisaaTyoryhmaa && virkailijat && virkailijat.length > tyoryhmaAlkuMaara" @click="naytaLisaaTyoryhmaa = true" variant="link" buttonClass="pl-0 mt-2">
          {{$t('nayta-lisaa')}}
        </ep-button>
      </ep-perustieto-data>

      <div>
        <ep-perustieto-data icon="comment" :topic="$t('yhteyshenkilo')">
          {{yhteyshenkilo}}
        </ep-perustieto-data>

        <ep-perustieto-data icon="kielet" :topic="$t('julkaisukielet')">
          {{julkaisukielet}}
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
import EpInput from '@shared/components/forms/EpInput.vue';
import EpPerustietoData from './EpPerustietoData.vue';
import { Kielet } from '@shared/stores/kieli';
import { PerusteprojektiDto, PerusteDto, Perusteprojektit, Perusteet } from '@shared/api/eperusteet';
import { TyoryhmaStore } from '@/stores/TyoryhmaStore';
import { parsiEsitysnimi } from '../../../eperusteet-frontend-utils/vue/src/utils/kayttaja';

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
    if (this.peruste) {
      return this.peruste.kuvaus;
    }
  }

  get yhteyshenkilo() {
    if (this.projekti) {
      return this.projekti.yhteistyotaho;
    }
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
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
@import "@/styles/_mixins.scss";
@include perustiedot-content;

</style>
