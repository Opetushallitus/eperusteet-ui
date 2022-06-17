<template>
  <div class="p-4">
     <div class="d-flex justify-content-between">
      <h2>{{ $t('julkaisunakyma') }}</h2>
      <EpButton v-if="$isAdmin() && valmiiksiMahdollinen" @click="asetaValmiiksi">
        {{$t('aseta-peruste-valmiiksi')}}
      </EpButton>
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
      <ep-virhelistaus v-if="status"
                       :validation="statusRoute" />
      <EpSpinner v-else />
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

    <template v-if="!isPohja">
      <div v-if="julkaisuMahdollinen">
        <hr class="mt-4 mb-4">

        <h3>{{ $t('uusi-julkaisu') }}</h3>

        <b-form-group :label="$t('julkaisutiedot')" class="mt-4">
          <div class="mb-3">{{ $t('teksti-naytetaan-taman-sivun-julkaisuhistoriassa') }}</div>
          <ep-content v-model="julkaisu.tiedote"
                      layout="simplified"
                      :is-editable="true" />
          <EpJulkaisuButton class="mt-3" :julkaise="julkaise" v-oikeustarkastelu="{ oikeus: 'muokkaus' }"/>
        </b-form-group>
      </div>

      <EpJulkaisuHistoria :julkaisut="julkaisut" :palauta="palautaJulkaisu">
        <div slot="empty">{{ $t('perusteella-ei-julkaisuja') }}</div>
      </EpJulkaisuHistoria>
    </template>

  </div>
</template>

<script lang="ts">
import { Mixins, Watch, Prop, Component, Vue } from 'vue-property-decorator';
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
import { PerusteDtoTilaEnum, NavigationNodeDto, Status, Perusteprojektit, PerusteprojektiDtoTilaEnum } from '@shared/api/eperusteet';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { PerusteStore } from '@/stores/PerusteStore';
import PerustetyoryhmaSelect from './PerustetyoryhmaSelect.vue';
import EpKoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpValidation from '@shared/mixins/EpValidation';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import _ from 'lodash';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';
import EpJulkaisuHistoria from '@shared/components/EpJulkaisuHistoria/EpJulkaisuHistoria.vue';
import { Route } from 'vue-router';
import EpJulkaisuButton from '@shared/components/EpJulkaisuButton/EpJulkaisuButton.vue';

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
    EpToggle,
    EpVirhelistaus,
    PerustetyoryhmaSelect,
    EpJulkaisuHistoria,
    EpJulkaisuButton,
  },
})
export default class RouteJulkaise extends Mixins(PerusteprojektiRoute, EpValidation) {
  @Prop({ required: true })
  protected perusteStore!: PerusteStore;

  @Prop({ required: true })
  protected tiedotSivu!: Route;

  private julkaisu = {
    tiedote: {},
  };

  get julkaisuMahdollinen() {
    return this.peruste?.tila !== _.toLower(PerusteDtoTilaEnum.POISTETTU) && this.status?.vaihtoOk;
  }

  get valmiiksiMahdollinen() {
    return this.projekti?.tila === _.toLower(PerusteprojektiDtoTilaEnum.LAADINTA);
  }

  get julkaisut() {
    return this.perusteStore.julkaisut.value || [];
  }

  get julkaisutMapped() {
    return _.chain(this.julkaisut)
      .map(julkaisu => {
        return {
          ...julkaisu,
          nimi: parsiEsitysnimi(julkaisu.kayttajanTieto),
          fixedRevision: '1.' + julkaisu.revision,
        };
      })
      .sortBy('luotu')
      .reverse()
      .value();
  }

  get status() {
    return this.perusteStore?.projektiStatus?.value || null;
  }

  protected async onProjektiChange() {
    this.perusteStore!.fetchJulkaisut();
  }

  async julkaise() {
    try {
      await this.perusteStore!.julkaise({
        tiedote: this.julkaisu.tiedote,
      });

      this.julkaisu.tiedote = {};
      this.$success(this.$t('julkaistu') as string);
    }
    catch (err) {
      this.$fail(this.$t('julkaisu-epaonnistui-peruste-' + err.response?.data?.syy) as string);
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
        await Perusteprojektit.updateProjektiTilaOnly(_.toNumber(this.$route.params.projektiId), 'valmis');
        await this.perusteStore.updateCurrent();
        this.$success(this.$t('tilan-vaihto-valmis-onnistui') as string);
      }
      catch (e) {
        this.$fail(this.$t('tilan-vaihto-valmis-epaonnistui') as string);
      }
    }
  }
}

</script>

<style lang="scss" scoped>
@import '@shared/styles/_variables';

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

.julkaisu:nth-of-type(even) {
  background-color: $gray-lighten-13;
}

</style>
