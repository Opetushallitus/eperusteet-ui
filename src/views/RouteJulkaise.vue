<template>
  <div class="p-4">
    <div class="d-flex justify-content-between">
      <h2>{{ $t('julkaisunakyma') }}</h2>
    </div>

    <template v-if="!isPohja">
      <div>{{ $t('julkaisunakyma-kuvaus') }}</div>

      <div class="mt-4">
        <h3>{{ $t('julkaisu-vaikutukset') }}</h3>
        <ul>
          <li>{{ $t('julkaisusta-julkinen') }}</li>
          <li>{{ $t('julkaisusta-luodaan-pdf') }}</li>
          <li>{{ $t('julkaisusta-vanhat-versiot-sailyvat') }}</li>
          <li v-if="isAmmatillinen">{{ $t('tutkinnon-muodostumisessa-lisatyt-uudet-osaamisalat-ja-tutkintonimikkeet-viedaan-koodistoon') }}</li>
        </ul>
      </div>
    </template>

    <div>
      <h3>{{ $t('tarkistukset') }}</h3>
      <div class="validation">
        <div v-if="!validoinnit" class="validointi-spinner">
          <EpSpinner />
          <div>{{ $t('validointi-kaynnissa') }}</div>
        </div>
        <div v-else>
          <div v-if="isPerusteValid" class="d-flex">
            <EpMaterialIcon class="no-errors">check_circle</EpMaterialIcon>
            <div class="ml-2">{{$t('ei-julkaisua-estavia-virheita')}}</div>
          </div>
          <div v-else class="d-flex">
            <EpMaterialIcon class="errors">info</EpMaterialIcon>
            <div class="ml-2">{{$t('loytyi-julkaisun-estavia-virheita')}}</div>
          </div>

          <div v-for="(validointi, idx) in validoinnit" :key="'validointi'+idx">
            <ep-collapse v-if="validointi.virheet.length > 0 || validointi.huomautukset.length > 0"
                        :borderBottom="false">
              <h3 slot="header">{{ $t('validointi-kategoria-' + validointi.kategoria) }}</h3>
              <EpJulkaisuValidointi :validointi="validointi" />
            </ep-collapse>
          </div>
        </div>
      </div>
    </div>

    <div v-if="peruste && julkaisuMahdollinen && !isPohja">
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
          <b-col lg="6" v-if="peruste.koulutustyyppi">
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

    <template v-if="!isPohja">
      <div v-if="julkaisuMahdollinen">
        <hr class="mt-4">
        <h3 class="mt-4">{{ $t('uusi-julkaisu') }}</h3>

        <EpInfoBanner class="mb-3">
          {{$t('muista-lisata-julkaisun-kuvauksesta-myos-kieliversio')}}
        </EpInfoBanner>

        <EpJulkaisuMuutosmaarays
          v-if="isNormaali"
          class="mt-4"
          v-model="julkaisu"
          :muutosmaaraykset="muutosmaaraykset"/>

        <EpJulkaisuForm
          class="mt-4"
          is-latest
          :store="perusteStore"
          :julkaisu="julkaisu" />

        <b-form-group>
          <EpJulkaisuButton :julkaise="julkaise"
                            v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
                            :julkaisuKesken="julkaisuKesken"
                            :disabled="!julkaisuValid"/>
        </b-form-group>
      </div>

      <hr class="mt-4 mb-4">

      <EpJulkaisuHistoria :store="perusteStore"
                          :palauta="palautaJulkaisu">
        <template slot="katsele" slot-scope="{ julkaisu }">
          <ep-external-link v-if="julkaisu" :url="opintopolkuKatseluUrl(julkaisu)">
            {{$t('katsele')}}
          </ep-external-link>
        </template>
        <div slot="empty">{{ $t('perusteella-ei-julkaisuja') }}</div>
      </EpJulkaisuHistoria>
    </template>

  </div>
</template>

<script lang="ts">
import { Mixins, Prop, Component } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { PerusteDtoTilaEnum, NavigationNodeDto, Perusteprojektit, PerusteprojektiDtoTilaEnum, Julkaisut, Maintenance } from '@shared/api/eperusteet';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { PerusteStore } from '@/stores/PerusteStore';
import PerustetyoryhmaSelect from './PerustetyoryhmaSelect.vue';
import EpKoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpValidation from '@shared/mixins/EpValidation';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import _ from 'lodash';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpJulkaisuHistoria from '@/components/EpJulkaisu/EpJulkaisuHistoria.vue';
import EpJulkaisuButton from '@shared/components/EpJulkaisuButton/EpJulkaisuButton.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import { buildKatseluUrl } from '@shared/utils/esikatselu';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';
import { Kielet } from '@shared/stores/kieli';
import EpJulkaisuForm from '@/components/EpJulkaisu/EpJulkaisuForm.vue';
import EpJulkaisuMuutosmaarays from '@/components/EpJulkaisu/EpJulkaisuMuutosmaarays.vue';
import { nodeToRoute } from '@/utils/routing';
import { Location } from 'vue-router';
import EpJulkaisuValidointi from '@shared/components/EpJulkaisuValidointi/EpJulkaisuValidointi.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { Validations } from 'vuelidate-property-decorators';
import { requiredIf } from 'vuelidate/lib/validators';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';

@Component({
  components: {
    EpInfoPopover,
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
    EpSpinner,
    EpToggle,
    PerustetyoryhmaSelect,
    EpJulkaisuHistoria,
    EpJulkaisuButton,
    EpExternalLink,
    EpJulkaisuForm,
    EpJulkaisuValidointi,
    EpMaterialIcon,
    EpJulkaisuMuutosmaarays,
  },
})
export default class RouteJulkaise extends Mixins(PerusteprojektiRoute, EpValidation) {
  @Prop({ required: true })
  protected perusteStore!: PerusteStore;

  @Prop({ required: true })
  protected tiedotSivu!: Location;

  private julkaisu = {
    tiedote: {},
    julkinenTiedote: {},
    julkinen: true,
    muutosmaaraysVoimaan: null,
    liitteet: [],
    muutosmaarays: null,
    liittyyMuutosmaarays: false,
  };

  private hallintaLoading: boolean = false;

  async mounted() {
    this.validoi();
    await this.perusteStore.fetchMaaraykset();
  }

  get muutosmaaraykset() {
    if (this.perusteStore.muutosmaaraykset.value) {
      return this.perusteStore.muutosmaaraykset.value;
    }
  }

  get julkaisuMahdollinen() {
    return this.peruste?.tila !== _.toLower(PerusteDtoTilaEnum.POISTETTU) && this.isPerusteValid;
  }

  get valmiiksiMahdollinen() {
    return this.projekti?.tila === _.toLower(PerusteprojektiDtoTilaEnum.LAADINTA);
  }

  get julkaisut() {
    return this.perusteStore.julkaisut.value;
  }

  get validoinnit() {
    if (this.perusteStore.validoinnit.value) {
      return _.map(this.perusteStore.validoinnit.value, validointi => {
        return {
          ...validointi,
          virheet: this.listNodeToRoute(validointi.virheet),
          huomautukset: this.listNodeToRoute(validointi.huomautukset),
          huomiot: this.listNodeToRoute(validointi.huomiot),
        };
      });
    }
  }

  listNodeToRoute(list) {
    return _.map(list, item => ({ ...item, route: this.nodeToRoute(item.navigationNode) }));
  }

  get isPerusteValid() {
    if (this.validoinnit) {
      return _.every(this.validoinnit, validointi => _.isEmpty(validointi.virheet));
    }
  }

  protected async onProjektiChange() {
  }

  async validoi() {
    await this.perusteStore.updateValidointi();
  }

  async julkaise() {
    try {
      await this.perusteStore!.julkaise({
        tiedote: this.julkaisu.tiedote,
        julkinenTiedote: this.julkaisu.julkinenTiedote,
        julkinen: this.julkaisu.julkinen,
        muutosmaaraysVoimaan: this.julkaisu.muutosmaaraysVoimaan,
        liitteet: this.julkaisu.liitteet,
        muutosmaarays: this.julkaisu.liittyyMuutosmaarays ? this.julkaisu.muutosmaarays : null,
      });

      this.julkaisu.tiedote = {};
      this.julkaisu.julkinenTiedote = {};
      this.julkaisu.julkinen = true;
      this.julkaisu.muutosmaaraysVoimaan = null;
      this.julkaisu.liitteet = [];
      this.julkaisu.liittyyMuutosmaarays = false;
      this.$success(this.$t('julkaisu-kaynnistetty') as string);
    }
    catch (err) {
      this.$fail(this.$t('julkaisu-epaonnistui') as string);
    }
  }

  async palautaJulkaisu(julkaisu) {
    try {
      await this.perusteStore.palautaJulkaisu(julkaisu);
      this.$success(this.$t('perusteen-julkaisuversio-palautettu-julkiseksi') as string);
    }
    catch (err) {
      this.$fail(this.$t('palautus-epaonnistui') as string);
    }
  }

  get julkaisuValid() {
    return !this.$v.$invalid;
  }

  get julkaisuKesken() {
    return this.perusteStore?.viimeisinJulkaisuTila.value === 'KESKEN';
  }

  nodeToRoute(navigationNode: NavigationNodeDto | undefined): Location | null {
    if (!navigationNode) {
      return null;
    }

    switch (navigationNode.type) {
    case 'tiedot':
      return this.tiedotSivu;
    default:
      return nodeToRoute(navigationNode as any);
    }
  }

  opintopolkuKatseluUrl(julkaisu) {
    let revision = julkaisu.revision;
    if (revision === _.max(_.map(this.julkaisut, 'revision'))) {
      revision = null;
    }
    if (julkaisu.peruste && julkaisu.peruste.id) {
      return buildKatseluUrl(Kielet.getSisaltoKieli.value, `/${koulutustyyppiTheme(this.perusteStore.peruste.value!.koulutustyyppi!)}/${julkaisu.peruste.id}`, revision);
    }
    return '';
  }

  @Validations()
  validations = {
    julkaisu: {
      muutosmaarays: {
        required: requiredIf((value) => {
          return value && value.liittyyMuutosmaarays;
        }),
      },
    },
  };
}
</script>

<style lang="scss" scoped>
@import '@shared/styles/_variables';

.validation {
  border: 1px solid #ccc;
  box-shadow: 0 0 20px #eee;
  border-radius: 10px;
  margin-bottom: 10px;
  padding: 20px;
}

.validointi-spinner {
  text-align: center;
}

.no-errors {
  color: $green;
}

.errors {
  color: $invalid;
}

.validointi {
  text-align: center;
}

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

.julkaisu:nth-of-type(even) {
  background-color: $gray-lighten-13;
}

</style>
