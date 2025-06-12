<template>
  <div class="dokumentit">
    <div class="ylapaneeli d-flex align-items-center">
        <h2 class="otsikko">{{ $t('luo-pdf') }}</h2>
    </div>
    <div class="sisalto">
      <div class="mb-4">
        <h3>{{ $t('luo-ja-lataa-pdf') }}</h3>
        <p>{{ $t(selitteenteksti)}}</p>
        <ep-pdf-luonti :store="perusteDokumenttiStore" :pdfnimi="perusteNimi"/>

        <h4 v-if="kvliite" class="mt-5">{{$t('kvliite')}}</h4>
        <ep-pdf-luonti v-if="kvliite" :store="kvliiteStore" pdfnimi="kvliite" :nayta-julkaistu="false"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Kielet } from '@shared/stores/kieli';
import EpPdfLuonti from '@shared/components/EpPdfLuonti/EpPdfLuonti.vue';
import { DokumenttiStore } from '@/stores/DokumenttiStore';
import { PerusteDto } from '@shared/api/eperusteet';
import { isKoulutustyyppiAmmatillinen } from '@shared/utils/perusteet';
import { $kaanna, $t } from '@shared/utils/globals';


const props = withDefaults(defineProps<{
  selitteenteksti?: string;
  projektiId?: number;
  perusteId?: number;
  perusteStore?: any;
}>(), {
  selitteenteksti: 'luo-peruste-pdf-selite',
});

const perusteDokumenttiStore = ref<DokumenttiStore | null>(null);
const kvliiteStore = ref<DokumenttiStore | null>(null);

const perusteenSuoritustapa = computed(() => {
  return props.perusteStore.perusteSuoritustapa.value as string;
});

const peruste = computed(() => {
  return props.perusteStore.peruste.value as PerusteDto;
});

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const perusteNimi = computed(() => {
  if (peruste.value) {
    return $kaanna(peruste.value.nimi as any);
  }
  return undefined;
});

const kvliite = computed(() => {
  if (peruste.value) {
    return isKoulutustyyppiAmmatillinen(peruste.value.koulutustyyppi as string) && !props.perusteStore.isOpas.value;
  }
  return false;
});

const onProjektiChange = async () => {
  perusteDokumenttiStore.value = new DokumenttiStore(peruste.value, perusteenSuoritustapa.value, 'uusi');
  perusteDokumenttiStore.value.init();

  kvliiteStore.value = new DokumenttiStore(peruste.value, perusteenSuoritustapa.value, 'kvliite');
  kvliiteStore.value.init();
};

watch(kieli, async () => {
  await perusteDokumenttiStore.value?.init();
  await kvliiteStore.value?.init();
});

// Initialize when component is mounted or when project changes
onMounted(async () => {
  await onProjektiChange();
});

// Watch for changes in the peruste or projektiId
watch([() => props.projektiId, () => props.perusteId], async () => {
  if (props.projektiId && props.perusteId) {
    await onProjektiChange();
  }
});
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

}

</style>
