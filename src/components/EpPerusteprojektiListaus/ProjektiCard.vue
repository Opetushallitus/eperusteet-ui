<template>
  <router-link :to="link" tag="div" :class="classes">
    <div v-if="indicator" class="p-2 flex-shrink-1">
      <EpColorIndicator size="16" :kind="indicator" />
    </div>
    <div v-else></div>
    <div class="flex-grow-1 mainslot h-100">
      <slot />
    </div>
    <div class="flex-shrink-1 lower d-flex align-items-center justify-content-center text-center" v-if="$slots.lower">
      <slot name="lower"></slot>
    </div>
  </router-link>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator'
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue'
import { Page } from '@shared/tyypit'
import { BvTableFieldArray } from 'bootstrap-vue'
import { IProjektiProvider } from './types'


export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

@Component({
  components: {
    EpColorIndicator,
  }
})
export default class ProjektiCard extends Vue {

  @Prop({ default: false })
  fullBackground!: boolean;

  @Prop()
  indicator!: string;

  @Prop()
  link!: any;

  get classes() {
    if (this.fullBackground) {
      return 'project-card full-color h-100';
    }
    else {
      return 'project-card d-flex flex-column h-100';
    }
  }

}
</script>

<style lang="scss" scoped>

.full-color {
  background: linear-gradient(180deg, rgba(71,151,183,1) 0%, rgba(60,131,159,1) 100%);
  color: white;
}

.project-card {
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
}

.mainslot {
  font-weight: 500;
}

.lower {
  margin: 0 20px 0 20px;
  border-top: 1px solid #ebebeb;
  height: 62px;
  min-height: 62px;
  max-height: 62px;
}

</style>

