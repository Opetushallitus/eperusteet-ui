<template>
  <draggable
    v-if="value"
    v-bind="options"
    tag="div"
    :class="classes"
    v-model="model"
    @add="add"
    @start="onDragStart"
    @end="onDragEnd">
      <div v-for="(node, idx) in model" :key="node.tunniste || node.uuid || idx" class="muodostumisnode" :class="{'draggable': isEditing}">
        <MuodostumisItem v-model="model[idx]"
                        :depth="depth"
                        :is-editing="isEditing"
                        :tutkinnonOsatMap="tutkinnonOsatMap"
                        @remove="remove(idx)"
                        @copy="copy(idx)"
                        :pakollinen="isPakollinen(node)"
                        ref="muodostumisItem">
        </MuodostumisItem>
        <div class="children"
            :class="{muodostumisryhma: !!node.rooli && depth > 0}"
            :style="{ 'padding-left': 30 + 'px' }"
            v-if="node.isOpen || node.isOpen === undefined">
          <MuodostumisNode
            ref="childNode"
            :tutkinnonOsatMap="tutkinnonOsatMap"
            :depth="depth + 1"
            v-model="node.osat"
            :is-editing="isEditing"
            :parentMandatory="isPakollinen(node)"
            :copyToClipBoard="copyToClipBoard">
          </MuodostumisNode>
        </div>
      </div>
  </draggable>
</template>

<script lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { Prop, Component, Vue } from 'vue-property-decorator';
import draggable from 'vuedraggable';
import _ from 'lodash';
import { RooliToTheme, ColorMap } from '@/components/muodostuminen/utils';
import MuodostumisItem from './MuodostumisItem.vue';
import { Kielet } from '@shared/stores/kieli';

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

@Component({
  name: 'MuodostumisNode',
  components: {
    EpButton,
    MuodostumisItem,
    draggable,
  },
})
export default class MuodostumisNode extends Vue {
  @Prop({ required: true })
  private value!: any[];

  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ default: 0 })
  private depth!: number;

  @Prop({ required: true })
  private tutkinnonOsatMap!: any;

  @Prop({ default: null, type: Boolean })
  private parentMandatory!: boolean | null;

  @Prop({ default: false })
  private copyToClipBoard!: Function;

  private tempValue: any[] | null = null;

  get classes() {
    if (this.depth === 0) {
      return '';
    }
    else if (this.depth === 1) {
      return 'rakenne-moduuli-root';
    }
    else {
      return 'rakenne-moduuli';
    }
  }

  nodeColor(node: any) {
    if (node.rooli) {
      const mapped = RooliToTheme[node.rooli];
      if (mapped) {
        return ColorMap[mapped];
      }
      if (node.rooli === 'määritelty') {
        if (node.nimi[Kielet.getUiKieli.value] === this.$t('rakenne-moduuli-pakollinen')) {
          return ColorMap.pakollinen;
        }
        else if (node.nimi[Kielet.getUiKieli.value] === this.$t('rakenne-moduuli-ammatilliset')) {
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
  }

  get model() {
    return this.value;
  }

  set model(value) {
    this.$emit('input', value);
  }

  get options() {
    return {
      animation: 300,
      emptyInsertThreshold: 10,
      group: {
        name: 'rakennepuu',
        pull: true,
      },
      disabled: !this.isEditing,
      ghostClass: 'rakenne-placeholder',
      scrollSensitivity: 50,
      forceFallback: true,
      move: (element) => {
        return !_.includes(element.to.classList, 'leikelauta') || !!element.draggedContext.element.rooli;
      },
    };
  }

  onDragStart(evt) {
    this.tempValue = _.cloneDeep(this.model);
  }

  onDragEnd(evt) {
    if (this.tempValue && _.includes(evt.to.classList, 'leikelauta')) {
      this.model = this.tempValue;
      this.tempValue = null;
    }
  }

  public move(uuid: string, dir: 'up' | 'down' | 'left' | 'right') {
    if (!this.isEditing) {
      return;
    }

    const idx = _.findIndex(this.value, n => n.uuid === uuid);
    const nodes = _.map(this.value, 'node');
    if (idx >= 0) {
      switch (dir) {
      case 'up':
        this.$emit('input', swapped(nodes, idx, idx - 1));
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
  }

  remove(idx: number) {
    this.$emit('input', disassoc(this.model, idx));
  }

  toggleDescription(toggle?) {
    _.forEach(this.$refs['muodostumisItem'], item => (item as any).toggleDescription(toggle));
    _.forEach(this.$refs['childNode'], item => (item as any).toggleDescription(toggle));
  }

  async add(element) {
    if (_.includes(element.from.classList, 'paaryhmat') && this.model[element.newIndex] && this.model[element.newIndex].rooli === 'määrittelemätön') {
      const uuid = _.get(this.model[element.newIndex], 'uuid');
      const muodostumisItem = _.find(this.$refs['muodostumisItem'], item => _.get(item, 'innerModel.uuid') === uuid);

      if (muodostumisItem) {
        (muodostumisItem as any).edit();
      }
    }
  }

  copy(idx: number) {
    if (this.copyToClipBoard) {
      this.copyToClipBoard(getIndex(this.model, idx));
    }
  }

  isPakollinen(node) {
    if (this.parentMandatory !== null) {
      return this.parentMandatory;
    }

    if (node.nimi && node.nimi[Kielet.getUiKieli.value] === this.$t('rakenne-moduuli-valinnainen')) {
      return false;
    }

    if (node.nimi && node.nimi[Kielet.getUiKieli.value] === this.$t('rakenne-moduuli-pakollinen')) {
      return true;
    }

    return node.rooli === 'määritelty' || node.pakollinen;
  }
}
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
