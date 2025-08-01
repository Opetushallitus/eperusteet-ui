<template>
  <div class="perustiedot-content">
    <router-link :to="{ name: 'projektinTiedot'}">
      <h3>{{ $t('projektin-tiedot') }}</h3>
    </router-link>

    <div class="row">
      <div class="col-12">
        <ep-perustieto-data
          icon="info"
          :topic="$t('projektin-kuvaus')"
          class="w-100"
        >
          <div v-html="$kaanna(projektinKuvaus)" />
        </ep-perustieto-data>
      </div>
    </div>

    <div class="row">
      <div class="col-5">
        <ep-perustieto-data
          icon="comment"
          :topic="$t('yhteyshenkilo')"
        >
          {{ yhteyshenkilo }}
        </ep-perustieto-data>
      </div>
      <div class="col-7">
        <ep-perustieto-data
          icon="language"
          :topic="$t('julkaisukielet')"
        >
          {{ julkaisukielet }}
        </ep-perustieto-data>
      </div>
    </div>

    <div class="row">
      <div class="col-5">
        <ep-perustieto-data
          icon="calendar_today"
          :topic="$t('luotu')"
        >
          {{ $sdt(peruste.luotu) }}
        </ep-perustieto-data>
      </div>
      <div class="col-7">
        <ep-perustieto-data
          icon="calendar_today"
          :topic="$t('julkaistu')"
        >
          {{ $sdt(peruste.viimeisinJulkaisuAika) }}
        </ep-perustieto-data>
      </div>
    </div>

    <div class="row">
      <div class="col-5">
        <ep-perustieto-data
          v-if="virkailijat"
          icon="groups"
          :topic="$t('tyoryhma')"
          class="w-60"
        >
          <p
            v-for="virkailija in virkailijat"
            :key="virkailija.oid"
            class="mb-1"
          >
            {{ virkailija.esitysnimi }}
          </p>
          <ep-button
            v-if="!naytaLisaaTyoryhmaa && virkailijat && virkailijat.length > tyoryhmaAlkuMaara"
            variant="link"
            button-class="pl-0 mt-2"
            @click="naytaLisaaTyoryhmaa = true"
          >
            {{ $t('nayta-lisaa') }}
          </ep-button>
        </ep-perustieto-data>
      </div>
      <div class="col-7">
        <EpPerustietoData icon="visibility">
          <template #header>
            {{ $t('esikatsele-perustetta') }}
          </template>
          <template v-if="!projekti.esikatseltavissa">
            {{ $t('et-ole-sallinut-esikatselua') }}
          </template>
          <template v-else>
            <ep-external-link :url="esikatseluUrl" />
          </template>
        </EpPerustietoData>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed } from 'vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpPerustietoData from '@shared/components/EpPerustietoData/EpPerustietoData.vue';
import { Kielet } from '@shared/stores/kieli';
import { PerusteprojektiDto, PerusteDto } from '@shared/api/eperusteet';
import { TyoryhmaStore } from '@/stores/TyoryhmaStore';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';
import { buildPerusteEsikatseluUrl } from '@shared/utils/esikatselu';
import { $t, $kaanna, $sdt } from '@shared/utils/globals';

const props = defineProps<{
  projekti: PerusteprojektiDto;
  peruste: PerusteDto;
  tyoryhmaStore: TyoryhmaStore;
}>();

const tyoryhmaAlkuMaara = 5;
const naytaLisaaTyoryhmaa = ref(false);

const projektinKuvaus = computed(() => {
  return props.projekti.kuvaus;
});

const yhteyshenkilo = computed(() => {
  return props.projekti?.yhteistyotaho || null;
});

const julkaisukielet = computed(() => {
  if (props.peruste) {
    return _.map(props.peruste.kielet, (kieli) => Kielet.kaannaOlioTaiTeksti(kieli)).join(', ');
  }
  return '';
});

const tyoryhma = computed(() => {
  return props.tyoryhmaStore.perusteenTyoryhma.value;
});

const virkailijat = computed(() => {
  if (props.tyoryhmaStore.tyoryhmanVirkailiijat.value) {
    return _.chain(props.tyoryhmaStore.tyoryhmanVirkailiijat.value)
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
});

const esikatseluUrl = computed(() => {
  if (props.peruste) {
    return buildPerusteEsikatseluUrl(props.peruste);
  }
  return '';
});
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
@import "@/styles/_mixins.scss";
@include perustiedot-content;
</style>
