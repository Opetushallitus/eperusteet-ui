<template>
  <div>

    <template v-if="isEditing">
      <div v-for="(asiasana, index) in model" :key="'asiasana' + index" class="d-flex align-items-center mb-2">
        <b-form-input v-model="model[index]" :list="'asiasanat'+index" class="w-40"/>
        <b-form-datalist :id="'asiasanat'+index" :options="asiasanat"/>

        <div class="default-icon clickable ml-2" @click="poistaAsiasana(asiasana)">
          <EpMaterialIcon>delete</EpMaterialIcon>
        </div>

      </div>
      <ep-button @click="lisaaAsiasana()" variant="outline" icon="add">
        {{ $t('lisaa-asiasana') }}
      </ep-button>
    </template>

    <ul v-else>
      <li v-for="(asiasana, index) in model" :key="'asiasana' + index">{{asiasana}}</li>
    </ul>

  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpMaterialIcon from '@shared/components//EpMaterialIcon/EpMaterialIcon.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpMaterialIcon,
    EpMultiSelect,
    EpButton,
    EpInput,
  },
})
export default class EpMaaraysAsiasanat extends Vue {
  @Prop({ required: true })
  value!: any[];

  @Prop({ required: true })
  asiasanat!: any[];

  @Prop({ required: false })
  isEditing!: boolean;

  set model(val) {
    this.$emit('input', val);
  }

  get model() {
    return this.value;
  }

  poistaAsiasana(asiasana) {
    this.model = _.without(this.model, asiasana);
  }

  lisaaAsiasana() {
    this.model = [
      ...this.model,
      '',
    ];
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

::v-deep datalist {
  position: absolute;
  max-height: 20em;
  border: 0 none;
  overflow-x: hidden;
  overflow-y: auto;
}

::v-deep datalist option {
  display: block;
  font-size: 0.8em;
  padding: 0.3em 1em;
  background-color: #ccc;
  cursor: pointer;
}

::v-deep datalist option:hover, ::v-deep datalist option:focus {
  color: #fff;
  background-color: #036;
  outline: 0 none;
}

</style>
