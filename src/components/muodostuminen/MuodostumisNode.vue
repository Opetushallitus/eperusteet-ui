<template>
  <VueDraggable
    v-if="modelValue"
    v-bind="options"
    v-model="model"
    tag="div"
    :class="classes"
    @add="add"
    @start="onDragStart"
    @end="onDragEnd"
  >
    <div
      v-for="(node, idx) in model"
      :key="node.tunniste || node.uuid || idx"
      class="muodostumisnode"
      :class="{'draggable': isEditing}"
    >
      <MuodostumisItem
        ref="muodostumisItem"
        v-model="model[idx]"
        :depth="depth"
        :is-editing="isEditing"
        :tutkinnon-osat-map="tutkinnonOsatMap"
        :pakollinen="isPakollinen(node)"
        @remove="remove(idx)"
        @copy="copy(idx)"
      />
      <div
        v-if="node.isOpen || node.isOpen === undefined"
        class="children"
        :class="{muodostumisryhma: !!node.rooli && depth > 0}"
        :style="{ 'padding-left': 30 + 'px' }"
      >
        <MuodostumisNode
          ref="childNode"
          v-model="node.osat"
          :tutkinnon-osat-map="tutkinnonOsatMap"
          :depth="depth + 1"
          :is-editing="isEditing"
          :parent-mandatory="isPakollinen(node)"
          :copy-to-clip-board="copyToClipBoard"
        />
      </div>
    </div>
  </VueDraggable>
</template>

<script setup lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { ref, computed, withDefaults } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import _ from 'lodash';
import { RooliToTheme, ColorMap } from '@/components/muodostuminen/utils';
import MuodostumisItem from './MuodostumisItem.vue';
import { Kielet } from '@shared/stores/kieli';
import { $t } from '@shared/utils/globals';

function disassoc<T>(array: T[], idx: number): T[] {
  if (!_.isNumber(idx)) {
    throw new Error('not numbers');
  }
  if (idx < 0 || idx > _.size(array)) {
    throw new Error('off indexed');
  }
  return [...array.slice(0, idx), ...array.slice(idx + 1)];
}

function getIndex<T>(array: T[], idx: number): T {
  if (!_.isNumber(idx)) {
    throw new Error('not numbers');
  }
  if (idx < 0 || idx > _.size(array)) {
    throw new Error('off indexed');
  }
  return array[idx];
}

function assoc<T>(array: T[], element: T, idx: number): T[] {
  if (!_.isNumber(idx)) {
    throw new Error('not numbers');
  }
  if (idx < 0 || idx > _.size(array)) {
    throw new Error('off indexed');
  }
  return [...array.slice(0, idx), element, ...array.slice(idx)];
}

function swapped<T>(array: T[], a: number, b: number): T[] {
  if (!_.isNumber(a) || !_.isNumber(b)) {
    throw new Error('not numbers');
  }
  if (a < 0 || a >= _.size(array)) {
    throw new Error('off indexed');
  }
  if (b < 0 || b >= _.size(array)) {
    throw new Error('off indexed');
  }
  const result = [...array];
  result[a] = array[b];
  result[b] = array[a];
  return result;
}

const props = withDefaults(defineProps<{
  modelValue: any[];
  isEditing?: boolean;
  depth?: number;
  tutkinnonOsatMap: any;
  parentMandatory?: boolean | null;
  copyToClipBoard?: (node: any) => void;
}>(), {
  parentMandatory: null,
  depth: 0,
  isEditing: false,
  copyToClipBoard: () => {},
});

const emit = defineEmits(['update:modelValue']);

const muodostumisItem = ref<any[]>([]);
const childNode = ref<any[]>([]);
const tempValue = ref<any[] | null>(null);

const classes = computed(() => {
  if (props.depth === 0) {
    return '';
  }
  else if (props.depth === 1) {
    return 'rakenne-moduuli-root';
  }
  else {
    return 'rakenne-moduuli';
  }
});

const nodeColor = (node: any) => {
  if (node.rooli) {
    const mapped = RooliToTheme[node.rooli];
    if (mapped) {
      return ColorMap[mapped];
    }
    if (node.rooli === 'määritelty') {
      if (node.nimi[Kielet.getUiKieli.value] === $t('rakenne-moduuli-pakollinen')) {
        return ColorMap.pakollinen;
      }
      else if (node.nimi[Kielet.getUiKieli.value] === $t('rakenne-moduuli-ammatilliset')) {
        return ColorMap.ammatilliset;
      }
    }
    return ColorMap.valinnainen;
  }
  else {
    if (node.pakollinen) {
      return ColorMap.pakollinen;
    }
  }
  return '#fff';
};

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const options = computed(() => {
  return {
    animation: 300,
    emptyInsertThreshold: 10,
    group: {
      name: 'rakennepuu',
      pull: true,
      put: true,
    },
    disabled: !props.isEditing,
    ghostClass: 'rakenne-placeholder',
    scrollSensitivity: 50,
    forceFallback: true,
    move: (element) => {
      return !_.includes(element.to.classList, 'leikelauta') || !!element.draggedContext.element.rooli;
    },
  };
});

const onDragStart = (evt) => {
  tempValue.value = _.cloneDeep(model.value);
};

const onDragEnd = (evt) => {
  if (tempValue.value && _.includes(evt.to.classList, 'leikelauta')) {
    model.value = tempValue.value;
    tempValue.value = null;
  }
};

const move = (uuid: string, dir: 'up' | 'down' | 'left' | 'right') => {
  if (!props.isEditing) {
    return;
  }

  const idx = _.findIndex(props.modelValue, n => n.uuid === uuid);
  const nodes = _.map(props.modelValue, 'node');
  if (idx >= 0) {
    switch (dir) {
    case 'up':
      emit('update:modelValue', swapped(nodes, idx, idx - 1));
      break;
    case 'down':
      break;
    case 'left':
      break;
    case 'right':
      break;
    default: break;
    }
  }
};

const remove = (idx: number) => {
  emit('update:modelValue', disassoc(model.value, idx));
};

const toggleDescription = (toggle?) => {
  _.forEach(muodostumisItem.value, item => (item as any).toggleDescription(toggle));
  _.forEach(childNode.value, item => (item as any).toggleDescription(toggle));
};

const add = async (element) => {
  if (_.includes(element.from.classList, 'paaryhmat') && model.value[element.newIndex] && model.value[element.newIndex].rooli === 'määrittelemätön') {
    const uuid = _.get(model.value[element.newIndex], 'uuid');
    const item = _.find(muodostumisItem.value, item => _.get(item, 'innerModel.uuid') === uuid);

    if (item) {
      (item as any).edit();
    }
  }
};

const copy = (idx: number) => {
  if (props.copyToClipBoard) {
    props.copyToClipBoard(getIndex(model.value, idx));
  }
};

const isPakollinen = (node) => {
  if (props.parentMandatory !== null) {
    return props.parentMandatory;
  }

  if (node.nimi && node.nimi[Kielet.getUiKieli.value] === $t('rakenne-moduuli-valinnainen')) {
    return false;
  }

  if (node.nimi && node.nimi[Kielet.getUiKieli.value] === $t('rakenne-moduuli-pakollinen')) {
    return true;
  }

  return null;
};

defineExpose({
  move,
  toggleDescription,
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

$ryhma-height: 52px;
$linecolor: #ccc;
.children {
  background: #f2f2f2;
}

.ryhma {
  .nimi {
    font-weight: 600;
    font-size: 80%;
  }
}

.muodostumisnode {
  &.draggable {
    cursor: grab;
  }
}

.colorblock {
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  width: 8px;
  display: block;
}
</style>
