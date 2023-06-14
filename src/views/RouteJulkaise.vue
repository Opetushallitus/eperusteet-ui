<template>
  <div class="p-4">
    <div class="d-flex justify-content-between">
      <h2>{{ $t('julkaisunakyma') }}</h2>
      <div class="d-flex flex-column" v-if="$isAdmin()">
        <EpSpinner v-if="hallintaLoading" />
        <b-dropdown v-else class="asetukset" size="lg" variant="link" dropleft toggle-class="text-decoration-none" no-caret>
          <template v-slot:button-content>
            {{$t('hallinta')}} <fas icon="ratas" class="hallinta" />
          </template>
          <EpButton variant="link" :disabled="!valmiiksiMahdollinen" @click="asetaValmiiksi">
            {{$t('aseta-peruste-valmiiksi')}}
          </EpButton>
          <EpButton variant="link" :disabled="valmiiksiMahdollinen" @click="avaaPeruste">
            {{$t('avaa-peruste')}}
          </EpButton>
          <EpButton variant="link" @click="kooditaPeruste">
            {{$t('koodita-peruste')}}
          </EpButton>
          <EpButton variant="link" @click="nollaaJulkaisuTila">
            {{$t('nollaa-julkaisu-tila')}}
          </EpButton>
          <EpButton variant="link" @click="pakotaJulkaisu">
            {{$t('pakota-julkaisu')}}
          </EpButton>
        </b-dropdown>
      </div>
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
        <div v-if="isValidating" class="validointi">
          <EpSpinner />
          <div>{{ $t('validointi-kaynnissa') }}</div>
        </div>
        <ep-virhelistaus v-if="status && !isValidating"
                         :validation="statusRoute" />
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
        <hr class="mt-4 mb-4">
        <h3 class="mb-4">{{ $t('uusi-julkaisu') }}</h3>
        <EpJulkaisuForm :is-editing="false"
                        :store="perusteStore"
                        :julkaisu="julkaisu"
                        @setInvalid="hasRequiredData">
        </EpJulkaisuForm>
        <b-form-group>
          <EpJulkaisuButton :julkaise="julkaise"
                            v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
                            :julkaisuKesken="julkaisuKesken"
                            :disabled="invalid"/>
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
import EpVirhelistaus from '@/components/EpVirhelistaus/EpVirhelistaus.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { PerusteDtoTilaEnum, NavigationNodeDto, Status, Perusteprojektit, PerusteprojektiDtoTilaEnum, Julkaisut, Maintenance } from '@shared/api/eperusteet';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { PerusteStore } from '@/stores/PerusteStore';
import PerustetyoryhmaSelect from './PerustetyoryhmaSelect.vue';
import EpKoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpValidation from '@shared/mixins/EpValidation';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import _ from 'lodash';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpJulkaisuHistoria from '@/components/EpJulkaisu/EpJulkaisuHistoria.vue';
import { Route } from 'vue-router';
import EpJulkaisuButton from '@shared/components/EpJulkaisuButton/EpJulkaisuButton.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import { buildKatseluUrl } from '@shared/utils/esikatselu';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';
import { Kielet } from '@shared/stores/kieli';
import EpJulkaisuForm from '@/components/EpJulkaisu/EpJulkaisuForm.vue';

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
    EpSpinner,
    EpToggle,
    EpVirhelistaus,
    PerustetyoryhmaSelect,
    EpJulkaisuHistoria,
    EpJulkaisuButton,
    EpExternalLink,
    EpJulkaisuForm,
  },
})
export default class RouteJulkaise extends Mixins(PerusteprojektiRoute, EpValidation) {
  @Prop({ required: true })
  protected perusteStore!: PerusteStore;

  @Prop({ required: true })
  protected tiedotSivu!: Route;

  private julkaisu = {
    tiedote: {},
    julkinenTiedote: {},
    julkinen: true,
    muutosmaaraysVoimaan: null,
    liitteet: [],
  };

  private hallintaLoading: boolean = false;
  private isValidating: boolean = false;
  private invalid: boolean = false;

  mounted() {
    this.validoi();
  }

  get julkaisuMahdollinen() {
    return this.peruste?.tila !== _.toLower(PerusteDtoTilaEnum.POISTETTU) && this.status?.vaihtoOk;
  }

  get valmiiksiMahdollinen() {
    return this.projekti?.tila === _.toLower(PerusteprojektiDtoTilaEnum.LAADINTA);
  }

  get julkaisut() {
    return this.perusteStore.julkaisut.value;
  }

  get status() {
    return this.perusteStore?.projektiStatus?.value || null;
  }

  protected async onProjektiChange() {
  }

  async validoi() {
    this.isValidating = true;
    await this.perusteStore.updateValidointi();
    this.isValidating = false;
  }

  async julkaise() {
    await this.perusteStore!.julkaise({
      tiedote: this.julkaisu.tiedote,
      julkinenTiedote: this.julkaisu.julkinenTiedote,
      julkinen: this.julkaisu.julkinen,
      muutosmaaraysVoimaan: this.julkaisu.muutosmaaraysVoimaan,
      liitteet: this.julkaisu.liitteet,
    });

    this.julkaisu.tiedote = {};
    this.julkaisu.julkinenTiedote = {};
    this.julkaisu.julkinen = true;
    this.julkaisu.muutosmaaraysVoimaan = null;
    this.julkaisu.liitteet = [];
    this.invalid = false;
    this.$success(this.$t('julkaisu-kaynnistetty') as string);
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

  hasRequiredData(value) {
    this.invalid = value;
  }

  get julkaisuKesken() {
    return this.perusteStore?.viimeisinJulkaisuTila.value === 'KESKEN';
  }

  get statusRoute() {
    if (this.status) {
      return {
        ...this.status,
        infot: _.map((this.status.infot as Status[]), info => {
          return {
            ...info,
            route: this.routeToNode(info.navigationNode),
          };
        }),
      };
    }
  }

  routeToNode(navigationNode: NavigationNodeDto | undefined): Route | null {
    if (!navigationNode) {
      return null;
    }

    switch (navigationNode.type) {
    case 'tiedot':
      return this.tiedotSivu;
    case 'muodostuminen':
      return {
        name: 'muodostuminen',
      } as any;
    default:
      return null;
    }
  }

  async asetaValmiiksi() {
    const asetaValmiiksi = await this.$bvModal.msgBoxConfirm(this.$t('peruste-valmis-varmistus') as any, {
      title: this.$t('aseta-peruste-valmiiksi') as any,
      okVariant: 'primary',
      okTitle: this.$t('aseta-valmiiksi') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
    });

    if (asetaValmiiksi) {
      try {
        this.hallintaLoading = true;
        await Perusteprojektit.updateProjektiTilaOnly(_.toNumber(this.$route.params.projektiId), 'valmis');
        await this.perusteStore.updateCurrent();
        this.$success(this.$t('tilan-vaihto-valmis-onnistui') as string);
      }
      catch (e) {
        this.$fail(this.$t('tilan-vaihto-valmis-epaonnistui') as string);
      }
      finally {
        this.hallintaLoading = false;
      }
    }
  }

  async avaaPeruste() {
    const avaa = await this.$bvModal.msgBoxConfirm(this.$t('peruste-avaus-varmistus') as any, {
      title: this.$t('avaa-peruste') as any,
      okVariant: 'primary',
      okTitle: this.$t('avaa') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
    });

    if (avaa) {
      try {
        this.hallintaLoading = true;
        await Perusteprojektit.avaaPerusteProjekti(_.toNumber(this.$route.params.projektiId));
        await this.perusteStore.updateCurrent();
        this.$success(this.$t('tilan-vaihto-onnistui') as string);
      }
      catch (e) {
        this.$fail(this.$t('tilan-vaihto-epaonnistui') as string);
      }
      finally {
        this.hallintaLoading = false;
      }
    }
  }

  async kooditaPeruste() {
    const avaa = await this.$bvModal.msgBoxConfirm(this.$t('peruste-kooditus-varmistus') as any, {
      title: this.$t('koodita-peruste') as any,
      okVariant: 'primary',
      okTitle: this.$t('koodita') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
    });

    if (avaa) {
      try {
        this.hallintaLoading = true;
        await Julkaisut.kooditaPeruste(_.toNumber(this.perusteId));
        await this.perusteStore.updateCurrent();
        this.$success(this.$t('kooditus-onnistui') as string);
      }
      catch (e) {
        this.$fail(this.$t('kooditus-epaonnistui') as string);
      }
      finally {
        this.hallintaLoading = false;
      }
    }
  }

  async nollaaJulkaisuTila() {
    const avaa = await this.$bvModal.msgBoxConfirm(this.$t('nollaa-julkaisu-tila-varmistus') as any, {
      title: this.$t('nollaa-julkaisu-tila') as any,
      okVariant: 'primary',
      okTitle: this.$t('ok') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
    });

    if (avaa) {
      try {
        this.hallintaLoading = true;
        await Julkaisut.nollaaJulkaisuTila(_.toNumber(this.perusteId));
        await this.perusteStore.fetchJulkaisut();
        this.$success(this.$t('nollaus-onnistui') as string);
      }
      catch (e) {
        this.$fail(this.$t('nollaus-epaonnistui') as string);
      }
      finally {
        this.hallintaLoading = false;
      }
    }
  }

  async pakotaJulkaisu() {
    const pakota = await this.$bvModal.msgBoxConfirm(this.$t('pakota-julkaisu-varmistus') as any, {
      title: this.$t('pakota-julkaisu') as any,
      okVariant: 'primary',
      okTitle: this.$t('ok') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
    });

    if (pakota) {
      try {
        this.hallintaLoading = true;
        await Maintenance.teeMaintenanceJulkaisu(_.toNumber(this.perusteId), this.$t('pakotettu-julkaisu-tiedote') as string);
        await this.perusteStore.fetchJulkaisut();
        this.$success(this.$t('julkaisu-pakotettu') as string);
      }
      catch (e) {
        this.$fail(this.$t('julkaisu-pakotettu-epaonnistui') as string);
      }
      finally {
        this.hallintaLoading = false;
      }
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
