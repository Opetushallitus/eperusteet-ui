<template>
  <div v-if="inner">
    <b-form-group :label="$t('laajuus')">
      <ep-laajuus-input v-model="inner.laajuus" :is-editing="isEditing" />
    </b-form-group>
    <b-form-group>
      <h4>{{ $t('osaamistavoitteet') }}</h4>
      <EpAmmattitaitovaatimukset v-model="tavoitteet"
                                 :kohdealueettomat="false"
                                 :kaannos-tavoiteet="$t('tavoitteet')"
                                 :kaannos-lisaa-kohdealue="$t('lisaa-tavoiteryhma')"
                                 :kaannos-lisaa-ammattitaitovaatimus="$t('lisaa-tavoite')"
                                 kaannos-kohdealueet=""
                                 :kaannos-kohdealue="$t('tavoitteiden-otsikko')"
                                 :kaannos-vaatimukset="$t('tavoitteet')"
                                 :kohde="{ fi: $t('opiskelija') }"
                                 :tavoitekoodisto="'osaamistavoitteet'"
                                 :show-kohde="true"
                                 :is-editing="isEditing" />
    </b-form-group>
  </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator'; import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import EpAmmattitaitovaatimukset from '@shared/components/EpAmmattitaitovaatimukset/EpAmmattitaitovaatimukset.vue';

import _ from 'lodash';

@Component({
  components: {
    EpAmmattitaitovaatimukset,
    EpLaajuusInput,
  },
})
export default class Osaamistavoite extends Vue {
  @Prop({ required: true })
  value!: any;

  @Prop({ required: true })
  isValinnainen!: boolean;

  get inner() {
    return this.value || {
      laajuus: 0,
      tavoitteet: {
      },
    };
  }

  set inner(v) {
    this.$emit('input', v);
  }

  get tavoitteet() {
    return this.inner.tavoitteet || null;
  }

  set tavoitteet(tavoitteet) {
    this.$emit('input', {
      ...this.inner,
      tavoitteet,
    });
  }

  @Prop({ default: false })
  isEditing!: boolean;

  @Prop({ required: false })
  validation!: any;
}
</script>

<style lang="scss" scoped>
</style>
