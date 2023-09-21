<template>
  <EpMainView>
    <b-container>
      <EpSteps ref="epsteps" :steps="steps" :initial-step="0" :on-save="onSave" @cancel="onCancel" @stepChange="onStepChange">

        <template v-slot:pohja>

          <div class="row">
            <legend class="col-form-label col-sm-2">{{ $t('kayta-pohjana') }}</legend>
            <div class="col-sm-10 mb-4">
              <b-form-group class="mt-0 pt-0">
                <b-form-radio class="p-2 d-flex" v-model="tyyppi" value="pohjasta" name="tyyppi" :disabled="!pohjat || pohjat.length === 0">
                  <div class="d-flex">
                    <div>{{ $t('perustepohjaa') }}</div>
                    <EpSpinner v-if="!pohjat" small/>
                  </div>
                </b-form-radio>
                <div v-if="tyyppi === 'pohjasta'">
                  <EpMultiSelect
                    v-if="pohjat"
                    :value="data.peruste"
                    @input="valitsePeruste($event)"
                    :placeholder="$t('valitse-pohja')"
                    :is-editing="true"
                    :search-identity="nimiSearchIdentity"
                    :options="pohjat">
                    <template slot="singleLabel" slot-scope="{ option }">
                      {{ $kaanna(option.nimi) }}
                    </template>
                    <template slot="option" slot-scope="{ option }">
                      {{ $kaanna(option.nimi) }}
                    </template>
                  </EpMultiSelect>
                </div>

                <b-form-radio class="mt-3 p-2" v-model="tyyppi" value="perusteesta" name="tyyppi" :disabled="!perusteet || perusteet.length === 0">
                  <div class="d-flex">
                    <div>{{ $t('toista-perusteprojektia') }}</div>
                    <EpInfoPopover class="ml-2">
                      {{$t('vain-ammatilliset-tutkinnot')}}
                    </EpInfoPopover>
                    <EpSpinner v-if="!perusteet" small/>
                  </div>
                </b-form-radio>
                <div v-if="tyyppi === 'perusteesta'">
                  <EpMultiSelect
                    v-if="perusteet"
                    :value="data.peruste"
                    @input="valitsePeruste($event)"
                    :placeholder="$t('valitse-peruste')"
                    :is-editing="true"
                    :search-identity="nimiSearchIdentity"
                    :options="perusteet"
                    class="perustevalinta">
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
                </div>

                <b-form-radio class="mt-3 p-2" v-model="tyyppi" value="uusi" name="tyyppi">{{ $t('luo-uusi-ilman-pohjaa') }}</b-form-radio>

                <template v-if="$isAdmin()">
                  <b-form-radio class="mt-3 p-2" v-model="tyyppi" value="tiedostosta" name="tyyppi">{{ $t('tuo-tiedostosta') }}</b-form-radio>
                  <div v-if="tyyppi === 'tiedostosta'">
                    <ep-tiedosto-lataus :fileTypes="['application/json']" v-model="data.tiedosto" />
                  </div>
                </template>

              </b-form-group>
            </div>
          </div>
        </template>

        <template v-slot:tiedot>
          <b-form-group :label="$t('projektin-nimi') + '*'" required>
            <ep-input v-model="data.nimi" type="string" :is-editing="true" :placeholder="$t('kirjoita-projektin-nimi')" :validation="$v.data.nimi"/>
          </b-form-group>

          <b-form-group :label="$t('projektin-diaarinumero')">
            <ep-input v-model="data.diaarinumero" type="string" :is-editing="true" :placeholder="$t('kirjoita-projektin-diaarinumero')" :validation="$v.data.diaarinumero"/>
          </b-form-group>

          <b-form-group :label="$t('projektin-kuvaus')" required>
            <b-form-radio class="ml-1" v-model="data.projektiKuvaus" :value="kuvaus.uudistus" name="tyyppi">{{ $t('perusteen-uudistaminen-kuvaus') }}</b-form-radio>
            <b-form-radio class="ml-1" v-model="data.projektiKuvaus" :value="kuvaus.korjaus" name="tyyppi">{{ $t('perusteen-korjaus-kuvaus') }}</b-form-radio>
            <ep-input class="mt-1" v-model="data.kuvaus" type="localized" :is-editing="true" :placeholder="$t('projektin-vapaamuotoinen-kuvaus')" />
          </b-form-group>

          <b-form-group :label="$t('koulutus-tutkintotyyppi') + '*'" required>
            <koulutustyyppi-select v-model="data.koulutustyyppi" :isEditing="true" required :eiTuetutKoulutustyypit="eiTuetutKoulutustyypit"/>
          </b-form-group>

          <b-form-group :label="$t('perustetyoryhma')" required>
            <EpMultiSelect v-model="data.tyoryhma"
                           v-if="tyoryhmat"
                           :search-identity="nimiSearchIdentity"
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

          <b-form-group :label="$t('yhteyshenkilo')" required>
            <ep-input v-model="data.yhteyshenkilo" type="string" :is-editing="true" :placeholder="$t('kirjoita-yhteyshenkilon-nimi')" />
          </b-form-group>
        </template>

        <template v-slot:aikataulu>
          <EpAikataulu :aikataulut="tapahtumat">
            <span slot="luomispaiva-topic" v-html="$t('projektin-luomispaiva')"></span>
            <span slot="julkaisupaiva-topic" v-html="$t('peruste-astuu-voimaan')"></span>
          </EpAikataulu>

          <b-form-group
            v-for="paatavoite in data.paatavoitteet"
            :key="'paatavoite'+paatavoite.tapahtuma"
            :label="$kaanna(paatavoite.tavoite)"
            class="col-md-4 col-12">
            <ep-datepicker v-model="paatavoite.tapahtumapaiva" class="mb-2" :isEditing="true"/>
            <ep-toggle v-model="paatavoite.julkinen" v-if="isAmmatillinen" class="mb-2">
              {{$t('julkinen')}}
            </ep-toggle>
          </b-form-group>

          <div v-for="(tpvm, idx) in data.tavoitepaivamaarat" :key="idx" class="row p-0 m-0" >
            <b-form-group :label="$t('tavoitteen-pvm')" class="col-md-4 col-12">
              <ep-datepicker v-model="tpvm.tapahtumapaiva" class="mb-2" :isEditing="true" :validation="$v.data.tavoitepaivamaarat.$each.$iter[idx].tapahtumapaiva"/>
              <ep-toggle v-model="tpvm.julkinen" v-if="isAmmatillinen" class="mb-2">
                {{$t('julkinen')}}
              </ep-toggle>
            </b-form-group>
            <b-form-group :label="$t('tavoitteen-nimi-kuvaus') + '*'" class="col-md-7 col-11">
              <ep-input v-model="tpvm.tavoite" type="localized" :is-editing="true" :placeholder="$t('kirjoita-tavoite-nimi-kuvaus')" :validation="$v.data.tavoitepaivamaarat.$each.$iter[idx].tavoite" />
            </b-form-group>
            <b-form-group class="col-1 col-sm-1 text-center">
              <template v-slot:label><br/></template>
              <ep-button @click="poistaTavoite(tpvm)" variant="link" icon="delete" inherit-style></ep-button>
            </b-form-group>
          </div>
          <ep-button variant="outline" icon="add" @click="lisaaTavoite()">
            {{ $t('lisaa-tavoite') }}
          </ep-button>

        </template>

        <template v-slot:yhteenveto>
          <div class="d-flex">
            <div class="tieto w-50">
              <div class="nimi">
                {{ $t('projektin-nimi') }}
              </div>
              {{ data.nimi }}
            </div>
            <div class="tieto w-50">
              <div class="nimi">
                {{ $t('koulutus-tutkintotyyppi') }}
              </div>
              <span class="text-nowrap">
                <EpColorIndicator :kind="data.koulutustyyppi" />
                <span class="ml-2">{{ $t(data.koulutustyyppi) }}</span>
              </span>
            </div>
          </div>
          <div class="d-flex">
            <div class="tieto w-50">
              <div class="nimi">
                {{ $t('kuvaus') }}
              </div>
              <div v-if="data.projektiKuvaus === kuvaus.korjaus">
                {{ $t('perusteen-korjaus') }}
              </div>
              <div v-else-if="data.projektiKuvaus === kuvaus.uudistus">
                {{ $t('perusteen-uudistus') }}
              </div>
              <ep-input type="localized" :value="data.kuvaus" />
            </div>
            <div class="tieto w-50">
              <div>
                <div class="mb-5" v-if="data.tyoryhma">
                  <div class="nimi">
                    {{ $t('perustetyoryhma') }}
                  </div>
                  {{ $kaanna(data.tyoryhma.nimi) }}
                </div>
                <div class="nimi">
                  {{ $t('yhteyshenkilo') }}
                </div>
                {{ data.yhteyshenkilo }}
              </div>
            </div>
          </div>
          <div class="d-flex">
            <div class="tieto w-100">
              <div class="nimi">
                {{ $t('aikataulu') }}
              </div>
              <EpAikataulu :aikataulut="tapahtumat">
                <span slot="luomispaiva-topic" v-html="$t('projektin-luomispaiva')"></span>
                <span slot="julkaisupaiva-topic" v-html="$t('peruste-astuu-voimaan')"></span>
              </EpAikataulu>
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
import EpTiedostoLataus from '@shared/components/EpTiedostoLataus/EpTiedostoLataus.vue';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import { PerusteAikatauluDtoTapahtumaEnum, PerusteprojektiLuontiKuvausEnum } from '@shared/api/eperusteet';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { isLukiokoulutus, EiTuetutKoulutustyypit, isKoulutustyyppiSupported } from '@/utils/perusteet';
import { EperusteetKoulutustyypit, isKoulutustyyppiAmmatillinen } from '@shared/utils/perusteet';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
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
    EpTiedostoLataus,
    EpDatepicker,
    KoulutustyyppiSelect,
    EpToggle,
    EpInfoPopover,
  },
  validations() {
    return {
      data: this.validator,
    };
  },
})
export default class RoutePerusteprojektiLuonti extends Vue {
  @Prop({ required: true })
  perusteprojektiStore!: PerusteprojektiStore;

  @Prop({ required: true })
  ulkopuolisetStore!: UlkopuolisetStore;

  private data: any = {
    voimassaoloAlkaa: null,
    tavoitepaivamaarat: [] as any[],
    paatavoitteet: [] as any[],
    koulutustyyppi: null,
    tyoryhma: null,
    peruste: null,
    kuvaus: null,
    projektiKuvaus: null,
  };
  private tyyppi: 'pohjasta' | 'perusteesta' | 'tiedostosta' | 'uusi' | null = 'uusi';
  private currentStep: Step | null = null;

  async mounted() {
    this.ulkopuolisetStore.fetchTyoryhmat();
    await Promise.all([
      this.perusteprojektiStore.fetchPohjat(),
      this.perusteprojektiStore.fetchPohjaProjektit(),
    ]);

    this.data.paatavoitteet = this.defaultPaatavoitteet;
  }

  @Watch('tyyppi')
  onTyyppiChange() {
    this.data = {
      ...this.data,
      tiedosto: null,
      peruste: null,
      koulutustyyppi: null,
    };
  }

  get pohjat() {
    if (this.perusteprojektiStore.pohjat.value) {
      return _.sortBy(this.setIsDisabled(this.perusteprojektiStore.pohjat.value), pohja => _.toLower(this.$kaanna(pohja.nimi!)));
    }
  }

  get perusteet() {
    if (this.perusteprojektiStore.perusteet.value) {
      let ammatilliset = _.filter(this.perusteprojektiStore.perusteet.value, peruste => isKoulutustyyppiAmmatillinen(peruste.koulutustyyppi!));
      return _.sortBy(ammatilliset, peruste => _.toLower(this.$kaanna(peruste.nimi!)));
    }
  }

  setIsDisabled(koulutustyypilliset) {
    return _.map(koulutustyypilliset, koulutustyypillinen => {
      return {
        ...koulutustyypillinen,
        $isDisabled: !isKoulutustyyppiSupported(koulutustyypillinen.koulutustyyppi),
      };
    });
  }

  get steps() {
    const self = this;
    return [{
      key: 'pohja',
      name: this.$t('pohjan-valinta'),
      isValid() {
        if ((self.tyyppi === 'pohjasta' || self.tyyppi === 'perusteesta') && !self.data.peruste) {
          return false;
        }

        if (self.tyyppi === 'tiedostosta' && !self.data.tiedosto) {
          return false;
        }

        return true;
      },
      onNext() {
        if (self.data.tiedosto && !_.isEmpty(self.data.tiedosto.content.projekti)) {
          self.data.nimi = self.data.tiedosto.content.projekti.nimi;
          self.data.diaarinumero = self.data.tiedosto.content.projekti.diaarinumero;
          self.data.koulutustyyppi = self.data.tiedosto.content.projekti.koulutustyyppi;
          self.data.kuvaus = self.data.tiedosto.content.peruste.kuvaus;

          if (self.data.tiedosto.content.projekti.ryhmaOid) {
            self.data.tyoryhma = _.head(_.filter(self.tyoryhmat, tyoryhma => tyoryhma.oid === self.data.tiedosto.content.projekti.ryhmaOid));
          }
        }
      },
    }, {
      key: 'tiedot',
      name: this.$t('projektin-tiedot'),
      description: this.$t('projektin-tiedot-kuvaus'),
      isValid() {
        return !self.$v.$invalid;
      },
    }, {
      key: 'aikataulu',
      name: this.$t('aikataulu'),
      description: this.$t('aikataulu-kuvaus'),
      isValid() {
        return !self.$v.$invalid;
      },
    }, {
      key: 'yhteenveto',
      name: this.$t('tietojen-tarkistus'),
      description: this.$t('yhteenveto-kuvaus-tallenna-tiedot'),
    }];
  }

  valitsePeruste(event) {
    this.data.peruste = event;
    this.data.koulutustyyppi = event ? event.koulutustyyppi : null;
  }

  ktSearchIdentity(kt: any) {
    return _.toLower(this.$kaannaOlioTaiTeksti(kt));
  }

  nimiSearchIdentity(obj: any) {
    return _.toLower(this.$kaanna(obj.nimi));
  }

  get tyoryhmat() {
    return _.sortBy(this.ulkopuolisetStore.tyoryhmat.value, this.nimiSearchIdentity);
  }

  get vaihtoehdotKoulutustyypit() {
    return _.sortBy(EperusteetKoulutustyypit, x => this.$t(x));
  }

  get tapahtumat() {
    return _.chain([{
      tapahtuma: 'luominen',
      tavoite: { [Kielet.getSisaltoKieli.value]: this.$t('peruste-luotu') },
      tapahtumapaiva: new Date(),
    },
    ...this.data.paatavoitteet,
    ...this.data.tavoitepaivamaarat,
    ])
      .filter('tapahtumapaiva')
      .value();
  }

  get defaultPaatavoitteet() {
    return [{
      tapahtuma: _.toLower(PerusteAikatauluDtoTapahtumaEnum.LAUSUNTOKIERROS),
      tavoite: { [Kielet.getSisaltoKieli.value]: this.$t('lausuntokierros-alkaa') },
      tapahtumapaiva: null,
      julkinen: false,
    }, {
      tapahtuma: _.toLower(PerusteAikatauluDtoTapahtumaEnum.JOHTOKUNNANKASITTELY),
      tavoite: { [Kielet.getSisaltoKieli.value]: this.$t('johtokunnan-kasittely') },
      tapahtumapaiva: null,
      julkinen: false,
    }, {
      tapahtuma: _.toLower(PerusteAikatauluDtoTapahtumaEnum.ARVIOITUJULKAISUPAIVA),
      tavoite: { [Kielet.getSisaltoKieli.value]: this.$t('perusteen-arvioitu-julkaisupaiva') },
      tapahtumapaiva: null,
      julkinen: false,
    }, {
      tapahtuma: _.toLower(PerusteAikatauluDtoTapahtumaEnum.JULKAISU),
      tavoite: { [Kielet.getSisaltoKieli.value]: this.$t('peruste-astuu-voimaan') },
      tapahtumapaiva: null,
      julkinen: false,
    }];
  }

  poistaTavoite(tavoitepaivamaara) {
    this.data.tavoitepaivamaarat = _.without(this.data.tavoitepaivamaarat, tavoitepaivamaara);
  }

  get tavoiteHeading() {
    return ' ';
  }

  async onSave() {
    let luotu;
    const projekti = {
      diaarinumero: this.data.diaarinumero,
      johtokunnanKasittely: this.data.johtokunnanKasittely,
      koulutustyyppi: this.data.koulutustyyppi,
      lausuntakierrosAlkaa: this.data.lausuntakierrosAlkaa,
      nimi: this.data.nimi,
      perusteId: this.data.peruste?.id,
      laajuusYksikko: 'OSAAMISPISTE' as any,
      ryhmaOid: this.data.tyoryhma ? this.data.tyoryhma.oid : null,
      yhteistyotaho: this.data.yhteyshenkilo,
      perusteenAikataulut: this.tapahtumat,
      kuvaus: this.data.kuvaus,
      projektiKuvaus: this.data.projektiKuvaus,
      ...(isLukiokoulutus(this.data.koulutustyyppi) && { toteutus: 'lops2019' as any }),
    };

    if (this.data.tiedosto) {
      luotu = await this.perusteprojektiStore.importPerusteprojekti({
        ...this.data.tiedosto.content,
        projekti: {
          ...this.data.tiedosto.content.projekti,
          ...projekti,
        },
        peruste: {
          ...this.data.tiedosto.content.peruste,
          perusteenAikataulut: this.tapahtumat,
          kuvaus: this.data.kuvaus,
        },
      });
    }
    else {
      luotu = await this.perusteprojektiStore.addPerusteprojekti(projekti);
    }

    this.$router.push({
      name: 'perusteprojekti',
      params: {
        projektiId: '' + luotu.id,
      },
    });
  }

  lisaaTavoite() {
    this.data.tavoitepaivamaarat = [
      ...this.data.tavoitepaivamaarat, {
        tapahtuma: 'tavoite',
        tavoite: { [Kielet.getSisaltoKieli.value]: '' },
        tapahtumapaiva: new Date(),
        julkinen: false,
      },
    ];
  }

  onCancel() {
    this.$router.push({
      name: 'perusteprojektit',
    });
  }

  onStepChange(step) {
    this.currentStep = step;
  }

  get validator() {
    if (this.currentStep && this.currentStep.key === 'tiedot') {
      return {
        nimi: notNull(),
        koulutustyyppi: notNull(),
      };
    }

    if (this.currentStep && this.currentStep.key === 'aikataulu') {
      return {
        tavoitepaivamaarat: {
          $each: {
            tapahtumapaiva: notNull(),
            tavoite: {
              [Kielet.getSisaltoKieli.value]: notNull(),
            },
          },
        },
      };
    }

    return {};
  }

  get kuvaus() {
    return {
      uudistus: PerusteprojektiLuontiKuvausEnum.UUDISTUS,
      korjaus: PerusteprojektiLuontiKuvausEnum.KORJAUS,
    };
  }

  get isAmmatillinen() {
    if (this.data.koulutustyyppi) {
      return isKoulutustyyppiAmmatillinen(this.data.koulutustyyppi);
    }
  }

  get eiTuetutKoulutustyypit() {
    return EiTuetutKoulutustyypit;
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

.info-icon {
  margin-left: 5px;
  align-self: center;
}

</style>
