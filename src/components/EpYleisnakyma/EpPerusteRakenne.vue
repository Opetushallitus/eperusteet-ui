<template>
  <div class="content">
    <h3>{{ $t('rakenne') }}</h3>

    <ep-spinner v-if="!peruste" />

    <ep-small-data-box
      :topic="$t('tekstikappaleita')"
      :count="tekstikappaleita"
    />
    <ep-small-data-box
      v-if="hasLisasisalto"
      :topic="$t(lisasisaltoOtsikko)"
      :count="lisasisaltoMaara"
    />
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed } from 'vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSmallDataBox from '@/components/EpYleisnakyma/EpSmallDataBox.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { $t } from '@shared/utils/globals';

const props = defineProps({
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
});

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

const peruste = computed(() => {
  return props.perusteStore.peruste.value;
});

const sisaltoLapset = (sisalto) => {
  return _.chain(sisalto.children)
    .map(lapsi => {
      return [
        lapsi,
        ...sisaltoLapset(lapsi),
      ];
    })
    .flatten()
    .value();
};

const sisaltoFlat = computed(() => {
  return sisaltoLapset(props.perusteStore.navigation.value);
});

const tekstikappaleita = computed(() => {
  return _.size(_.filter(sisaltoFlat.value, sisalto => sisalto.type === 'viite'));
});

const hasLisasisalto = computed(() => {
  return !!_.get(koulutustyyppiLisasisalto, peruste.value?.koulutustyyppi!);
});

const lisasisaltoOtsikko = computed(() => {
  return koulutustyyppiLisasisalto[peruste.value?.koulutustyyppi!]['otsikko'];
});

const lisasisaltoMaara = computed(() => {
  return _.size(_.filter(sisaltoFlat.value, sisalto => sisalto.type === koulutustyyppiLisasisalto[peruste.value?.koulutustyyppi!]['tietue']));
});
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
</style>
