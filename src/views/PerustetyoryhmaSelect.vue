<template>
  <div>
    <div v-if="tyoryhmat && tyoryhmat.length > 0">
      <EpMultiSelect v-model="inner"
                     v-if="isEditing"
                     :placeholder="$t('valitse-tyoryhma')"
                     :search-identity="tyoryhmaSearchIdentity"
                     :options="tyoryhmat"
                     :clear-on-select="true">
        <template #singleLabel="{ option }">
          {{ $kaanna(option.nimi) }}
        </template>
        <template #option="{ option }">
          {{ $kaanna(option.nimi) }}
        </template>
      </EpMultiSelect>
      <div v-else-if="inner">
        {{ $kaanna(inner.nimi) }}
      </div>
    </div>
    <EpSpinner v-else :small="true"/>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import * as _ from 'lodash';

@Component({
  components: {
    EpColorIndicator,
    EpInput,
    EpMultiSelect,
    EpSelect,
    EpSpinner,
  },
})
export default class PerustetyoryhmaSelect extends Vue {
  @Prop({ required: true })
  value!: string;

  @Prop({ required: true })
  ulkopuolisetStore!: UlkopuolisetStore;

  @Prop({ default: false })
  isEditing!: boolean;

  get inner() {
    return _.find(this.tyoryhmat, { oid: this.value });
  }

  set inner(value: any) {
    this.$emit('input', value ? value.oid : null);
  }

  async mounted() {
    this.ulkopuolisetStore.fetchTyoryhmat();
  }

  tyoryhmaSearchIdentity(tr: any) {
    return _.toLower(this.$kaanna(tr.nimi));
  }

  get tyoryhmat() {
    return _.sortBy(this.ulkopuolisetStore.tyoryhmat.value, this.tyoryhmaSearchIdentity);
  }
}
</script>

<style lang="scss" scoped>

.tieto {
  padding: 20px;

  .nimi {
    font-weight: 600;
  }
}

</style>
