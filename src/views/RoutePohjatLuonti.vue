<template>
  <EpMainView>
    <b-container>
      <EpSteps :steps="steps" :initial-step="0" :on-save="onSave" @cancel="onCancel">

        <template v-slot:pohja>

          <div class="row">
            <legend class="col-form-label col-sm-2">{{ $t('kayta-pohjana') }}</legend>
            <div class="col-sm-10 mb-4">
              <b-form-group class="mt-0 pt-0">
                <b-form-radio class="p-2" v-model="tyyppi" value="pohjasta" name="tyyppi" :disabled="!pohjat || pohjat.length === 0">{{ $t('toista-pohjaa') }}</b-form-radio>
                <div v-if="tyyppi === 'pohjasta'" class="ml-2">
                  <EpMultiSelect
                    v-if="pohjat"
                    v-model="data.pohja"
                    :placeholder="$t('valitse-pohja')"
                    :is-editing="true"
                    :options="pohjat">
                    <template slot="singleLabel" slot-scope="{ option }">
                      {{ option.nimi }}
                    </template>
                    <template slot="option" slot-scope="{ option }">
                      {{ option.nimi }}
                    </template>
                  </EpMultiSelect>
                  <EpSpinner v-else />
                </div>

                <b-form-radio class="mt-3 p-2" v-model="tyyppi" value="uusi" name="tyyppi">{{ $t('luo-uusi-perustepohja') }}</b-form-radio>

              </b-form-group>
            </div>
          </div>
        </template>

        <template v-slot:tiedot>

          <b-form-group :label="$t('projektin-nimi-label') + ' *'" required class="pl-0">
            <ep-input v-model="data.nimi" :is-editing="true" :placeholder="$t('kirjoita-projektin-nimi')"
                :validation="$v.data.nimi" />
          </b-form-group>

          <b-form-group :label="$t('perustetyoryhma')" required class="pl-0">
            <EpMultiSelect v-model="data.tyoryhma"
                           v-if="tyoryhmat"
                           :placeholder="$t('valitse')"
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

          <b-form-group :label="$t('koulutus-tutkintotyyppi') + ' *'" required>
            <koulutustyyppi-select v-model="data.koulutustyyppi" :isEditing="true" required :eiTuetutKoulutustyypit="eiTuetutKoulutustyypit"/>
          </b-form-group>

        </template>

        <template slot="luo">
          {{$t('luo-perustepohja')}}
        </template>
      </EpSteps>
    </b-container>
  </EpMainView>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue, Mixins } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
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
import { PerusteprojektiLuontiDto, PerusteQuery, PerusteprojektiKevytDto, PerusteprojektiLuontiDtoTyyppiEnum, PerusteprojektiListausDto } from '@shared/api/eperusteet';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { Page, Kieli } from '@shared/tyypit';
import { BvTableFieldArray } from 'bootstrap-vue';
import * as _ from 'lodash';
import { themes, koulutustyyppiRyhmaSort, EperusteetKoulutustyypit } from '@shared/utils/perusteet';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import { computed } from '@vue/composition-api';
import { requiredOneLang, translated } from '../../eperusteet-frontend-utils/vue/src/validators/required';
import { Kielet } from '../../eperusteet-frontend-utils/vue/src/stores/kieli';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import { EiTuetutKoulutustyypit, isKoulutustyyppiSupported } from '@/utils/perusteet';

@Component({
  components: {
    EpAikataulu,
    EpButton,
    EpColorIndicator,
    EpIcon,
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
export default class RoutePohjatLuonti extends Mixins(validationMixin) {
  @Prop({ required: true })
  pohjatStore!: PerusteetStore;

  @Prop({ required: true })
  ulkopuolisetStore!: UlkopuolisetStore;

  @Prop({ required: true })
  perusteprojektiStore!: PerusteprojektiStore;

  private data: any = {};
  private tyyppi: 'pohjasta' | 'uusi' = 'uusi';
  private currentStep: string | null = null;

  async mounted() {
    await Promise.all([
      this.ulkopuolisetStore.fetchTyoryhmat(),
      this.pohjatStore.updateQuery({}),
    ]);
  }

  @Watch('tyyppi')
  onTyyppiChange() {
    this.data = {
      ...this.data,
      pohja: null,
    };
  }

  get pohjat() {
    return _.map(this.pohjatStore.projects.value?.data, pohja => {
      return {
        ...pohja,
        $isDisabled: !isKoulutustyyppiSupported(pohja.koulutustyyppi),
      };
    });
  }

  get steps() {
    const self = this;
    return [{
      key: 'pohja',
      name: this.$t('pohjan-valinta'),
      isValid() {
        return !(self.tyyppi === 'pohjasta' && !self.data.pohja);
      },
    }, {
      key: 'tiedot',
      name: this.$t('projektin-tiedot'),
      isValid() {
        return !self.$v.$invalid
        && !_.isEmpty(self.data.koulutustyyppi);
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

  koulutustyyppiSearchIdentity(kt) {
    return _.toLower(this.$kaannaOlioTaiTeksti(kt));
  }

  ktToRyhma(koulutustyyppi) {
    return themes[koulutustyyppi];
  }

  get tyoryhmat() {
    return _.sortBy(this.ulkopuolisetStore.tyoryhmat.value, this.tyoryhmaSearchIdentity);
  }

  get vaihtoehdotKoulutustyypit() {
    return _.sortBy(EperusteetKoulutustyypit, x => koulutustyyppiRyhmaSort[this.ktToRyhma(x)]);
  }

  async onSave() {
    try {
      const luotu = await this.perusteprojektiStore.addPerusteprojektiPohja({
        nimi: this.data.nimi[Kielet.getSisaltoKieli.value],
        ryhmaOid: this.data.tyoryhma ? this.data.tyoryhma.oid : undefined,
        koulutustyyppi: this.data.koulutustyyppi,
        perusteId: this.data.pohja?.peruste.id,
        tyyppi: PerusteprojektiLuontiDtoTyyppiEnum.POHJA,
      });
      this.$router.push({
        name: 'perusteprojekti',
        params: {
          projektiId: '' + luotu.id,
        },
      });
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
  }

  onCancel() {
    this.$router.push({
      name: 'pohjat',
    });
  }

  get validator() {
    return {
      nimi: requiredOneLang(),
    };
  }

  get eiTuetutKoulutustyypit() {
    return EiTuetutKoulutustyypit;
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
