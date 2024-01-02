<template>
  <div>
    <EpToggle v-model="liittyyMuutosmaarays" :isSWitch="false">
      {{$t('julkaisuun-liittyy-muutosmaarays')}}
    </EpToggle>

    <b-form-group class="mt-4" :label="$t('muutosmaarays')" v-if="liittyyMuutosmaarays">
      <div class="ei-muutosmaarayksia p-3" v-if="muutosmaaraykset && muutosmaaraykset.length === 0">
        <EpMaterialIcon>info</EpMaterialIcon>
        {{$t('muutosmaarayksia-ei-loytynyt')}} {{$t('voit-lisata-muutosmaarayksia')}}
        <router-link :to="{name: 'perusteenTiedot'}">{{$t('perusteen-tiedoista')}}</router-link>
      </div>

      <ep-multi-select
        v-if="muutosmaaraykset && muutosmaaraykset.length > 0"
        class="w-50" v-model="julkaisu.muutosmaarays" :options="muutosmaaraykset" track-by="id">
        <template v-slot:singleLabel="{ option }">{{ $kaanna(option.nimi) }} ({{ $sd(option.voimassaoloAlkaa) }} - )</template>
        <template v-slot:option="{ option }">{{ $kaanna(option.nimi) }} ({{ $sd(option.voimassaoloAlkaa) }} - )</template>
        <template v-slot:tag="{ option }">{{ $kaanna(option.nimi) }} ({{ $sd(option.voimassaoloAlkaa) }} - )</template>
      </ep-multi-select>
    </b-form-group>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { MaaraysDto } from '@shared/api/eperusteet';

@Component({
  components: {
    EpMultiSelect,
  },
})
export default class EpJulkaisuMuutosmaarays extends Vue {
  @Prop({ required: true })
  private value!: any;

  @Prop({ required: true })
  private muutosmaaraykset!: MaaraysDto[];

  set julkaisu(val) {
    this.$emit('input', val);
  }

  get julkaisu() {
    return this.value;
  }

  set liittyyMuutosmaarays(val) {
    this.julkaisu.liittyyMuutosmaarays = val;

    if (!val) {
      this.julkaisu.muutosmaarays = null;
    }
  }

  get liittyyMuutosmaarays() {
    return this.julkaisu.liittyyMuutosmaarays;
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.ei-muutosmaarayksia {
  background-color: $blue-lighten-4;
}

</style>
