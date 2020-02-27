<template>
  <EpMainView>
    <b-container>
      <EpSteps :steps="steps" :initial-step="0" :on-save="onSave">

        <template v-slot:pohja>
          <b-form-group>
            <b-form-radio class="mt-2 p-2" v-model="tyyppi" value="pohjasta" name="tyyppi" :disabled="!pohjat || pohjat.length === 0">{{ $t('tuo-perustepohja') }}</b-form-radio>
            <div v-if="tyyppi === 'pohjasta'">
              <EpMultiSelect
                v-if="pohjat"
                v-model="data.peruste"
                :placeholder="$t('valitse-pohja')"
                :is-editing="true"
                :options="pohjat">
                <template slot="singleLabel" slot-scope="{ option }">
                  {{ option.perusteprojekti.nimi }}
                </template>
                <template slot="option" slot-scope="{ option }">
                  {{ option.perusteprojekti.nimi }}
                </template>
              </EpMultiSelect>
              <EpSpinner v-else />
            </div>

            <b-form-radio class="mt-3 p-2" v-model="tyyppi" value="perusteesta" name="tyyppi" :disabled="!perusteet || perusteet.length === 0">{{ $t('tuo-peruste') }}</b-form-radio>
            <div v-if="tyyppi === 'perusteesta'">
              <EpMultiSelect
                v-if="perusteet"
                v-model="data.peruste"
                :placeholder="$t('valitse-peruste')"
                :is-editing="true"
                :options="perusteet">
                <template slot="singleLabel" slot-scope="{ option }">
                  {{ $kaanna(option.nimi) }}
                </template>
                <template slot="option" slot-scope="{ option }">
                  {{ $kaanna(option.nimi) }}
                </template>
              </EpMultiSelect>
              <EpSpinner v-else />
            </div>

            <b-form-radio class="mt-3 p-2" v-model="tyyppi" value="uusi" name="tyyppi">{{ $t('luo-uusi') }}</b-form-radio>

          </b-form-group>
        </template>

        <template v-slot:tiedot>
          <b-form-group :label="$t('projektin-nimi') + '*'" required>
            <ep-input v-model="data.nimi" type="string" :is-editing="true" :placeholder="$t('kirjoita-projektin-nimi')" />
          </b-form-group>

          <b-form-group :label="$t('projektin-diaarinumero') + '*'" required>
            <ep-input v-model="data.diaarinumero" type="string" :is-editing="true" :placeholder="$t('kirjoita-projektin-diaarinumero')" />
          </b-form-group>

          <b-form-group :label="$t('projektin-kuvaus')" required>
            <b-form-radio class="ml-1" v-model="data.muutos" value="iso" name="tyyppi">{{ $t('perusteen-uudistaminen') }}</b-form-radio>
            <b-form-radio class="ml-1" v-model="data.muutos" value="pieni" name="tyyppi">{{ $t('perusteen-korjaus') }}</b-form-radio>
            <ep-input class="mt-1" v-model="data.kuvaus" type="string" :is-editing="true" :placeholder="$t('projektin-vapaamuotoinen-kuvaus')" />
          </b-form-group>

          <b-form-group :label="$t('koulutus-tutkintotyyppi') + '*'" required>
            <EpMultiSelect v-model="data.koulutustyyppi"
                           :placeholder="$t('valitse-koulutustyyppi')"
                           :search-identity="tyoryhmaSearchIdentity"
                           :is-editing="true"
                           :options="vaihtoehdotKoulutustyypit">
              <template slot="singleLabel" slot-scope="{ option }">
                <span class="text-nowrap">
                  <EpColorIndicator :size="10" :kind="option" />
                  <span class="ml-2">{{ $t(option) }}</span>
                </span>
              </template>
              <template slot="option" slot-scope="{ option }">
                <span class="text-nowrap">
                  <EpColorIndicator :size="10" :kind="option" />
                  <span class="ml-2">{{ $t(option) }}</span>
                </span>
              </template>
            </EpMultiSelect>
          </b-form-group>

          <b-form-group :label="$t('perustetyoryhma') + '*'" required>
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

          <b-form-group :label="$t('yhteyshenkilo')" required>
            <ep-input v-model="data.yhteyshenkilo" type="string" :is-editing="true" :placeholder="$t('kirjoita-yhteyshenkilon-nimi')" />
          </b-form-group>
        </template>

        <template v-slot:aikataulu>
          <EpAikataulu :aikataulut="tapahtumat" />

          <b-form-group :label="$t('peruste-astuu-voimaan') + '*'" required>
            <b-form-datepicker v-model="data.voimassaoloAlkaa" class="mb-2" />
          </b-form-group>

          <b-form-group :label="$t('perusteen-arvioitu-julkaisupaiva')" required>
            <b-form-datepicker v-model="data.paatosPvm" class="mb-2" />
          </b-form-group>

          <b-form-group :label="$t('lausuntokierros-alkaa')" required>
            <b-form-datepicker v-model="data.lausuntakierrosAlkaa" class="mb-2" />
          </b-form-group>

          <b-form-group :label="$t('johtokunnan-kasittely')" required>
            <b-form-datepicker v-model="data.johtokunnanKasittely" class="mb-2" />
          </b-form-group>

          <div class="d-md-flex" v-for="(tpvm, idx) in data.tavoitepaivamaarat" :key="idx">
            <div class="flex-grow-1">
              <b-form-group :label="$t('tavoitteen-pvm')">
                <b-form-datepicker v-model="tpvm.tapahtumapaiva" class="mb-2" />
              </b-form-group>
            </div>
            <div class="flex-grow-1">
              <b-form-group :label="$t('tavoitteen-nimi-kuvaus')">
                <ep-input v-model="tpvm.tavoite" type="string" :is-editing="true" :placeholder="$t('kirjoita-tavoite-nimi-kuvaus')" />
              </b-form-group>
            </div>
            <div>
              <b-form-group :label="tavoiteHeading">
                <ep-button @click="poistaTavoite(idx)" variant="link" icon="roskalaatikko"></ep-button>
              </b-form-group>
            </div>
          </div>
          <ep-button variant="link" icon="plus" @click="lisaaTavoite()">
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
                <EpColorIndicator :size="10" :kind="data.koulutustyyppi" />
                <span class="ml-2">{{ $t(data.koulutustyyppi) }}</span>
              </span>
            </div>
          </div>
          <div class="d-flex">
            <div class="tieto w-50">
              <div class="nimi">
                {{ $t('kuvaus') }}
              </div>
              <p>{{ data.kuvaus }}</p>
            </div>
            <div class="tieto w-50">
              <div>
                <div class="nimi">
                  {{ $t('perustetyoryhma') }}
                </div>
                {{ $kaanna(data.tyoryhma.nimi) }}
                <div class="nimi mt-5">
                  {{ $t('yhteyshenkilo') }}
                </div>
                {{ data.yhteyshenkilo }}
              </div>
            </div>
          </div>
        </template>

      </EpSteps>
    </b-container>
  </EpMainView>
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
import { PerusteStore } from '@/stores/PerusteStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { EperusteetKoulutustyypit } from '@/utils/perusteet';
import { Page } from '@shared/tyypit';
import { BvTableFieldArray } from 'bootstrap-vue';
import * as _ from 'lodash';

export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

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
  },
})
export default class RoutePerusteprojektiLuonti extends Vue {
  @Prop({ required: true })
  pohjatStore!: PerusteStore;

  @Prop({ required: true })
  perusteetStore!: PerusteStore;

  @Prop({ required: true })
  perusteprojektiStore!: PerusteprojektiStore;

  @Prop({ required: true })
  ulkopuolisetStore!: UlkopuolisetStore;

  private data: any = {
    tavoitepaivamaarat: [] as any[],
  };
  private tyyppi: 'pohjasta' | 'perusteesta' | 'uusi' | null = null;

  async mounted() {
    this.ulkopuolisetStore.fetchTyoryhmat();
    await Promise.all([
      this.perusteprojektiStore.fetchPohjat(),
      this.perusteprojektiStore.fetchPohjaProjektit(),
    ]);

    if (this.pohjat && this.pohjat?.length > 0) {
      this.tyyppi = 'pohjasta';
    }
    else if (this.perusteet && this.perusteet?.length > 0) {
      this.tyyppi = 'perusteesta';
    }
    else {
      this.tyyppi = 'uusi';
    }
  }

  @Watch('tyyppi')
  onTyyppiChange() {
    this.data = {
      ...this.data,
      pohja: null,
    };
  }

  get pohjat() {
    return this.perusteprojektiStore.pohjat.value?.data;
  }

  get perusteet() {
    return this.perusteprojektiStore.perusteet.value?.data;
  }

  get steps() {
    return [{
      key: 'pohja',
      name: this.$t('pohjan-valinta'),
      description: this.$t('pohjan-valinta-kuvaus'),
      isValid() {
        return true;
      },
    }, {
      key: 'tiedot',
      name: this.$t('projektin-tiedot'),
      description: this.$t('projektin-tiedot-kuvaus'),
    }, {
      key: 'aikataulu',
      name: this.$t('aikataulu'),
      description: this.$t('aikataulu-kuvaus'),
    }, {
      key: 'yhteenveto',
      name: this.$t('yhteenveto'),
      description: this.$t('yhteenveto-kuvaus'),
    }];
  }

  tyoryhmaSearchIdentity(tr: any) {
    return _.toLower(this.$kaanna(tr.nimi));
  }

  get tyoryhmat() {
    return _.sortBy(this.ulkopuolisetStore.tyoryhmat.value, this.tyoryhmaSearchIdentity);
  }

  get vaihtoehdotKoulutustyypit() {
    return _.sortBy(EperusteetKoulutustyypit, x => this.$t(x));
  }

  get tapahtumat() {
    return [{
      tapahtuma: 'luominen',
      tapahtumapaiva: new Date(),
    }, {
      tapahtuma: 'tavoite',
      tavoite: 'peruste-astuu-voimaan',
      tapahtumapaiva: this.data.voimassaoloAlkaa && new Date(this.data.voimassaoloAlkaa),
    }, {
      tapahtuma: 'julkaisu',
      tavoite: 'perusteen-arvioitu-julkaisupaiva',
      tapahtumapaiva: this.data.paatosPvm && new Date(this.data.paatosPvm),
    }, {
      tapahtuma: 'tavoite',
      tavoite: 'lausuntokierros-alkaa',
      tapahtumapaiva: this.data.lausuntakierrosAlkaa && new Date(this.data.lausuntakierrosAlkaa),
    }, {
      tapahtuma: 'tavoite',
      tavoite: 'johtokunnan-kasittely',
      tapahtumapaiva: this.data.johtokunnanKasittely && new Date(this.data.johtokunnanKasittely),
    }, ...this.data.tavoitepaivamaarat];
  }

  poistaTavoite(idx: number) {
    this.data.tavoitepaivamaarat = _.without(this.data.tavoitepaivamaarat, idx);
  }

  get tavoiteHeading() {
    return ' ';
  }

  async onSave() {
    const luotu = await this.perusteprojektiStore.addPerusteprojekti({
      diaarinumero: this.data.diaarinumero,
      johtokunnanKasittely: this.data.johtokunnanKasittely,
      koulutustyyppi: this.data.koulutustyyppi,
      lausuntakierrosAlkaa: this.data.lausuntakierrosAlkaa,
      nimi: this.data.nimi,
      paatosPvm: this.data.paatosPvm,
      perusteId: this.data.peruste?.id,
      laajuusYksikko: 'OSAAMISPISTE' as any,
      ryhmaOid: this.data.tyoryhma.oid,
      voimassaoloAlkaa: this.data.voimassaoloAlkaa,
      yhteistyotaho: this.data.paatosPvm,
    });
    console.log('saving ', this.data);
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
        tavoite: '',
        tapahtumapaiva: new Date(),
      },
    ];
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
