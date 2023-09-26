<template>
  <EpMainView>
    <b-container>
      <EpSteps :steps="steps" :initial-step="0" :on-save="onSave" @cancel="onCancel">

        <template v-slot:pohja>

          <div class="row">
            <legend class="col-form-label col-sm-2">{{ $t('kayta-pohjana') }}</legend>
            <div class="col-sm-10 mb-4">
              <b-form-group class="mt-0 pt-0">
                <b-form-radio class="p-2" v-model="tyyppi" value="oppaasta" name="tyyppi" :disabled="!oppaat || oppaat.length === 0">{{ $t('toinen-opas') }}</b-form-radio>
                <div v-if="tyyppi === 'oppaasta'" class="ml-2">
                  <EpMultiSelect
                    v-if="oppaat"
                    v-model="data.pohja"
                    :placeholder="$t('valitse-opas')"
                    :is-editing="true"
                    :options="oppaat">
                    <template slot="singleLabel" slot-scope="{ option }">
                      {{ option.nimi }}
                    </template>
                    <template slot="option" slot-scope="{ option }">
                      {{ option.nimi }}
                    </template>
                  </EpMultiSelect>
                  <EpSpinner v-else />
                </div>

                <b-form-radio class="mt-3 p-2" v-model="tyyppi" value="uusi" name="tyyppi">{{ $t('luo-uusi') }}</b-form-radio>

              </b-form-group>
            </div>
          </div>
        </template>

        <template v-slot:tiedot>

          <b-form-group :label="$t('oppaan-nimi') + ' *'" required class="pl-0">
            <ep-input v-model="data.lokalisoituNimi" :is-editing="true" :placeholder="$t('kirjoita-oppaan-nimi')"
                :validation="$v.data.lokalisoituNimi" />
          </b-form-group>

          <b-form-group :label="$t('opastyoryhma') + ' *'" required class="pl-0">
            <EpMultiSelect v-model="data.tyoryhma"
                           v-if="tyoryhmat"
                           :placeholder="$t('valitse-tyoryhma')"
                           :search-identity="tyoryhmaSearchIdentity"
                           :is-editing="true"
                           :options="tyoryhmat">
              <template slot="singleLabel" slot-scope="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
              <template slot="option" slot-scope="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
            </EpMultiSelect>
            <EpSpinner v-else />
          </b-form-group>

          <b-form-group :label="$t('koulutus-tutkintotyyppi')" required class="pl-0">

            <div class="row" v-for="(koulutustyyppi, index) in data.koulutustyypit" :key="'koulutustyyppi'+index">
              <koulutustyyppi-select
                v-model="data.koulutustyypit[index]"
                :isEditing="true"
                :koulutustyypit="koulutustyyppiOptions"
                required class="mb-2 col-11"/>
              <div class="col-1">
                <ep-button v-if="index > 0"
                           buttonClass="p-0 pt-2 roskalaatikko"
                           variant="link"
                           icon="delete"
                           @click="poistaKoulutustyyppi(index)"/>
              </div>
            </div>
            <ep-button buttonClass="pl-0" variant="outline-primary" icon="add" @click="lisaaKoulutustyyppi">
              {{$t('lisaa-koulutus-tutkintotyyppi')}}
            </ep-button>
          </b-form-group>

          <b-form-group :label="$t('peruste')" required class="pl-0">
            <EpMultiListSelect v-model="data.perusteet"
                           :is-editing="true"
                           :items="perusteet"
                           :required="true">
              <template slot="lisaaTeksti">
                {{$t('lisaa-peruste')}}
              </template>
            </EpMultiListSelect>
          </b-form-group>

        </template>

        <template slot="luo">
          {{$t('luo-opas')}}
        </template>
      </EpSteps>
    </b-container>
  </EpMainView>
</template>

<script lang="ts">
import { Watch, Prop, Component, Mixins } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpMultiListSelect, { MultiListSelectItem } from '@shared/components/forms/EpMultiListSelect.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSteps from '@shared/components/EpSteps/EpSteps.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { OppaatStore } from '@/stores/OppaatStore';
import * as _ from 'lodash';
import { themes, koulutustyyppiRyhmaSort, EperusteetKoulutustyypit } from '@shared/utils/perusteet';
import { validationMixin } from 'vuelidate';
import { requiredOneLang } from '../../eperusteet-frontend-utils/vue/src/validators/required';
import { Kielet } from '../../eperusteet-frontend-utils/vue/src/stores/kieli';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';

export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

@Component({
  components: {
    EpAikataulu,
    EpButton,
    EpColorIndicator,
    EpInput,
    EpMainView,
    EpMultiSelect,
    EpSearch,
    EpSelect,
    EpSpinner,
    EpSteps,
    EpMultiListSelect,
    KoulutustyyppiSelect,
  },
  validations() {
    return {
      data: this.validator,
    };
  },
})
export default class RouteOppaatLuonti extends Mixins(validationMixin) {
  @Prop({ required: true })
  perusteprojektiStore!: PerusteprojektiStore;

  @Prop({ required: true })
  ulkopuolisetStore!: UlkopuolisetStore;

  @Prop({ required: true })
  oppaatStore!: OppaatStore;

  private data: any = {
    koulutustyypit: [null],
  };
  private tyyppi: 'oppaasta' | 'uusi' = 'uusi';
  private currentStep: string | null = null;

  async mounted() {
    await Promise.all([
      this.ulkopuolisetStore.fetchTyoryhmat(),
      this.oppaatStore.updateQuery(),
      this.perusteprojektiStore.fetchPohjaProjektit(),
    ]);
  }

  @Watch('tyyppi')
  onTyyppiChange() {
    this.data = {
      ...this.data,
      pohja: null,
      koulutustyypit: [
        null,
      ],
    };
  }

  get koulutustyyppiOptions() {
    return [...EperusteetKoulutustyypit, 'koulutustyyppi_muu'];
  }

  get oppaat() {
    return this.oppaatStore.oppaat.value;
  }

  get steps() {
    const self = this;
    return [{
      key: 'pohja',
      name: this.$t('pohjan-valinta'),
      isValid() {
        return !(self.tyyppi === 'oppaasta' && !self.data.pohja);
      },
    }, {
      key: 'tiedot',
      name: this.$t('oppaan-tiedot'),
      isValid() {
        return !self.$v.$invalid && !_.isEmpty(self.data.tyoryhma);
      },
    },
    ];
  }

  stepChange(step) {
    this.currentStep = step;
  }

  tyoryhmaSearchIdentity(tr: any) {
    return _.toLower(this.$kaanna(tr.nimi));
  }

  ktToRyhma(koulutustyyppi) {
    return themes[koulutustyyppi];
  }

  get tyoryhmat() {
    return _.sortBy(this.ulkopuolisetStore.tyoryhmat.value, this.tyoryhmaSearchIdentity);
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
    return _.chain(this.perusteprojektiStore.perusteet.value)
      .map(peruste => {
        return {
          value: peruste,
          text: this.$kaanna((peruste as any).nimi),
        } as MultiListSelectItem;
      })
      .sortBy(peruste => _.toLower(peruste.text))
      .value();
  }

  async onSave() {
    const luotu = await this.oppaatStore.saveOpas({
      nimi: this.data.lokalisoituNimi[Kielet.getSisaltoKieli.value],
      lokalisoituNimi: this.data.lokalisoituNimi,
      ryhmaOid: this.data.tyoryhma.oid,
      oppaanKoulutustyypit: _.filter(this.data.koulutustyypit, koulutustyyppi => koulutustyyppi !== null),
      oppaanPerusteet: this.data.perusteet,
      pohjaId: this.data.pohja?.peruste.id,
    });
    this.$router.push({
      name: 'opas',
      params: {
        projektiId: '' + luotu.id,
      },
    });
  }

  onCancel() {
    this.$router.push({
      name: 'oppaat',
    });
  }

  get validator() {
    return {
      lokalisoituNimi: requiredOneLang(),
    };
  }

  lisaaKoulutustyyppi() {
    this.data.koulutustyypit = [
      ...this.data.koulutustyypit,
      null,
    ];
  }

  poistaKoulutustyyppi(index) {
    this.data.koulutustyypit = _.filter(this.data.koulutustyypit, (val, valIndex) => index !== valIndex);
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
