<template>
  <b-row>
    <b-col cols="4">{{$kaanna(arviointiasteikko.osaamistasot[osaamistasonkriteeri._osaamistaso].otsikko)}}</b-col>
    <b-col class="d-flex flex-column">
      <template v-if="!isEditing">
        <ul>
          <li v-for="(kriteeri, kriteeriIndex) in osaamistasonkriteeri.kriteerit" :key="'kriteeri'+kriteeriIndex">
            {{$kaanna(osaamistasonkriteeri.kriteerit[kriteeriIndex])}}
          </li>
        </ul>
      </template>

      <template v-else>
        <draggable v-bind="defaultDragOptions"
                   tag="div"
                   v-model="osaamistasonkriteeri.kriteerit">
          <div v-for="(kriteeri, kriteeriIndex) in osaamistasonkriteeri.kriteerit" :key="'kriteeri'+kriteeriIndex" class="mb-2">
            <div class="d-flex">
              <EpInput class="w-100" :isEditing="isEditing" v-model="osaamistasonkriteeri.kriteerit[kriteeriIndex]">
                <div class="order-handle m-2" slot="left">
                  <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                </div>
              </EpInput>
              <EpButton v-if="isEditing" variant="link" icon="delete" @click="poistaKriteeri(kriteeri)"/>
            </div>
          </div>
        </draggable>
        <EpButton :paddingx="false" v-if="isEditing" class="mb-3" variant="link" icon="add" @click="lisaaKriteeri()">
          {{ $t('lisaa-kriteeri') }}
        </EpButton>
      </template>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import * as _ from 'lodash';
import draggable from 'vuedraggable';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';

@Component({
  components: {
    EpMaterialIcon,
    draggable,
    EpInput,
    EpButton,
  },
})
export default class OsaamistasonKriteeri extends Vue {
  @Prop({ required: true })
  private value!: any;

  @Prop({ required: true })
  private isEditing!: boolean;

  @Prop({ required: true })
  private arviointiasteikko!: any;

  get osaamistasonkriteeri() {
    return this.value;
  }

  set osaamistasonkriteeri(val) {
    this.$emit('input', val);
  }

  async lisaaKriteeri() {
    this.osaamistasonkriteeri.kriteerit = [
      ...this.osaamistasonkriteeri.kriteerit,
      {},
    ];
  }

  async poistaKriteeri(poistettavaKriteeri) {
    this.osaamistasonkriteeri.kriteerit = _.filter(this.osaamistasonkriteeri.kriteerit, kriteeri => kriteeri !== poistettavaKriteeri);
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

</style>
