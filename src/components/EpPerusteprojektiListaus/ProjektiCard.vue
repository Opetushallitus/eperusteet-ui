<template>
  <router-link
    :to="link"
    :class="classes"
  >
    <div
      v-if="koulutustyyppi"
      class="p-2 pl-4 shrink"
    >
      <EpColorIndicator
        :size="16"
        :kind="koulutustyyppi"
      />
    </div>
    <div
      v-else-if="tileImage"
      :style="style"
      class="w-full h-full"
    />
    <div v-else />
    <div class="flex-1 flex items-center justify-center font-semibold text-[90%] h-full text-center p-2">
      <slot />
    </div>
    <div
      v-if="hasLowerSlot"
      class="lower-slot shrink flex items-center justify-center text-center mx-5 border-t h-[62px] min-h-[62px] max-h-[62px] text-[80%]"
    >
      <slot name="lower" />
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import * as _ from 'lodash';
import { hasSlotContent } from '@shared/utils/vue-utils';

export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

const props = defineProps<{
  fullBackground?: boolean;
  koulutustyyppi?: string;
  link?: any;
  tileImage?: any;
  eiTuetutKoulutustyypit?: string[];
}>();

const slots = useSlots();

const style = computed(() => {
  return {
    'background-repeat': 'no-repeat',
    ...props.tileImage,
  };
});

const hasLowerSlot = computed(() => {
  return hasSlotContent(slots.lower);
});

const classes = computed(() => {
  const base = 'project-card block rounded-2xl border cursor-pointer h-[230px] max-h-[230px] max-w-[192px] min-h-[230px] min-w-[192px]';
  if (props.fullBackground) {
    return `${base} project-card-full h-full`;
  }
  const notSupported = _.includes(props.eiTuetutKoulutustyypit, props.koulutustyyppi) ? 'project-card-not-supported' : '';
  return `${base} flex flex-col h-full ${notSupported}`;
});
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.project-card {
  border-color: $grey100;
  box-shadow: 5px 5px 20px 1px rgba(27, 61, 142, 0.08);

  &:hover {
    box-shadow: 5px 5px 20px 3px rgba(27, 41, 102, 0.12);
  }

  &.project-card-full {
    background: linear-gradient(180deg, #3C839F 0%, #4797B7 100%);
    color: $white;
  }

  &.project-card-not-supported {
    background-color: $grey50;
  }
}

.lower-slot {
  border-color: $grey100;
  color: $blue1;
}
</style>
