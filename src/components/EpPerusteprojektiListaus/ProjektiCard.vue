<template>
  <router-link
    :to="link"
    :class="classes"
  >
    <div
      v-if="koulutustyyppi"
      class="p-2 pl-4 flex-shrink-1"
    >
      <EpColorIndicator
        :size="16"
        :kind="koulutustyyppi"
      />
    </div>
    <div
      v-else-if=" tileImage"
      :style="style"
      class="w-100 h-100"
    />
    <div v-else />
    <div class="flex-grow-1 mainslot h-100">
      <slot />
    </div>
    <div
      v-if="hasLowerSlot"
      class="flex-shrink-1 lower d-flex align-items-center justify-content-center text-center"
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
  if (props.fullBackground) {
    return 'project-card full-color h-100';
  }
  else {
    return 'project-card d-flex flex-column h-100 ' + (_.includes(props.eiTuetutKoulutustyypit, (props.koulutustyyppi)) ? 'not-supported' : '');
  }
});
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.full-color {
  background: linear-gradient(180deg, #3C839F 0%, #4797B7 100%);
  color: white;
}

.project-card {
  display: block;
  border-radius: 16px;
  border: 1px solid #ebebeb;
  box-shadow: 5px 5px 20px 1px rgba(27,61,142,0.08);
  cursor: pointer;
  height: 230px;
  max-height: 230px;
  max-width: 192px;
  min-height: 230px;
  min-width: 192px;

  &:hover {
    box-shadow: 5px 5px 20px 3px rgba(27,41,102,0.12);
  }

  &.not-supported {
    background-color: $gray-lighten-5;
  }
}

.mainslot {
  font-weight: 600;
  font-size: 90%;
}

.lower {
  margin: 0 20px 0 20px;
  border-top: 1px solid #ebebeb;
  height: 62px;
  min-height: 62px;
  max-height: 62px;
  font-size: 80%;
  color: #2b4174;
}

</style>
