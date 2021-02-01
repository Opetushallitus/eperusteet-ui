<template>
  <draggable
    v-if="value"
    v-bind="options"
    tag="div"
    :class="classes"
    v-model="model"
    @add="add">
      <div v-for="(node, idx) in model" :key="node.tunniste || node.uuid || idx" class="muodostumisnode">
        <MuodostumisItem v-model="model[idx]"
                        :depth="depth"
                        :is-editing="isEditing"
                        :tutkinnonOsatMap="tutkinnonOsatMap"
                        @toggle="toggleOpen"
                        @remove="remove(idx)"
                        :isOpen="isOpen"
                        :parentMandatory="parentMandatory"
                        ref="muodostumisItem">
        </MuodostumisItem>

        <div class="children" :class="{muodostumisryhma: !!node.rooli && depth > 0}" :style="{ 'padding-left': 30 + 'px' }" v-if="isOpen">
          <MuodostumisNode
            ref="childNode"
            :tutkinnonOsatMap="tutkinnonOsatMap"
            :depth="depth + 1"
            v-model="node.osat"
            :is-editing="isEditing"
            :parentMandatory="pakollinen(node)">
          </MuodostumisNode>
        </div>
      </div>
  </draggable>
</template>

<script lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import { Prop, Component, Vue } from 'vue-property-decorator';
import { RakenneModuuliDto } from '@shared/api/eperusteet';
import draggable from 'vuedraggable';
import _ from 'lodash';
import { v4 as genUuid } from 'uuid';
import { RooliToTheme, ColorMap, RakenneMainType, RakenneModuuliType } from '@/components/muodostuminen/utils';
import MuodostumisItem from './MuodostumisItem.vue';

function disassoc<T>(array: T[], idx: number): T[] {
  if (!_.isNumber(idx)) {
    throw new Error('not numbers');
  }
  if (idx < 0 || idx > _.size(array)) {
    throw new Error('off indexed');
  }
  return [...array.slice(0, idx), ...array.slice(idx + 1)];
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

  @Prop({ default: false, type: Boolean })
  private parentMandatory!: boolean;

  private isOpen = true;

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

  toggleOpen(toggleStatus?) {
    if (toggleStatus) {
      this.isOpen = toggleStatus;
    }
    else {
      this.isOpen = !this.isOpen;
    }
  }

  nodeColor(node: any) {
    if (node.rooli) {
      const mapped = RooliToTheme[node.rooli];
      if (mapped) {
        return ColorMap[mapped];
      }
      if (node.rooli === 'määritelty') {
        if (this.$kaanna(node.nimi) === this.$t('rakenne-moduuli-pakollinen')) {
          return ColorMap.pakollinen;
        }
        else if (this.$kaanna(node.nimi) === this.$t('rakenne-moduuli-ammatilliset')) {
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
      },
      disabled: !this.isEditing,
      ghostClass: 'rakenne-placeholder',
    };
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

  toggleRakenne(toggle?) {
    this.toggleOpen(toggle);
    _.forEach(this.$refs['childNode'], item => (item as any).toggleRakenne(toggle));
  }

  pakollinen(node) {
    return (node.rooli === 'määritelty' && this.$kaanna(node.nimi) === this.$t('rakenne-moduuli-pakollinen')) || node.pakollinen;
  }

  async add(element) {
    if (this.model[element.newIndex] && this.model[element.newIndex].rooli === 'määrittelemätön') {
      const uuid = _.get(this.model[element.newIndex], 'uuid');
      const muodostumisItem = _.find(this.$refs['muodostumisItem'], item => _.get(item, 'innerModel.uuid') === uuid);

      if (muodostumisItem) {
        (muodostumisItem as any).edit();
      }
    }
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
.muodostumisryhma {
}
// .rakenne-moduuli:before {
//   background: red;
//   border-bottom: 1px solid red;
//   content: ' ';
//   display: block;
//   width: 26px;
//   position: absolute;
//   margin-left: -56px;
//   margin-top: -$ryhma-height / 2;
// }
// .rakenne-moduuli-root:after {
//   border-left: 1px solid $linecolor;
//   height: 100%;
//   // margin-left: -26px;
//   // margin-top: 30px;
//   content: ' ';
//   // height: 100px;
//   position: absolute;
// }
// .muodostumisryhma:before {
//   border-top: 1px solid $linecolor;
//   margin-left: -56px;
//   margin-top: -$ryhma-height / 2;
//   content: ' ';
//   width: 26px;
//   position: absolute;
// }
.ryhma {
  // height: $ryhma-height;
  .nimi {
    font-weight: 600;
    font-size: 80%;
  }
}
.rakenne-moduuli-root {
  // padding: 18px 0 12px 0;
}
.muodostumisnode {
  // padding: 8px 0 8px 0;
}
.rakenne-moduuli {
  // padding: 8px 0 0 0;
}
// .children:before {
//   background: gray;
//   content: '';
//   display: block;
//   position: absolute;
//   height: 100%;
//   margin-top: $ryhma-height;
//   width: 1px;
// }
.colorblock {
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  width: 8px;
  display: block;
}

</style>
