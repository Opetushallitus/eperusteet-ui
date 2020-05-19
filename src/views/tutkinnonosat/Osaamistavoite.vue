<template>
  <div>
    <div v-if="value">
      <b-form-group :label="$t('laajuus')">
        <ep-laajuus-input v-model="value.laajuus"
                          :is-editing="isEditing" />
      </b-form-group>

      <b-form-group :label="$t('tunnustaminen')">
        <ep-content v-model="value.tunnustaminen"
                    :validation="validation && validation.tunnustaminen"
                    layout="normal"
                    :is-editable="isEditing"></ep-content>
      </b-form-group>
    </div>
  </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { Koodisto } from '@shared/api/eperusteet';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAmmattitaitovaatimukset from '@shared/components/EpAmmattitaitovaatimukset/EpAmmattitaitovaatimukset.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { LokalisoituTekstiDto } from '@shared/tyypit';
import { PerusteStore } from '@/stores/PerusteStore';
import { OsaalueStore } from '@/stores/OsaalueStore';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { PerusteprojektiRoute } from '../PerusteprojektiRoute';
import EpGeneerinenAsteikko from '@/components/EpGeneerinenAsteikko/EpGeneerinenAsteikko.vue';

import _ from 'lodash';

@Component({
  components: {
    EpGeneerinenAsteikko,
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpInput,
    EpKoodistoSelect,
    EpLaajuusInput,
    EpSpinner,
  },
})
export default class RouteTutkinnonOsanOsaalue extends Vue {
  @Prop({ required: true })
  value!: any;

  @Prop({ default: false })
  isEditing!: boolean;

  @Prop({ required: true })
  arviointiStore!: ArviointiStore;

  @Prop({ required: true })
  validation!: any;
}
</script>

<style lang="scss" scoped>
</style>
