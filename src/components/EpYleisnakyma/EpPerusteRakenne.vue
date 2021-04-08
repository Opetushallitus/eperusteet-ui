<template>
  <div class="content">
    <h3>{{$t('rakenne')}}</h3>

    <ep-spinner v-if="!peruste" />

    <ep-small-data-box :topic="$t('tekstikappaleita')" :count="tekstikappaleita" />
    <ep-small-data-box v-if="hasLisasisalto" :topic="$t(lisasisaltoOtsikko)" :count="lisasisaltoMaara" />

  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { PerusteDto } from '@shared/api/eperusteet';
import EpSmallDataBox from '@/components/EpYleisnakyma/EpSmallDataBox.vue';
import { PerusteStore } from '@/stores/PerusteStore';

const koulutustyyppiLisasisalto = {
  'koulutustyyppi_10': {
    otsikko: 'opintokokonaisuutta',
    tietue: 'opintokokonaisuus',
  },
  'koulutustyyppi_30': {
    otsikko: 'tavoitesisaltoalueita',
    tietue: 'tavoitesisaltoalue',
  },
  'koulutustyyppi_35': {
    otsikko: 'tavoitesisaltoalueita',
    tietue: 'tavoitesisaltoalue',
  },
  'koulutustyyppi_40': {
    otsikko: 'koulutuksenosaa',
    tietue: 'koulutuksenosa',
  },
};

@Component({
  components: {
    EpSpinner,
    EpSmallDataBox,
  },
})
export default class EpRakenne extends Vue {
  @Prop({ required: true })
  protected perusteStore!: PerusteStore;

  get peruste() {
    return this.perusteStore.peruste.value;
  }

  get tekstikappaleita() {
    return _.size(_.filter(this.sisaltoFlat, sisalto => sisalto.type === 'viite'));
  }

  get hasLisasisalto() {
    return !!_.get(koulutustyyppiLisasisalto, this.peruste?.koulutustyyppi!);
  }

  get lisasisaltoOtsikko() {
    return koulutustyyppiLisasisalto[this.peruste?.koulutustyyppi!]['otsikko'];
  }

  get lisasisaltoMaara() {
    return _.size(_.filter(this.sisaltoFlat, sisalto => sisalto.type === koulutustyyppiLisasisalto[this.peruste?.koulutustyyppi!]['tietue']));
  }

  get sisaltoFlat() {
    return this.sisaltoLapset(this.perusteStore.navigation.value);
  }

  sisaltoLapset(sisalto) {
    return _.chain(sisalto.children)
      .map(lapsi => {
        return [
          lapsi,
          ...this.sisaltoLapset(lapsi),
        ];
      })
      .flatten()
      .value();
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
</style>
