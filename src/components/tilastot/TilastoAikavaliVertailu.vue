<template>
  <div class="row">
    <div class="col-xl-3 col-md-3 col-sm-12">
      <ep-form-content name="aikavertailu">
        <ep-multi-select :multiple="false"
          id="tilaFilter"
          :is-editing="true"
          :options="aikavaliItems"
          v-model="model.tyyppi"
          :placeholder="$t('valitse')"
          track-by="value"
          label="text">
        </ep-multi-select>
      </ep-form-content>
    </div>

    <div class="col-xl-9 col-md-9 col-sm-12">
      <ep-form-content name="aikavali">
        <div class="d-flex" :class="{'disabled-events' : !model.tyyppi}">
          <ep-datepicker v-model="model.aikavaliAlku" :is-editing="true" />
          <span class="mx-2"></span>
          <ep-datepicker v-model="model.aikavaliLoppu" :is-editing="true" endOfDay/>
        </div>
      </ep-form-content>
    </div>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';

export interface AikavaliVertailu {
  tyyppi?: {
    text: string;
    value: string;
  };
  aikavaliAlku?: string;
  aikavaliLoppu?: string;
}

@Component
export default class TilastoAikavaliVertailu extends Vue {
  @Prop({ required: true })
  value!: AikavaliVertailu;

  get model() {
    return this.value;
  }

  set model(val) {
    this.$emit('input', val);
  }

  get aikavaliItems() {
    return [
      {
        text: this.$t('ensijulkaisu'),
        value: 'ensijulkaisu',
      },
      {
        text: this.$t('luotu'),
        value: 'luotu',
      },
    ];
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
