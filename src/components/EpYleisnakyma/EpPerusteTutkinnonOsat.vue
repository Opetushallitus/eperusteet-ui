<template>
  <div class="content">
    <h3>{{ $t('tutkinnon-osat') }}</h3>

    <ep-spinner v-if="!tutkinnonOsat || !peruste" />

    <div v-else>
      <ep-small-data-box
        :topic="$t('tuotua')"
        :count="tutkinnonOsiaTuotu"
      />
      <ep-small-data-box
        :topic="$t('luotu')"
        :count="tutkinnonOsiaLuotu"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed } from 'vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { PerusteDto } from '@shared/api/eperusteet';
import EpSmallDataBox from '@/components/EpYleisnakyma/EpSmallDataBox.vue';
import { $t } from '@shared/utils/globals';

const props = defineProps({
  tutkinnonOsaStore: {
    type: Object as () => TutkinnonOsaStore,
    required: true,
  },
  peruste: {
    type: Object as () => PerusteDto,
    required: true,
  },
});

const tutkinnonOsat = computed(() => {
  return props.tutkinnonOsaStore.tutkinnonOsat.value;
});

const tutkinnonOsiaLuotu = computed(() => {
  return _.size(_.filter(props.tutkinnonOsaStore.tutkinnonOsat.value,
    tutkinnonosaViite => !tutkinnonosaViite.tutkinnonOsa?.alkuperainenPeruste || tutkinnonosaViite.tutkinnonOsa.alkuperainenPeruste.id === props.peruste.id));
});

const tutkinnonOsiaTuotu = computed(() => {
  return _.size(props.tutkinnonOsaStore.tutkinnonOsat.value) - tutkinnonOsiaLuotu.value;
});
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
</style>
