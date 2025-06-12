<template>
  <EpMainView>
    <EpPerusteprojektiListaus :provider="pohjatStore"
                              :edit-route="'perusteprojekti'"
                              :new-route="{ name: 'pohjaLuonti' }"
                              :is-pohja="true"
                              :luontioikeus="{ 'oikeus': 'hallinta', 'kohde': 'pohja' }"
                              :showCards="$isAdmin()">
      <template #upperheader>
        <h2>{{ $t('pohjasi') }}</h2>
      </template>
      <template #lowerheader>
        <h2>{{ $t('kaikki-pohjat') }}</h2>
      </template>
    </EpPerusteprojektiListaus>
  </EpMainView>
</template>

<script setup lang="ts">
import { getCurrentInstance, computed } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  pohjatStore: PerusteetStore;
}>();

const pohjatStore = computed(() => {
  return props.pohjatStore;
});
</script>

<style lang="scss">
</style>
