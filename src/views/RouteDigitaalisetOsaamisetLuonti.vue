<template>
  <EpMainView>
    <b-container>
      <EpSteps ref="epsteps" :steps="steps" :initial-step="0" :on-save="onSave" @cancel="onCancel" @stepChange="onStepChange">

        <template v-slot:pohja>
          <div class="mb-5">{{ $t('digitaalinen-osaaminen-luonti-selite') }}</div>

          <div class="row">
            <div class="col-sm-10 mb-4">
              <b-form-group class="mt-0" :label="$t('kayta-pohjana') + ' *'">

                <b-form-radio v-model="tyyppi" value="perusteesta" name="tyyppi" :disabled="!perusteet || perusteet.length === 0">{{ $t('toinen-projekti') }}</b-form-radio>
                <div v-if="tyyppi === 'perusteesta'">
                  <EpMultiSelect
                    v-if="perusteet"
                    :value="data.peruste"
                    @input="valitsePeruste($event)"
                    :placeholder="$t('valitse-peruste')"
                    :is-editing="true"
                    :search-identity="nimiSearchIdentity"
                    :options="perusteet"
                    class="perustevalinta mb-2 mt-2">
                    <template slot="singleLabel" slot-scope="{ option }">
                      {{ $kaanna(option.nimi) }}
                      <span class="ml-3 voimassaolo" v-if="option.voimassaoloAlkaa || option.voimassaoloLoppuu">
                        (<span v-if="option.voimassaoloAlkaa">{{$sd(option.voimassaoloAlkaa)}}</span>-<span v-if="option.voimassaoloLoppuu">{{$sd(option.voimassaoloLoppuu)}}</span>)
                      </span>
                    </template>
                    <template slot="option" slot-scope="{ option }">
                      {{ $kaanna(option.nimi) }}
                      <span class="ml-3 voimassaolo" v-if="option.voimassaoloAlkaa || option.voimassaoloLoppuu">
                        (<span v-if="option.voimassaoloAlkaa">{{$sd(option.voimassaoloAlkaa)}}</span> - <span v-if="option.voimassaoloLoppuu">{{$sd(option.voimassaoloLoppuu)}}</span>)
                      </span>
                    </template>
                  </EpMultiSelect>
                  <EpSpinner v-else />
                </div>
              </b-form-group>

              <b-form-radio class="mb-4" v-model="tyyppi" value="uusi" name="tyyppi">{{ $t('luo-uusi') }}</b-form-radio>
              <b-form-group :label="$t('projektin-nimi') + '*'" required v-if="tyyppi">
                <ep-input v-model="data.nimi" type="string" :is-editing="true" :placeholder="$t('kirjoita-projektin-nimi')" :validation="$v.data.nimi"/>
              </b-form-group>
            </div>
           </div>
        </template>

        <template v-slot:luo>
          {{$t('luo-perusteprojekti')}}
        </template>

      </EpSteps>
    </b-container>
  </EpMainView>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSteps, { Step } from '@shared/components/EpSteps/EpSteps.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { PerusteprojektiLuontiDtoTyyppiEnum } from '@shared/api/eperusteet';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import * as _ from 'lodash';
import { notNull } from '@shared/validators/required';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';

const util = require('util');

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
    EpDatepicker,
    KoulutustyyppiSelect,
    EpToggle,
  },
  validations() {
    return {
      data: this.validator,
    };
  },
})
export default class RouteDigitaalisetOsaamisetLuonti extends Vue {
  @Prop({ required: true })
  perusteprojektiStore!: PerusteprojektiStore;

  private data: any = {
    nimi: null,
    peruste: null,
  };
  private currentStep: Step | null = null;
  private tyyppi: 'perusteesta' | 'uusi' | null = null;

  async mounted() {
    await this.perusteprojektiStore.fetchPohjaDigitaalisetOsaamiset();
  }

  @Watch('tyyppi')
  onTyyppiChange() {
    this.data = {
      ...this.data,
      peruste: null,
    };
  }

  get perusteet() {
    if (this.perusteprojektiStore.perusteet.value) {
      return _.sortBy(this.perusteprojektiStore.perusteet.value, peruste => _.toLower(this.$kaanna(peruste.nimi!)));
    }
  }

  get steps() {
    const self = this;
    return [{
      key: 'pohja',
      name: this.$t('uusi-projekti'),
      isValid() {
        if (_.isEmpty(self.data.nimi)) {
          return false;
        }

        if (self.tyyppi === 'perusteesta' && !self.data.peruste) {
          return false;
        }

        return true;
      },
    }];
  }

  valitsePeruste(event) {
    this.data.peruste = event;
  }

  nimiSearchIdentity(obj: any) {
    return _.toLower(this.$kaanna(obj.nimi));
  }

  async onSave() {
    let luotu;
    const projekti = {
      nimi: this.data.nimi,
      perusteId: this.data.peruste?.id,
      tyyppi: PerusteprojektiLuontiDtoTyyppiEnum.DIGITAALINENOSAAMINEN,
    };

    luotu = await this.perusteprojektiStore.addPerusteprojekti(projekti);

    this.$router.push({
      name: 'perusteprojekti',
      params: {
        projektiId: '' + luotu.id,
      },
    });
  }

  onCancel() {
    this.$router.push({
      name: 'digitaalisetosaamiset',
    });
  }

  onStepChange(step) {
    this.currentStep = step;
  }

  get validator() {
    if (this.currentStep && this.currentStep.key === 'pohja') {
      return {
        nimi: notNull(),
      };
    }

    return {};
  }
}
</script>

<style lang="scss" scoped>

.tieto {
  padding: 20px 20px 20px 0px;

  .nimi {
    font-weight: 600;
  }
}

.perustevalinta {

  .voimassaolo {
    font-size:0.9rem;
  }
}

</style>
