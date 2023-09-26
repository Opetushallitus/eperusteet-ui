<template>
  <div>
    <table class="table" v-if="liitteet && liitteet.length > 0">
      <thead>
        <tr>
          <th>{{ $t('nimi') }}</th>
          <th>{{ $t('tiedosto') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(muutos, idx) in value" :key="'muutos' + idx">
          <td>
            <ep-input v-model="muutos.nimi"
                      :is-editing="isEditing"></ep-input>
          </td>
          <td>
            <ep-multi-select class="w-100"
                             v-if="isEditing"
                             :value="muutos.liitteet ? muutos.liitteet[$slang.value] : null"
                             @input="updateLiite(idx, $event)"
                             :options="liitteet">
              <template v-slot:singleLabel="{ option }">{{ option.nimi }}</template>
              <template v-slot:option="{ option }">{{ option.nimi }}</template>
              <template v-slot:tag="{ option }">{{ option.nimi }}</template>
            </ep-multi-select>
            <div v-else>
              {{ (muutos.liitteet && muutos.liitteet[$slang.value].nimi) ? muutos.liitteet[$slang.value].nimi : null }}
            </div>
          </td>
          <td v-if="isEditing">
            <div class="text-center">
              <ep-button variant="link" icon="delete" @click="poista(idx)"></ep-button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <ep-button @click="lisaa()" v-if="isEditing">{{ $t('lisaa-muutosmaarays') }}</ep-button>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { LiiteDto } from '@shared/api/eperusteet';

@Component({
  components: {
    EpButton,
    EpInput,
    EpMultiSelect,
  },
})
export default class EpMuutosmaaraykset extends Vue {
  @Prop({ required: true })
  private value!: any[];

  @Prop({ required: true })
  private liitteet!: LiiteDto[];

  @Prop({ default: false })
  private isEditing!: boolean;

  lisaa() {
    this.$emit('input', [
      ...this.value, {
        nimi: {},
        liitteet: {
          fi: '',
        },
      }]);
  }

  poista(idx) {
    const temp = [...this.value];
    Vue.delete(temp, idx);
    this.$emit('input', temp);
  }

  updateLiite(idx, liite) {
    const temp = this.value;
    Vue.set(temp[idx].liitteet, this.$slang.value, { ...liite });
    this.$emit('input', temp);
  }
}
</script>

<style lang="scss" scoped>
</style>
