<template>
  <div>
    <div v-for="(maarays, index) in model" :key="tyyppi+index">

      <div class="d-flex w-100 mb-2 align-items-center">
        <EpMultiSelect
          class="w-100"
          :value="maarays"
          @input="asetaMaarays(index, $event)"
          :placeholder="$t('valitse-maarays')"
          :is-editing="true"
          :search-identity="nimiSearchIdentity"
          :options="maarayksetNimella">
          <template #singleLabel="{ option }">
            {{ $kaanna(option.nimi) }} <span v-if="option.diaarinumero">({{option.diaarinumero}})</span>
          </template>
          <template #option="{ option }">
            {{ $kaanna(option.nimi) }} <span v-if="option.diaarinumero">({{option.diaarinumero}})</span>
          </template>
        </EpMultiSelect>

        <div class="default-icon clickable ml-2" @click="poistaMaarays(maarays)">
          <EpMaterialIcon>delete</EpMaterialIcon>
        </div>
      </div>
    </div>

    <ep-button @click="lisaaMaarays()" variant="outline" icon="add">
      {{ $t('lisaa-maarays') }}
    </ep-button>

  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpMaterialIcon from '@shared/components//EpMaterialIcon/EpMaterialIcon.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { nimiSearchIdentity } from '@shared/utils/helpers';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { MaaraysKevytDto } from '@shared/api/eperusteet';

@Component({
  components: {
    EpMaterialIcon,
    EpMultiSelect,
    EpButton,
  },
})
export default class EpMaaraysLiittyyMaaraykseen extends Vue {
  private nimiSearchIdentity = nimiSearchIdentity;

  @Prop({ required: true })
  value!: MaaraysKevytDto[];

  @Prop({ required: true })
  maarayksetNimella!: MaaraysKevytDto[];

  @Prop()
  tyyppi!: string;

  set model(val) {
    this.$emit('input', val);
  }

  get model() {
    return this.value;
  }

  poistaMaarays(maarays) {
    this.model = _.without(this.model, maarays);
  }

  lisaaMaarays() {
    this.model = [
      ...this.model,
      {},
    ];
  }

  asetaMaarays(index, asetettavaMaarays) {
    this.model = _.map(this.model, (maarays, ind) => ind === index ? asetettavaMaarays : maarays);
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
