<template>
  <div v-if="isEditable">
    <div v-for="(bullet, idx) in state" :key="idx" class="d-flex mb-1">
      <div class="flex-grow-1">
        <ep-input :value="bullet" @input="onInput($event, idx)" :is-editing="true" />
      </div>
      <div class="flex-shrink-1">
        <b-button variant="link" @click="remove(idx)">
          <fas icon="roskalaatikko" />
        </b-button>
      </div>
    </div>
    <div class="mt-2">
      <ep-button variant="outline-primary" icon="plus" @click="add">
        <slot name="add">
          {{ $t('lisaa') }}
        </slot>
      </ep-button>
    </div>
  </div>
  <div v-else>
    <ul>
      <li v-for="(bullet, idx) in value" :key="idx">
        {{ $kaanna(bullet) }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Watch, Vue, Component, Prop } from 'vue-property-decorator';

import draggable from 'vuedraggable';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';

@Component({
  components: {
    draggable,
    EpButton,
    EpInput
  }
})
export default class EpPrefixList extends Vue {
  @Prop({ required: true })
  private value!: { [lang: string]: string }[];

  @Prop({ default: false })
  private isEditable!: boolean;

  private state!: { [lang: string]: string }[];

  @Watch('value', { immediate: true })
  onValueChange(value: any) {
    this.state = value;
  }

  add() {
    this.state.push({});
  }

  remove(idx: number) {
    Vue.delete(this.state, idx);
  }

  onInput(value: any, idx: number) {
    Vue.set(this.state, idx, value);
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

ul {
  padding: 10px;
}
</style>
