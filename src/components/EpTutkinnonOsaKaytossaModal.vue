<template>
  <div>
    <ep-button variant="link" @click="avaa" icon="edit">{{ $t('muokkaa') }}</ep-button>

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

<script setup lang="ts">
import * as _ from 'lodash';
import { ref, computed, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PerusteprojektinPerusteenosaDto, PerusteInfoDto } from '@shared/api/eperusteet';
import { Kielet } from '@shared/stores/kieli';
import { $t, $kaanna, $sd, $bvModal } from '@shared/utils/globals';

const props = defineProps<{
  projektit: PerusteprojektinPerusteenosaDto[];
  alkuperainenPeruste?: PerusteInfoDto;
  kopioi: Function;
  muokkaa: Function;
}>();

const route = useRoute();

const kopiointiLoading = ref(false);
const muokkausLoading = ref(false);

const avaa = async () => {
  $bvModal.show('EpTutkinnonOsaKaytossaModal');
};

const perusteet = computed(() => {
  return _.chain(props.projektit)
    .map(projekti => {
      return {
        ...projekti.peruste,
        alkuperainen: projekti?.peruste?.id === props.alkuperainenPeruste?.id,
      };
    })
    .sortBy(['alkuperainen', 'id'])
    .reverse()
    .value();
});

const kasiteltavaPeruste = computed(() => {
  return _.get(_.find(props.projektit, projekti => projekti.id === _.toNumber(route.params.projektiId)), 'peruste');
});

const perusteNimi = computed(() => {
  return kasiteltavaPeruste.value?.nimi ? kasiteltavaPeruste.value.nimi[Kielet.getSisaltoKieli.value] : '';
});

const kasitellaanAlkuperaista = computed(() => {
  return kasiteltavaPeruste.value?.id === props.alkuperainenPeruste?.id;
});

const eiAlkuperaa = computed(() => {
  return !_.some(perusteet.value, 'alkuperainen');
});

const teeKopio = async () => {
  kopiointiLoading.value = true;
  await props.kopioi();
  $bvModal.hide('EpTutkinnonOsaKaytossaModal');
};

const kaynnistaMuokkaus = async () => {
  muokkausLoading.value = true;
  await props.muokkaa();
  $bvModal.hide('EpTutkinnonOsaKaytossaModal');
};

defineExpose({ avaa });
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

  :deep(.ep-button.pl-0) {

    .btn {
      padding-left: 0 !important;
    }
    .teksti {
      padding-left: 0 !important;
    }
  }

</style>
