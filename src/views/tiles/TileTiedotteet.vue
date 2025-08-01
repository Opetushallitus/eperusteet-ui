<template>
  <EpHomeTile
    icon="description"
    :route="{ name: 'tiedotteet' }"
    :count="uudetTiedotteetCount"
  >
    <template #header>
      <span>{{ $t('tiedotteet') }}</span>
    </template>
    <template #content>
      <div v-if="tiedotteet.length > 0">
        <div
          v-for="(tiedote, index) in viimeisimmatTiedotteet"
          :key="index"
          class="row justify-content-center text-left"
        >
          <div class="col-2">
            {{ $sd(tiedote.muokattu) }}
          </div>
          <div
            class="col-8 otsikko"
            :class="{'font-weight-bold': tiedote.uusi}"
          >
            {{ $kaanna(tiedote.otsikko) }}
          </div>
        </div>
      </div>
      <div v-else-if="tiedotteet.length === 0">
        <p>{{ $t('ei-tiedotteita') }}</p>
      </div>
      <ep-spinner v-else />
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import _ from 'lodash';
import { perustetila } from '@shared/utils/perusteet';
import { onkoUusi } from '@shared/utils/tiedote';
import { $t, $sd, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  tiedotteetStore: TiedotteetStore;
}>();

onMounted(() => {
  props.tiedotteetStore.fetch();
});

const isLoading = computed(() => {
  return !!tiedotteet.value;
});

const tiedotteet = computed(() => {
  if (props.tiedotteetStore.tiedotteet.value) {
    return _.chain(props.tiedotteetStore.tiedotteet.value)
      .filter(tiedote => _.isEmpty(tiedote.perusteet) || !_.some(tiedote.perusteet, (peruste) => (peruste.tila as any) !== perustetila.valmis))
      .map(tiedote => {
        return {
          ...tiedote,
          uusi: onkoUusi(tiedote.luotu),
        };
      })
      .value();
  }

  return [];
});

const viimeisimmatTiedotteet = computed(() => {
  return _.take(tiedotteet.value, 3);
});

const uudetTiedotteetCount = computed(() => {
  return _.size(_.filter(tiedotteet.value, 'uusi'));
});
</script>

<style scoped lang="scss">
.tiedotteet {
  text-align: left;
  display: grid;

  .tiedote {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;

    small {
      color: #071A58;
    }
  }

}

.otsikko {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

</style>
