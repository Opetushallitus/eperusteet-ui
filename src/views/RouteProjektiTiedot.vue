<template>
  <div v-if="!isInitializing && store">
    <EpEditointi :store="store">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $t('projektin-tiedot') }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">
        <h3>{{ $t('perustiedot') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col>
              <b-form-group :label="$t('projektin-nimi')">
                <ep-input v-model="data.nimi"
                          type="string"
                          :is-editing="isEditing"
                          :validation="validation.nimi"></ep-input>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('perustetyoryhma')">
                <perustetyoryhma-select v-model="data.ryhmaOid"
                                        :ulkopuoliset-store="ulkopuolisetStore"
                                        :is-editing="isEditing" />
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('yhteyshenkilo')">
                <ep-input v-model="data.yhteistyotaho"
                          type="string"
                          :is-editing="isEditing"
                          :validation="validation.yhteistyotaho"></ep-input>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col>
              <b-form-group :label="$t('kuvaus')">
                <ep-content v-model="data.teksti" layout="normal" :is-editable="isEditing"></ep-content>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>
        <h3>{{ $t('esikatselu-ja-lataus') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('salli-perusteen-esikatselu')">
                <ep-toggle v-model="data.esikatseltavissa"
                           :is-editing="isEditing"></ep-toggle>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('perusteen-lataus')">
                <ep-button variant="primary" icon="file">{{ $t('lataa-peruste-json') }}</ep-button>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>
      </template>
    </EpEditointi>
  </div>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { LokalisoituTekstiDto } from '@shared/tyypit';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { PerusteprojektiEditStore } from '@/stores/PerusteprojektiEditStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import PerustetyoryhmaSelect from './PerustetyoryhmaSelect.vue';
import _ from 'lodash';


@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpInput,
    EpSpinner,
    EpToggle,
    PerustetyoryhmaSelect,
  },
})
export default class RouteProjektiTiedot extends PerusteprojektiRoute {
  @Prop({ required: true })
  ulkopuolisetStore!: UlkopuolisetStore;

  private store: EditointiStore | null = null;

  async onProjektiChange(projektiId: number) {
    this.store = new EditointiStore(new PerusteprojektiEditStore(projektiId));
  }

}
</script>

<style lang="scss" scoped>
</style>
