<template>
  <div class="content">

    <div class="d-flex justify-content-between">
      <h3>{{$t('aikataulu')}}</h3>
      <ep-aikataulu-modal :aikataulut="aikataulut" @tallenna="tallenna" :julkinen-valinta="isAmmatillinen" :pakollisetTapahtumat="['tavoite']">
        <template #aikataululistaus-julkaisu-header>
          <label>
            {{$t('peruste-astuu-voimaan')}}
          </label>
        </template>
        <template #luomispaiva-topic>
          <span v-html="$t('projektin-luomispaiva')"></span>
        </template>
        <template #julkaisupaiva-topic>
          <span v-html="$t('peruste-astuu-voimaan')"></span>
        </template>
      </ep-aikataulu-modal>
    </div>

    <ep-aikataulu :aikataulut="aikataulut">
      <template #luomispaiva-topic>
        <span v-html="$t('projektin-luomispaiva')"></span>
      </template>
      <template #julkaisupaiva-topic>
        <span v-html="$t('peruste-astuu-voimaan')"></span>
      </template>
    </ep-aikataulu>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpAikatauluModal from '@shared/components/EpAikataulu/EpAikatauluModal.vue';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { Kielet } from '@shared/stores/kieli';
import * as _ from 'lodash';
import { PerusteAikatauluDtoTapahtumaEnum } from '@shared/api/eperusteet';
import { isKoulutustyyppiAmmatillinen } from '@shared/utils/perusteet';
import { $t, $success, $fail } from '@shared/utils/globals';

const props = defineProps<{
  aikatauluStore: AikatauluStore;
}>();

const hasTapahtuma = (tapahtumaEnum: PerusteAikatauluDtoTapahtumaEnum) => {
  return _.head(_.filter(props.aikatauluStore.aikataulutapahtumat.value, tapahtuma => _.toLower(tapahtuma.tapahtuma) === _.toLower(tapahtumaEnum)));
};

const createDefaultTapahtuma = (tapahtuma: PerusteAikatauluDtoTapahtumaEnum, tavoite: any, tapahtumapaiva?: Date) => {
  return {
    tapahtuma: _.toLower(tapahtuma),
    tavoite: tavoite,
    tapahtumapaiva: tapahtumapaiva,
    julkinen: false,
  };
};

const aikataulut = computed(() => {
  if (props.aikatauluStore.aikataulutapahtumat.value) {
    let aikataulu = props.aikatauluStore.aikataulutapahtumat.value as any;

    if (!hasTapahtuma(PerusteAikatauluDtoTapahtumaEnum.LUOMINEN)) {
      aikataulu = [
        ...aikataulu,
        createDefaultTapahtuma(
          PerusteAikatauluDtoTapahtumaEnum.LUOMINEN,
          { [Kielet.getSisaltoKieli.value]: $t('peruste-luotu') },
          props.aikatauluStore.peruste.value!.luotu as Date),
      ];
    }

    if (!hasTapahtuma(PerusteAikatauluDtoTapahtumaEnum.LAUSUNTOKIERROS)) {
      aikataulu = [
        ...aikataulu,
        createDefaultTapahtuma(
          PerusteAikatauluDtoTapahtumaEnum.LAUSUNTOKIERROS,
          { [Kielet.getSisaltoKieli.value]: $t('lausuntokierros-alkaa') }),
      ];
    }

    if (!hasTapahtuma(PerusteAikatauluDtoTapahtumaEnum.JOHTOKUNNANKASITTELY)) {
      aikataulu = [
        ...aikataulu,
        createDefaultTapahtuma(
          PerusteAikatauluDtoTapahtumaEnum.JOHTOKUNNANKASITTELY,
          { [Kielet.getSisaltoKieli.value]: $t('johtokunnan-kasittely') }),
      ];
    }

    if (!hasTapahtuma(PerusteAikatauluDtoTapahtumaEnum.ARVIOITUJULKAISUPAIVA)) {
      aikataulu = [
        ...aikataulu,
        createDefaultTapahtuma(
          PerusteAikatauluDtoTapahtumaEnum.ARVIOITUJULKAISUPAIVA,
          { [Kielet.getSisaltoKieli.value]: $t('perusteen-arvioitu-julkaisupaiva') }),
      ];
    }

    if (!hasTapahtuma(PerusteAikatauluDtoTapahtumaEnum.JULKAISU)) {
      aikataulu = [
        ...aikataulu,
        createDefaultTapahtuma(
          PerusteAikatauluDtoTapahtumaEnum.JULKAISU,
          { [Kielet.getSisaltoKieli.value]: $t('peruste-astuu-voimaan') }),
      ];
    }

    return aikataulu;
  }

  return [];
});

const isAmmatillinen = computed(() => {
  if (props.aikatauluStore.peruste.value) {
    return isKoulutustyyppiAmmatillinen(props.aikatauluStore.peruste.value.koulutustyyppi!);
  }
  return false;
});

const tallenna = async (aikataulut) => {
  try {
    await props.aikatauluStore.saveAikataulut(_.filter(aikataulut, 'tapahtumapaiva'));
    $success($t('aikataulu-tallennettu') as string);
  }
  catch (e) {
    $fail($t('virhe-palvelu-virhe') as string);
  }
};
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
</style>
