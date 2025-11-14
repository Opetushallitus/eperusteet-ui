<template>
  <div class="content">
    <div class="d-flex justify-content-between">
      <h3 class="mb-4">
        {{ $t('tiedotteet') }}
      </h3>
      <ep-tiedote-modal
        ref="eptiedotemodal"
        :peruste="peruste"
        :tiedotteet-store="tiedotteetStore"
      />
    </div>

    <ep-spinner v-if="!tiedotteet || !peruste" />

    <div v-else>
      <div
        v-for="(tiedote, index) in tiedotteetFiltered"
        :key="index"
        class="tiedote p-2 pl-3"
        @click="avaaTiedote(tiedote)"
      >
        <div
          class="otsikko"
          :class="{'uusi': tiedote.uusi}"
        >
          {{ $kaanna(tiedote.otsikko) }} <span
            v-if="tiedote.uusi"
            class="uusi"
          >{{ $t('uusi') }}</span>
        </div>
        <div class="muokkausaika">
          {{ $sdt(tiedote.muokattu) }}
        </div>
      </div>

      <div class="text-center">
        <ep-button
          v-if="tiedoteMaara < tiedotteetSize"
          variant="link"
          @click="tiedoteMaara += 3"
        >
          {{ $t('katso-lisaa-tiedotteita') }}
        </ep-button>
        <span v-if="tiedotteetSize === 0">{{ $t('ei-tiedotteita') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, useTemplateRef } from 'vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpTiedoteModal from '@shared/components/EpTiedoteModal/EpTiedoteModal.vue';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { PerusteDto, TiedoteDto } from '@shared/api/eperusteet';
import { $t, $kaanna, $sdt } from '@shared/utils/globals';

const props = defineProps({
  tiedotteetStore: {
    type: Object as () => TiedotteetStore,
    required: true,
  },
  peruste: {
    type: Object as () => PerusteDto,
    required: true,
  },
});

const tiedoteMaara = ref(3);
const eptiedotemodal = useTemplateRef('eptiedotemodal');

const tiedotteet = computed(() => {
  return props.tiedotteetStore.tiedotteet.value;
});

const tiedotteetSize = computed(() => {
  return _.size(props.tiedotteetStore.tiedotteet.value);
});

const onkoUusi = (aika) => {
  const paiva = 1000 * 60 * 60 * 24;
  const paivaSitten = Date.now() - paiva;

  return aika > paivaSitten;
};

const tiedotteetFiltered = computed(() => {
  return _.chain(props.tiedotteetStore.tiedotteet.value)
    .map(tiedote => {
      return {
        ...tiedote,
        uusi: onkoUusi(tiedote.luotu),
      };
    })
    .take(tiedoteMaara.value)
    .value();
});

const avaaTiedote = (tiedote: TiedoteDto) => {
  eptiedotemodal.value.muokkaa(tiedote);
};
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .content {

    .tiedote:nth-of-type(even) {
      background-color: $table-even-row-bg-color;
    }

    .tiedote:nth-of-type(odd) {
      background-color: $table-odd-row-bg-color;
    }

    .tiedote {

      &:hover{
        background-color: $table-hover-row-bg-color;
        cursor: pointer;
      }

      .otsikko {

        &.uusi {
          font-weight: bold;
        }

        .uusi {
          background-color: $blue-lighten-3;
          border-radius: 5px;
          padding: 2px 4px;
          font-size: 0.7rem;
          margin-left: 5px;
        }
      }

      .muokkausaika {
        color: $gray-lighten-1;
      }
    }

    :deep(.btn) {
      padding: 0px;
    }

  }

</style>
