<template>
  <div>
    <EpSisaltoTekstikappaleet v-model="model" :isEditing="isEditing" :sisaltoAvaimet="['tehtava', 'ohjaus', 'tyotavat', 'arviointi']" />

    <b-form-group class="mt-4 pt-3" v-if="model.sisaltoalueinfo">
      <template v-slot:label>
        <h4 class="mb-0">
          <span v-if="model.sisaltoalueinfo.otsikko">{{$kaanna(model.sisaltoalueinfo.otsikko)}}</span>
          <span v-else>{{$t('sisaltoalueet-vuosiluokilla-' + vuosiluokat)}}</span>
        </h4>
      </template>
      <EpSisaltoalueetEditModal v-model="model" :vuosiluokat="vuosiluokat" :isEditing="isEditing" :perusteId="perusteId" :oppiaineId="oppiaineId"/>
    </b-form-group>

    <hr class="mt-4"/>

    <b-form-group :label="$t('opetuksen-tavoitteet-vuosiluokilla-' + vuosiluokat)" class="mt-4 pt-3">
      <draggable
        v-bind="tavoitteetDragOptions"
        tag="div"
        v-model="model.tavoitteet">

          <EpCollapse
            v-for="(tavoite, tavoiteIndex) in model.tavoitteet"
            :key="'tavoite'+tavoiteIndex"
            class="tavoite p-3 mb-4 w-100"
            :borderBottom="false"
            :usePadding="false">

            <div slot="header" class="d-flex">
              <div class="order-handle mr-3" v-if="isEditing">
                <EpMaterialIcon v-if="isEditing">drag_indicator</EpMaterialIcon>
              </div>
              <h4 class="mb-0" v-html="$kaanna(tavoite.tavoite)"></h4>
            </div>

            <EpOppiaineenTavoite v-model="model.tavoitteet[tavoiteIndex]" :isEditing="isEditing" :supportData="vlkSupportData" @poista="poistaTavoite(tavoite)"/>

          </EpCollapse>
      </draggable>

      <ep-button @click="lisaaTavoite" variant="outline" icon="add" v-if="isEditing">
        {{ $t('lisaa-tavoite') }}
      </ep-button>
    </b-form-group>

  </div>
</template>

<script lang="ts">
import { OppiaineenVuosiluokkaKokonaisuusDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpSisaltoTekstikappaleet from '@/components/EpSisaltoTekstikappaleet.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpOppiaineenTavoite from '@/views/aipe/yleiset/EpOppiaineenTavoite.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import draggable from 'vuedraggable';
import EpSisaltoalueetEditModal from '@/views/perusopetus/EpSisaltoalueetEditModal.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpSisaltoTekstikappaleet,
    EpCollapse,
    EpOppiaineenTavoite,
    EpInput,
    EpContent,
    draggable,
    EpButton,
    EpSisaltoalueetEditModal,
    EpMaterialIcon,
  },
})
export default class EpOppiaineenVuosiluokkakokonaisuus extends Vue {
  @Prop({ required: true })
  value!: OppiaineenVuosiluokkaKokonaisuusDto;

  @Prop({ required: false, default: false })
  isEditing!: boolean;

  @Prop()
  vuosiluokat!: string;

  @Prop({ required: true })
  supportData!: any;

  @Prop({ required: true })
  oppiaineId: any;

  @Prop({ required: true })
  perusteId: any;

  get model() {
    return this.value;
  }

  set model(val) {
    this.$emit('input', val);
  }

  get tavoitteetDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      disabled: !this.isEditing,
      group: {
        name: 'tavoitteet',
      },
    };
  }

  lisaaTavoite() {
    this.model.tavoitteet = [
      ...this.model.tavoitteet!,
      {
        laajattavoitteet: [],
        arvioinninkohteet: [],
        sisaltoalueet: [],
        oppiaineenTavoitteenOpetuksenTavoitteet: [],
      },
    ];
  }

  get vlkSupportData() {
    return {
      ...this.supportData,
      sisaltoalueet: this.model.sisaltoalueet,
    };
  }

  poistaTavoite(poistettavaTavoite) {
    this.model.tavoitteet = _.reject(this.model.tavoitteet, poistettavaTavoite);
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

.tavoite {
  @include tile-background-shadow;
  border-radius: 10px;
}

</style>
