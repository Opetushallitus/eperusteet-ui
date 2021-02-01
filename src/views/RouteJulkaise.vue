<template>
  <div class="p-4">
    <h2>{{ $t('julkaisunakyma') }}</h2>
    <div>{{ $t('julkaisunakyma-kuvaus') }}</div>

    <div class="mt-4">
      <h3>{{ $t('julkaisu-vaikutukset') }}</h3>
      <ul>
        <li>{{ $t('julkaisusta-julkinen') }}</li>
        <li>{{ $t('julkaisusta-luodaan-pdf') }}</li>
        <li>{{ $t('julkaisusta-vanhat-versiot-sailyvat') }}</li>
      </ul>
    </div>
    <div>
      <h3>{{ $t('tarkistukset') }}</h3>
      <ep-virhelistaus v-if="status"
                       :validation="status" />
      <EpSpinner v-else />
    </div>

    <div v-if="peruste && julkaisuMahdollinen">
      <hr class="mt-4 mb-4">
      <h3>{{ $t('perusteen-tiedot') }}</h3>
      <b-container fluid>
        <b-row no-gutters>
          <b-col>
            <b-form-group :label="$t('perusteen-nimi') + '*'">
              <ep-input v-model="peruste.nimi"></ep-input>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row no-gutters>
          <b-col lg="6">
            <b-form-group :label="$t('diaarinumero')">
              <ep-input v-model="peruste.diaarinumero" type="string" ></ep-input>
            </b-form-group>
          </b-col>
          <b-col lg="6">
            <b-form-group :label="$t('maarayksen-paatospaivamaara')">
              <ep-datepicker v-model="peruste.paatospvm" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row no-gutters>
          <b-col lg="6">
            <b-form-group :label="$t('voimassaolo')">
              <div class="d-flex align-items-center">
                <ep-datepicker v-model="peruste.voimassaoloAlkaa" />
                  <div class="ml-2 mr-2">-</div>
                  <ep-datepicker v-model="peruste.voimassaoloLoppuu" />
              </div>
            </b-form-group>
          </b-col>
          <b-col lg="6">
            <b-form-group :label="$t('koulutustyyppi')">
              <ep-koulutustyyppi-select :value="peruste.koulutustyyppi" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row no-gutters>
          <b-col lg="6">
            <b-form-group :label="$t('perusteen-kielet')">
              <div class="text-nowrap">
                <span v-for="(kieli, idx) in peruste.kielet" :key="kieli" :value="kieli">
                  {{ $t(kieli) }}<span class="mr-0" v-if="idx < peruste.kielet.length - 1">,</span>
                </span>
              </div>
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>
    </div>

    <div v-if="julkaisuMahdollinen">
      <hr class="mt-4 mb-4">
      <h3>{{ $t('uusi-julkaisu') }}</h3>
      <b-form-group :label="$t('julkaisun-tiedote')">
        <div class="mt-2 mb-3">{{ $t('tiedotteen-nakyvyys') }}</div>
        <ep-content v-model="julkaisu.tiedote"
                    layout="full"
                    :is-editable="true" />
        <ep-button class="mt-3" @click="julkaise" :showSpinner="julkaistaan">
          {{ $t('julkaise') }}
        </ep-button>
      </b-form-group>
    </div>

    <div class="julkaisuhistoria">
      <ep-collapse tyyppi="julkaisut">
        <h3 slot="header">{{ $t('julkaisuhistoria') }}</h3>
        <div class="alert alert-info" v-if="julkaisut.length === 0">
          {{ $t('perusteella-ei-julkaisuja') }}
        </div>
        <div v-else>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>{{ $t('versio') }}</th>
                <th>{{ $t('luontihetki') }}</th>
                <th>{{ $t('tiedote') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(julkaisu, idx) in julkaisut" :key="idx">
                <td>{{ julkaisu.revision }}</td>
                <td>{{ $ago(julkaisu.luotu) }}</td>
                <td v-html="$kaanna(julkaisu.tiedote)"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </ep-collapse>
    </div>

  </div>
</template>

<script lang="ts">
import { Mixins, Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpTiedostoLataus from '@shared/components/EpTiedostoLataus/EpTiedostoLataus.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpVirhelistaus from '@/components/EpVirhelistaus/EpVirhelistaus.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpMuutosmaaraykset from '@/components/EpMuutosmaaraykset.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Api, Liitetiedostot, Koodisto, PerusteDtoTilaEnum } from '@shared/api/eperusteet';
import { SallitutKoulutustyyppisiirtymat, LokalisoituTekstiDto } from '@shared/tyypit';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { PerusteEditStore } from '@/stores/PerusteEditStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import PerustetyoryhmaSelect from './PerustetyoryhmaSelect.vue';
import EpKoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpValidation from '@shared/mixins/EpValidation';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import Vuelidate from 'vuelidate';

import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { UiKielet } from '@shared/stores/kieli';
import _ from 'lodash';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpDatepicker,
    EpEditointi,
    EpInput,
    EpKoodistoSelect,
    EpKoulutustyyppiSelect,
    EpMainView,
    EpMultiSelect,
    EpMuutosmaaraykset,
    EpSpinner,
    EpTiedostoLataus,
    EpToggle,
    EpVirhelistaus,
    PerustetyoryhmaSelect,
  },
})
export default class RouteJulkaise extends Mixins(PerusteprojektiRoute, EpValidation) {
  @Prop({ required: true })
  protected perusteStore!: PerusteStore;

  private julkaistaan = false;

  private julkaisu = {
    tiedote: {},
  };

  get peruste() {
    return this.perusteStore?.peruste?.value || null;
  }

  get julkaisuMahdollinen() {
    return this.peruste?.tila !== _.toLower(PerusteDtoTilaEnum.POISTETTU) && this.status?.vaihtoOk;
  }

  get julkaisut() {
    return this.perusteStore.julkaisut.value || [];
  }

  get status() {
    return this.perusteStore?.projektiStatus?.value || null;
  }

  protected async onProjektiChange() {
    this.perusteStore!.fetchJulkaisut();
  }

  async julkaise() {
    this.julkaistaan = true;
    try {
      await this.perusteStore!.julkaise({
        tiedote: this.julkaisu.tiedote,
      });
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
    this.julkaistaan = false;
  }
}

</script>

<style lang="scss" scoped>
.valiviiva {
  display: block;
  height: 1px;
  width: 10px;
  border-top: 1px solid black;
}

.liiteohje {
  color: #666;
  font-size: 0.7rem;
  padding: 8px 0 8px 0;
}

.lataaliite {
  font-size: 0.9rem;
  font-weight: 600;
}

.julkaisuhistoria {
  padding-top: 60px;
}

</style>
