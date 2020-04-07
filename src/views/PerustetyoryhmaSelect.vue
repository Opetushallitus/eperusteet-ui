<template>
  <div v-if="tyoryhmat">
    <EpMultiSelect v-model="inner"
                   v-if="isEditing"
                   :placeholder="$t('valitse-tyoryhma')"
                   :search-identity="tyoryhmaSearchIdentity"
                   :options="tyoryhmat">
    <template slot="singleLabel" slot-scope="{ option }">
      {{ $kaanna(option.nimi) }}
    </template>
    <template slot="option" slot-scope="{ option }">
      {{ $kaanna(option.nimi) }}
    </template>
    </EpMultiSelect>
    <div v-else-if="inner">
      {{ $kaanna(inner.nimi) }}
    </div>
  </div>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSteps from '@shared/components/EpSteps/EpSteps.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { PerusteprojektiLuontiDto, PerusteQuery, PerusteprojektiKevytDto, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { EperusteetKoulutustyypit } from '@/utils/perusteet';
import { Page } from '@shared/tyypit';
import { BvTableFieldArray } from 'bootstrap-vue';
import * as _ from 'lodash';


@Component({
  components: {
    EpColorIndicator,
    EpIcon,
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
    this.$emit('input', value.oid);
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

