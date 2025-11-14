<template>
  <EpMainView>
    <EpPerusteprojektiListaus
      :provider="perusteetStore"
      :edit-route="'perusteprojekti'"
      :new-route="{ name: 'perusteprojektiLuonti' }"
      :filters="['koulutustyyppi', 'amosaayhteinen', 'tila', 'voimassaolo']"
      :ei-tuetut-koulutustyypit="eiTuetutKoulutustyypit"
    >
      <template #upperheader>
        <h2>{{ $t('perusteprojektisi') }}</h2>
      </template>
      <template #published-header>
        <h2>{{ $t('julkaistut-perusteet') }}</h2>
      </template>
      <template #lowerheader>
        <h2>{{ $t('kaikki-perusteprojektit') }}</h2>
      </template>
    </EpPerusteprojektiListaus>
  </EpMainView>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { EiTuetutKoulutustyypit } from '@/utils/perusteet';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  perusteetStore: PerusteetStore;
}>();

const eiTuetutKoulutustyypit = computed(() => {
  return EiTuetutKoulutustyypit;
});

const perusteetStore = computed(() => {
  return props.perusteetStore;
});
</script>
