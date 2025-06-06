<template>
  <div>
    <draggable v-bind="defaultDragOptions"
               tag="div"
               v-model="model">
      <div v-for="(arvioinninKohdeAlue, index) in model" :key="'arvioinninKohdeAlue' + index" class="arviointi">
        <div v-if="isEditing" class="order-handle">
          <EpMaterialIcon>drag_indicator</EpMaterialIcon>
        </div>
        <EpArviointi class="w-100"
                     v-model="model[index]"
                     :isEditing="isEditing"
                     :arviointiasteikot="arviointiasteikot">

          <template #poisto>
            <div>
              <EpButton v-if="isEditing" variant="link" icon="delete" @click="poistaArvioinninKohdealue(arvioinninKohdeAlue)">{{$t('poista-ammattitaitovaatimus-tekemisena')}}</EpButton>
            </div>
          </template>
        </EpArviointi>
      </div>
    </draggable>

    <EpButton v-if="isEditing"
              class="mt-3"
              variant="outline"
              icon="add"
              @click="lisaaArvioinninKohdeAlue">
        {{$t(lisaaBtnTeksti)}}
      </EpButton>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import draggable from 'vuedraggable';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpArviointi from '@/views/tutkinnonosat/EpArviointi.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpMaterialIcon,
    draggable,
    EpArviointi,
    EpButton,
  },
})
export default class EpArvioinninKohdeAlueet extends Vue {
  @Prop({ required: true })
  private value!: any[];

  @Prop({ required: true })
  private isEditing!: boolean;

  @Prop({ required: true })
  private arviointiasteikot!: any;

  get model() {
    return this.value;
  }

  set model(val) {
    this.$emit('input', val);
  }

  lisaaArvioinninKohdeAlue() {
    this.model = [
      ...this.model,
      {
        arvioinninKohteet: [],
      },
    ];
  }

  poistaArvioinninKohdealue(arvioinninKohdeAlue) {
    this.model = _.filter(this.model, arv => arv !== arvioinninKohdeAlue);
  }

  get lisaaBtnTeksti() {
    if (_.size(this.model) > 0) {
      return 'lisaa-ammattitaitovaatimus-tekemisena';
    }

    return 'lisaa-tutkinnon-osa-kohtainen-arviointi';
  }

  get defaultDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
    };
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

.arviointi {
  @include tile-background-shadow;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  display: flex;
}

</style>
