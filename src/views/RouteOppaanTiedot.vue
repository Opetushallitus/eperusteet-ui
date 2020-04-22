<template>
  <div v-if="!isInitializing && store">
    <EpEditointi :store="store">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $t('oppaan-tiedot') }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">
        <h3>{{ $t('perustiedot') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('oppaan-nimi')+'*'">
                <ep-input v-model="data.nimi"
                          type="string"
                          :is-editing="isEditing"
                          :validation="validation.nimi"></ep-input>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('opastyoryhma')+'*'">
                <perustetyoryhma-select v-model="data.ryhmaOid"
                                        :ulkopuoliset-store="ulkopuolisetStore"
                                        :is-editing="isEditing" />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row no-gutters>
             <b-col lg="6">
              <b-form-group :label="$t('koulutustyyppi')" class="pr-5">
                <EpMultiListSelect v-model="data.peruste.oppaanKoulutustyypit"
                           :is-editing="isEditing"
                           :items="koulutustyypit"
                           :required="false">
                  <template slot="singleLabel" slot-scope="{ option }">
                    <span class="text-nowrap">
                      <EpColorIndicator :size="10" :kind="ktToRyhma(option.value)" />
                      <span class="ml-2">{{ option.text }}</span>
                    </span>
                  </template>
                  <template slot="option" slot-scope="{ option }">
                    <span class="text-nowrap">
                      <EpColorIndicator :size="10" :kind="ktToRyhma(option.value)" />
                      <span class="ml-2">{{ option.text }}</span>
                    </span>
                  </template>
                  <template slot="lisaaTeksti">
                    {{$t('lisaa-koulutus-tutkintotyyppi')}}
                  </template>
                </EpMultiListSelect>
                <span class="asettamatta" v-if="!isEditing && (!data.peruste.oppaanKoulutustyypit || data.peruste.oppaanKoulutustyypit.length === 0)">{{$t('ei-asetettu')}}</span>
              </b-form-group>
             </b-col>

             <b-col lg="6">
              <b-form-group :label="$t('peruste')" class="pr-5">
                <EpMultiListSelect v-model="data.peruste.oppaanPerusteet"
                           :is-editing="isEditing"
                           :items="perusteet"
                           :required="false">
                  <template slot="lisaaTeksti">
                    {{$t('lisaa-peruste')}}
                  </template>
                </EpMultiListSelect>
                <span class="asettamatta" v-if="!isEditing && (!data.peruste.oppaanPerusteet || data.peruste.oppaanPerusteet.length === 0)">{{$t('ei-asetettu')}}</span>
              </b-form-group>
             </b-col>
          </b-row>

          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('oppaan-kielet')">
                <b-form-checkbox-group v-if="isEditing" v-model="data.peruste.kielet" stacked>
                  <b-form-checkbox v-for="kieli in kielet" :key="kieli" :value="kieli">
                    {{ $t(kieli) }}
                  </b-form-checkbox>
                </b-form-checkbox-group>
                <div v-else class="text-nowrap">
                  <span v-for="(kieli, idx) in data.peruste.kielet" :key="kieli" :value="kieli">
                    {{ $t(kieli) }}<span class="mr-0" v-if="idx < data.peruste.kielet.length - 1">,</span>
                  </span>
                  <span class="asettamatta" v-if="!isEditing && (!data.peruste.kielet || data.peruste.kielet.length === 0)">{{$t('ei-asetettu')}}</span>
                </div>
              </b-form-group>
            </b-col>

            <b-col lg="6">
              <b-form-group :label="$t('voimassaolo')">
              <div class="asettamatta" v-if="!data.peruste.voimassaoloAlkaa && !data.peruste.voimassaoloLoppuu && !isEditing">
                {{$t('ei-asetettu')}}
              </div>
              <div v-else class="d-flex align-items-center">
                <ep-datepicker v-model="data.peruste.voimassaoloAlkaa" :is-editing="isEditing"/>
                <div class="ml-2 mr-2">-</div>
                <ep-datepicker v-model="data.peruste.voimassaoloLoppuu" :is-editing="isEditing"/>
              </div>
            </b-form-group>
            </b-col>
          </b-row>

        </b-container>

        <h3 class="mt-4">{{ $t('esikatselu-ja-lataus') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group v-if="!isEditing" :label="$t('salli-oppaan-esikatselu')">
                <span v-if="data.esikatseltavissa">{{$t('kylla')}}</span>
                <span v-else>{{$t('ei')}}</span>
              </b-form-group>
              <ep-toggle v-else v-model="data.esikatseltavissa"
                        :is-editing="isEditing" :isSWitch="false">{{$t('salli-oppaan-esikatselu')}}</ep-toggle>
            </b-col>
            <b-col lg="6" v-if="!isEditing">
              <b-form-group :label="$t('oppaan-lataus')">
                <ep-button variant="primary" @click="lataa">{{ $t('lataa-opas-json') }}</ep-button>
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
import { OpasEditStore } from '@/stores/OpasEditStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import PerustetyoryhmaSelect from './PerustetyoryhmaSelect.vue';
import EpKoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import _ from 'lodash';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import { themes, koulutustyyppiRyhmaSort } from '@shared/utils/perusteet';
import { EperusteetKoulutustyypit } from '@/utils/perusteet';
import EpMultiListSelect, { MultiListSelectItem } from '@shared/components/forms/EpMultiListSelect.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { UiKielet } from '@shared/stores/kieli';
import { MaintenanceStore } from '@/stores/MaintenanceStore';

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
    EpKoulutustyyppiSelect,
    EpDatepicker,
    EpMultiListSelect,
    EpColorIndicator,
  },
})
export default class RouteOppaanTiedot extends PerusteprojektiRoute {
  @Prop({ required: true })
  ulkopuolisetStore!: UlkopuolisetStore;

  @Prop({ required: true })
  perusteprojektiStore!: PerusteprojektiStore;

  private store: EditointiStore | null = null;
  private maintenanceStore: MaintenanceStore | null = null;

  async mounted() {
    await this.perusteprojektiStore.fetchPohjaProjektit();
  }

  async onProjektiChange(projektiId: number, perusteId: number) {
    this.store = new EditointiStore(new OpasEditStore(projektiId, perusteId));
    this.maintenanceStore = new MaintenanceStore(projektiId, perusteId);
  }

  get kielet() {
    return UiKielet;
  }

  ktToRyhma(koulutustyyppi) {
    return themes[koulutustyyppi];
  }

  get koulutustyypit() {
    return _.chain(EperusteetKoulutustyypit)
      .map(koulutustyyppi => {
        return {
          value: koulutustyyppi,
          text: this.$t(koulutustyyppi),
        } as MultiListSelectItem;
      })
      .sortBy(item => koulutustyyppiRyhmaSort[this.ktToRyhma(item.value)])
      .value();
  }

  get perusteet() {
    return _.chain(this.perusteprojektiStore.perusteet.value?.data)
      .map(peruste => {
        return {
          value: {
            id: peruste.id,
          },
          text: this.$kaanna((peruste as any).nimi),
        } as MultiListSelectItem;
      })
      .value();
  }

  async lataa() {
    await this.maintenanceStore?.exportPeruste();
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

  .asettamatta {
    font-style: italic;
    color: $gray-lighten-2;
  }
</style>
