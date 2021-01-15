<template>
  <div>
    <ep-spinner v-if="!osaamistasot" />
    <div v-else>
      <div
        v-for="(osaamistaso, index) in osaamistasot"
        :key="osaamistaso.id"
        class="osaamistaso py-2"
        :class="{ 'pl-3': !isEditing, 'is-editing': isEditing }">
        <template v-if="!isEditing">
          {{ $kaanna(osaamistaso.otsikko) }}
        </template>
        <b-form-group
          :label="$t('osaamistaso') + ' ' + (index + 1)"
          v-else>
          <ep-input
            :name="$t('osaamistaso')"
            v-model="osaamistaso.otsikko"
            :is-editing="true"
            @input="onInput(osaamistaso)"/>
        </b-form-group>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import _ from 'lodash';

import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';

import { OsaamistasoDto } from '@shared/api/eperusteet';

@Component({
  components: {
    EpSpinner,
    EpButton,
    EpInput,
  },
})
export default class EpArviointiAsteikkoLista extends Vue {
  @Prop({ required: true })
  private osaamistasot!: OsaamistasoDto[];

  @Prop({ required: false, default: false })
  private isEditing!: boolean;

  onInput(osaamistaso: OsaamistasoDto) {
    this.$emit('osaamistasoInput', osaamistaso);
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.osaamistaso {
  &:nth-of-type(even):not(.is-editing) {
    background-color: $table-even-row-bg-color;
  }
  &:nth-of-type(odd):not(.is-editing) {
    background-color: $table-odd-row-bg-color;
  }
  &.clickable:hover {
    background-color: $table-hover-row-bg-color;
    cursor: pointer;
  }
}

::v-deep .btn {
  padding: 0px;
}

.form-group {
  margin: 0;
}
</style>
