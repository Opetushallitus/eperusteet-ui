<template>
  <div>
    <table class="table" v-if="liitteet && liitteet.length > 0">
      <thead>
        <tr>
          <th class="w-50">{{ $t('nimi') }}</th>
          <th class="w-20">{{ $t('kieli') }}</th>
          <th class="w-30">{{ $t('tiedosto') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(muutos, idx) in value" :key="'muutos' + idx">
          <td>
            <ep-input v-model="muutos.nimi" :is-editing="true"></ep-input>
          </td>
          <td>
            <ep-multi-select :value="muutos.kieli"
                             @input="updateKieli(idx, $event)"
                             :options="julkaisukielet"
                             :searchable="false"
                             :clear-on-select="false"
                             :allowEmpty="false">
              <template v-slot:singleLabel="{ option }">{{ $t(option) }}</template>
              <template v-slot:option="{ option }">{{ $t(option) }}</template>
              <template v-slot:tag="{ option }">{{ $t(option) }}</template>
            </ep-multi-select>
          </td>
          <td>
            <ep-multi-select :value="muutos.liitteet ? muutos.liitteet[muutos.kieli] : null"
                             @input="updateLiite(idx, $event)"
                             :options="liitteet"
                             :searchable="false"
                             :clear-on-select="false"
                             :allowEmpty="false">
              <template v-slot:singleLabel="{ option }">{{ option.nimi }}</template>
              <template v-slot:option="{ option }">{{ option.nimi }}</template>
              <template v-slot:tag="{ option }">{{ option.nimi }}</template>
            </ep-multi-select>
          </td>
          <td>
            <div class="text-center">
              <ep-button variant="link" icon="roskalaatikko" @click="poista(idx)">
              </ep-button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <ep-button @click="lisaa()">{{ $t('lisaa-muutosmaarays') }}</ep-button>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { LiiteDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';

@Component({
  components: {
    EpButton,
    EpInput,
    EpMultiSelect,
  },
})
export default class EpJulkaisuMuutosmaaraykset extends Vue {
  @Prop({ required: true })
  private value!: any[];

  @Prop({ required: true })
  private liitteet!: LiiteDto[];

  @Prop({ required: true })
  private julkaisukielet!: any[];

  @Prop({ default: false })
  private isEditing!: boolean;

  lisaa() {
    this.$emit('input', [
      ...this.value, {
        nimi: {},
        liitteet: {
          fi: '',
        },
        kieli: '',
      }]);
  }

  updateKieli(idx, kieli) {
    const temp = this.value;
    Vue.set(temp[idx], 'kieli', kieli);
    Vue.set(temp[idx], 'liitteet', this.asetaKieli(kieli));
    this.$emit('input', temp);
  }

  updateLiite(idx, liite) {
    const temp = this.value;
    Vue.set(temp[idx].liitteet, temp[idx].kieli, { ...liite });
    this.$emit('input', temp);
  }

  poista(idx) {
    const temp = [...this.value];
    Vue.delete(temp, idx);
    this.$emit('input', temp);
  }

  asetaKieli(kieli) {
    if (kieli === 'fi') {
      return { fi: '' };
    }
    else if (kieli === 'sv') {
      return { sv: '' };
    }
    else if (kieli === 'en') {
      return { en: '' };
    }
  }
}
</script>

<style lang="scss" scoped>

.w-30 {
  width: 30% !important;
}

.w-20 {
  width: 20% !important;
}
</style>
