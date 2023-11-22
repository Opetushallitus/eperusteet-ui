<template>
  <div>

    <template v-if="isEditing">
      <EpMultiSelect v-model="model"
                 :placeholder="$t('maarays-asiasanat-placeholder')"
                 :tagPlaceholder="$t('maarays-asiasanat-lisays-placeholder')"
                 :search-identity="identity"
                 :options="valittavatAsiasanat"
                 :maxHeight="500"
                 :multiple="true"
                 :closeOnSelect="false"
                 :taggable="true"
                 @tag="lisaaAsiasana">

        <template slot="option" slot-scope="{ option }">
          <span v-if="option.label">{{ option.label }}</span>
          <span v-else>{{ option }}</span>
        </template>

        <template v-slot:checkbox="{ option }"><span/></template>

        <template slot="selection" slot-scope="{ values }">
          <div class="d-flex align-items-center" :class="{'mb-2': values.length > 0}">
            <span class="multiselect__tag" v-for="value in values" :key="'value' + value">
              <span class="nimi">{{ value }}</span>
              <span class="multiselect__tag-icon clickable" @click.prevent @mousedown.prevent.stop="poista(value)"/>
            </span>

            <span v-if="values.length > 0" class="ml-auto clickable border-right pr-2 remove-all" @click.prevent @mousedown.prevent.stop="poistaKaikki()">
              <ep-material-icon>close</ep-material-icon>
            </span>
          </div>
        </template>
      </EpMultiSelect>
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

  get valittavatAsiasanat() {
    return _.uniq([
      ...this.asiasanat,
      ...this.model,
    ]);
  }

  identity(asiasana) {
    return asiasana;
  }

  lisaaAsiasana(uusiAsiasana) {
    this.model = [
      ...this.model,
      uusiAsiasana,
    ];
  }

  poista(asiasana) {
    this.model = _.without(this.model, asiasana);
  }

  poistaKaikki() {
    this.model = [];
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

::v-deep .multiselect__tags {
  .multiselect__tag {
    .nimi {
      margin-left: 5px;
      margin-right: 5px;
    }
  }
}

</style>
