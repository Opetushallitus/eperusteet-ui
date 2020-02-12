<template>
  <ep-main-view :tutoriaalistore="tutoriaalistore">
    <template slot="icon">
      <ep-icon class="float-right" icon="luo-uusi">
      </ep-icon>
    </template>
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t('tiedotteet') }}</h1>

        <ep-button icon="plussa" variant="outline" v-b-modal.tiedoteMuokkausModal @click="lisaaTiedote">
          {{ $t('lisaa-tiedote') }}
        </ep-button>

        <b-modal ref="tiedoteMuokkausModal"
           id="tiedoteMuokkausModal"
           size="lg">

          <template v-slot:modal-header>
            <div class="row w-100">
              <div class="col">
                <h2 v-if="!editing">{{$t('tiedote')}}</h2>
                <h2 v-else>{{ muokattavaTiedote.id ? $t('muokkaa-tiedotetta') : $t('lisaa-tiedote') }}</h2>
              </div>
              <div class="col text-right">
                <ep-kielivalinta />
              </div>
            </div>
          </template>

          <div v-if="editing">
            <ep-form-content name="tiedotteen-otsikko">
              <ep-input v-model="muokattavaTiedote.otsikko" :is-editing="editing" :validation="$v.muokattavaTiedote.otsikko"/>
            </ep-form-content>

            <ep-form-content name="tiedoteteksti">
              <ep-content v-model="muokattavaTiedote.sisalto" :is-editable="editing" layout="normal" :validation="$v.muokattavaTiedote.sisalto"> </ep-content>
            </ep-form-content>

            <ep-form-content name="valitse-missa-tiedote-julkaistaan">

              <ep-toggle class="pb-2" v-model="opintopolkuJulkaisuKoulutustyyppiTutkinto" :isSWitch="false" :is-editing="editing"> {{ $t('koulutustyyppi-tai-tutkintokohtainen-sivu')}} </ep-toggle>

              <ep-multi-list-select
                v-if="opintopolkuJulkaisuKoulutustyyppiTutkinto"
                class="pl-5 pb-2"
                tyyppi="koulutustyyppi-tai-tutkinto"
                :items="koulutustyyppiTaiTutkintoItems"
                v-model="koulutustyypitTaiTutkinnot"
                :is-editing="editing"
                :required="true"/>

              <ep-toggle class="pb-2 mt-3" v-model="opintopolkuJulkaisu" :isSWitch="false" :is-editing="editing"> {{ $t('tiedote-julkaisupaikka-opintopolku')}} </ep-toggle>
              <ep-toggle class="ml-5 pb-2" v-if="opintopolkuJulkaisu" v-model="opintopolkuJulkaisuEtusivu" :isSWitch="false" :is-editing="editing"> {{ $t('eperusteet-etusivu')}} </ep-toggle>

              <ep-toggle class="pb-2" v-model="opsJulkaisu" :isSWitch="false" :is-editing="editing"> {{ $t('tiedote-julkaisupaikka-ops')}} </ep-toggle>
              <ep-toggle class="pb-2" v-model="amosaaJulkaisu" :isSWitch="false" :is-editing="editing"> {{ $t('tiedote-julkaisupaikka-amosaa')}} </ep-toggle>

            </ep-form-content>

          </div>

          <div v-else>
            <div><h3>{{$kaanna(muokattavaTiedote.otsikko)}}</h3></div>
            <div class="tiedote-muokkaustieto">
              {{$sdt(muokattavaTiedote.muokattu)}}
              <span class="pl-3">{{muokkaavanKayttajanNimi}}</span>
            </div>

            <div class="mb-5 mt-4" v-html="$kaanna(muokattavaTiedote.sisalto)"></div>

            <h6>{{$t('tiedote-julkaistu')}}</h6>

            <ul>
              <li v-if="muokattavaTiedote.koulutustyypit && muokattavaTiedote.koulutustyypit.length > 0">
                {{$t('koulutustyypit')}}
                <ul>
                  <li v-for="(koulutustyyppi, index) in muokattavaTiedote.koulutustyypit" :key="index">
                    {{$t(koulutustyyppi)}}
                  </li>
                </ul>
              </li>
               <li v-if="muokattavaTiedote.perusteet && muokattavaTiedote.perusteet.length > 0">
                {{$t('perusteet')}}
                <ul>
                  <li v-for="(peruste, index) in muokattavaTiedote.perusteet" :key="index">
                    {{$kaanna(peruste.nimi)}}
                  </li>
                </ul>
              </li>
              <li v-for="(paikka, index) in muokattavaTiedote.filteredJulkaisupaikat" :key="index">
                {{$t('tiedote-julkaisupaikka-' + paikka)}}
                <ul v-if="paikka === 'opintopolku'">
                  <li v-if="muokattavaTiedote.opintopolkuEtusivu">{{ $t('eperusteet-etusivu')}}</li>
                </ul>

              </li>
            </ul>
          </div>

          <template v-slot:modal-footer>

            <div v-if="editing">
              <ep-button @click="suljeTiedote" variant="link">{{ $t('peruuta') }}</ep-button>
              <ep-button @click="tallennaTiedote" class="ml-3" :disabled="$v.$invalid">{{ muokattavaTiedote.id ? $t('tallenna') : $t('julkaise-tiedote') }}</ep-button>
            </div>

            <div v-else class="d-flex justify-content-between w-100">
              <div>
                <ep-button icon="kyna" variant="link" @click="editing = true">{{ $t('muokkaa') }}</ep-button>
                <ep-button icon="roskalaatikko" variant="link" @click="poista">{{ $t('poista') }}</ep-button>
              </div>

              <ep-button @click="suljeTiedote">{{ $t('sulje') }}</ep-button>
            </div>

          </template>

        </b-modal>

      </div>
    </template>

    <div class="row align-items-end mb-4">
      <div class="col-4">
        <ep-search v-model="nimiFilter" />
      </div>
      <div class="col-6">
        <ep-form-content name="tiedote-julkaistu" class="mb-0">
          <ep-multi-select :multiple="true"
            :is-editing="true"
            :options="julkaisupaikatItems"
            v-model="valitutJulkaisupaikat"
            :placeholder="$t('kaikki')"
            track-by="value"
            label="text">
          </ep-multi-select>
        </ep-form-content>
      </div>
    </div>

    <b-table responsive
      borderless
      striped
      fixed
      hover
      :items="tiedotteetFiltered"
      :fields="tableFields"
      :per-page="perPage"
      :current-page="currentPage"
      @row-clicked="muokkaa"/>

    <b-pagination
      v-model="currentPage"
      :total-rows="tiedotteetFiltered.length"
      :per-page="perPage"
      aria-controls="tiedotteet"
      align="center">
    </b-pagination>

  </ep-main-view>
</template>

<script lang="ts">
import { Prop, Vue, Component, Mixins, Watch } from 'vue-property-decorator'
import _ from 'lodash'

import EpButton from '@shared/components/EpButton/EpButton.vue'
import EpContent from '@shared/components/EpContent/EpContent.vue'
import EpIcon from '@shared/components/EpIcon/EpIcon.vue'
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue'
import EpMainView from '@shared/components/EpMainView/EpMainView.vue'
import EpSearch from '@shared/components/forms/EpSearch.vue'
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue'
import EpFormContent from '@shared/components/forms/EpFormContent.vue'
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue'
import EpInput from '@shared/components/forms/EpInput.vue'
import EpField from '@shared/components/forms/EpField.vue'
import EpMultiListSelect from '@shared/components/forms/EpMultiListSelect.vue'
import EpSelect from '@shared/components/forms/EpSelect.vue'
import EpToggle from '@shared/components/forms/EpToggle.vue'

import { themes, ktToState } from '@shared/utils/perusteet'
import { TutoriaaliStore } from '@shared/stores/tutoriaali'
import { Perusteet, Kayttajat, PageTiedoteDto, TiedoteDto, PerusteHakuDto, PerusteKevytDto } from '@shared/api/eperusteet'
import { Kielet } from '@shared/stores/kieli'
import { success, fail } from '@/utils/notifications'
import { TiedotteetStore } from '@/stores/tiedotteet'
import { required } from 'vuelidate/lib/validators'
import { validationMixin } from 'vuelidate'
import { parsiEsitysnimi } from '@/stores/kayttaja'

interface KoulutustyyppiTaiTutkinto {
  type: string,
  object: any,
}

const julkaisupaikkaSort = {
  'opintopolku': 1,
  'ops': 2,
  'amosaa': 3
}

@Component({
  components: {
    EpIcon,
    EpButton,
    EpContent,
    EpMainView,
    EpSearch,
    EpSpinner,
    EpFormContent,
    EpMultiSelect,
    EpInput,
    EpField,
    EpMultiListSelect,
    EpSelect,
    EpToggle,
    EpKielivalinta
  },
  validations: {
    muokattavaTiedote: {
      otsikko: {
        required
      },
      sisalto: {
        required
      }
    }
  }
} as any)
export default class RouteTiedotteet extends Mixins(validationMixin) {
  @Prop({ required: true })
  private tiedotteetStore!: TiedotteetStore;

  @Prop({ required: true })
  private tutoriaalistore!: TutoriaaliStore;

  private currentPage = 1;
  private perPage = 10;
  private totalRows = 0;
  private nimiFilter = ''
  private koulutustyypitTaiTutkinnot: KoulutustyyppiTaiTutkinto[] = [];
  private valitutJulkaisupaikat: [] = [];
  private editing: boolean = false;
  private perusteet: PerusteHakuDto[] = [];

  private muokattavaTiedote: TiedoteDto = {};
  private muokkaavanKayttajanNimi = '';

  private opintopolkuJulkaisu: boolean = false;
  private opintopolkuJulkaisuEtusivu: boolean = false;
  private opintopolkuJulkaisuKoulutustyyppiTutkinto: boolean = false;
  private opsJulkaisu: boolean = false;
  private amosaaJulkaisu: boolean = false;

  async init () {
    await this.tiedotteetStore.fetch()
    const res = (await Perusteet.getAllPerusteet() as any).data
    this.perusteet = res.data
  }

  get tiedotteetFiltered () {
    return _.chain(this.tiedotteetStore.tiedotteet.value)
      .filter(tiedote => !this.nimiFilter || (!_.isEmpty(tiedote.otsikko) && Kielet.search(this.nimiFilter, tiedote.otsikko)))
      .filter(tiedote => _.isEmpty(this.valitutJulkaisuPaikatValues) || _.some(this.valitutJulkaisuPaikatValues, (filter) => _.includes(tiedote.julkaisupaikat, filter)))
      .map(tiedote => {
        return {
          ...tiedote,
          filteredJulkaisupaikat: _.chain(tiedote.julkaisupaikat)
            .filter((julkaisupaikka) => (julkaisupaikka as any) !== 'opintopolku_etusivu')
            .sortBy((julkaisupaikka) => julkaisupaikkaSort[julkaisupaikka])
            .value(),
          opintopolkuEtusivu: _.includes((tiedote.julkaisupaikat as any), 'opintopolku_etusivu')
        }
      })
      .value()
  }

  get valitutJulkaisuPaikatValues () {
    return _.map(this.valitutJulkaisupaikat, 'value')
  }

  get julkaisupaikatItems () {
    return [
      { text: this.$t('tiedote-julkaisupaikka-opintopolku'), value: 'opintopolku' },
      { text: this.$t('tiedote-julkaisupaikka-ops'), value: 'ops' },
      { text: this.$t('tiedote-julkaisupaikka-amosaa'), value: 'amosaa' }
    ]
  }

  @Watch('opintopolkuJulkaisu')
  async onValueChanged (newVal: any) {
    if (!newVal) {
      this.opintopolkuJulkaisuEtusivu = false
    }
  }

  get tableFields () {
    return [{
      key: 'luotu',
      label: this.$t('julkaistu'),
      sortable: true,
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$sdt(value)
      }
    }, {
      key: 'muokattu',
      label: this.$t('muokattu'),
      sortable: true,
      formatter: (value: any, key: any, item: any) => {
        if (item.luotu !== item.muokattu) {
          return (this as any).$sdt(value)
        }

        return ''
      }
    }, {
      key: 'otsikko',
      label: this.$t('tiedotteen-otsikko'),
      sortable: true,
      sortByFormatted: true,
      thStyle: { width: '35%' },
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$kaanna(value)
      }
    }, {
      key: 'filteredJulkaisupaikat',
      label: this.$t('tiedote-julkaistu'),
      sortable: true,
      thStyle: { width: '35%' },
      sortByFormatted: true,
      formatter: (value: any, key: any, item: any) => {
        return _.join(_.map(value, (julkaisupaikka) => this.$t(julkaisupaikka)), ', ')
      }
    }]
  }

  get koulutustyyppiTaiTutkintoItems () {
    return [
      ..._.chain(_.keys(ktToState))
        .map((koulutustyyppi) => {
          return [
            {
              text: this.$t(koulutustyyppi),
              value: {
                type: 'koulutustyyppi',
                object: koulutustyyppi
              }
            },
            ..._.chain(this.perusteet)
              .filter((peruste) => peruste.koulutustyyppi === koulutustyyppi)
              .map(peruste => {
                return {
                  text: (this as any).$kaanna(peruste.nimi),
                  value: {
                    type: 'peruste',
                    object: peruste.id
                  },
                  child: true
                }
              })
              .value()
          ]
        })
        .flatten()
        .value()
    ]
  }

  async tallennaTiedote () {
    this.muokattavaTiedote.julkaisupaikat = _.chain(['opintopolku', 'opintopolku_etusivu', 'ops', 'amosaa'])
      .filter(value => value !== 'opintopolku' || this.opintopolkuJulkaisu)
      .filter(value => value !== 'opintopolku_etusivu' || this.opintopolkuJulkaisuEtusivu)
      .filter(value => value !== 'ops' || this.opsJulkaisu)
      .filter(value => value !== 'amosaa' || this.amosaaJulkaisu)
      .value() as any

    this.muokattavaTiedote.koulutustyypit = _.map(_.filter(this.koulutustyypitTaiTutkinnot, (ktt) => ktt.type === 'koulutustyyppi'), 'object')
    const perusteetIdlla = _.keyBy(this.perusteet, 'id')
    this.muokattavaTiedote.perusteet = _.map(_.filter(this.koulutustyypitTaiTutkinnot, (ktt) => ktt.type === 'peruste'), (koulutustyyppitutkinto) => this.perusteHakuToInfo(perusteetIdlla[koulutustyyppitutkinto.object]))

    if (!(this.opintopolkuJulkaisuKoulutustyyppiTutkinto && !_.isEmpty(this.muokattavaTiedote.koulutustyypit))) {
      this.muokattavaTiedote.koulutustyypit = []
      this.muokattavaTiedote.perusteet = []
    }

    await this.tiedotteetStore.save(this.muokattavaTiedote)

    this.suljeTiedote()
    success('tiedote-tallennettu')
  }

  private perusteHakuToInfo (perusteHaku: PerusteHakuDto): PerusteKevytDto {
    return {
      id: perusteHaku.id
    } as PerusteKevytDto
  }

  suljeTiedote () {
    this.editing = false;
    (this as any).$refs.tiedoteMuokkausModal.hide()
  }

  aloitaMuokkaus () {
    this.editing = true
  }

  lisaaTiedote () {
    this.muokkaa({})
    this.aloitaMuokkaus()
  }

  async muokkaa (rivi: any) {
    this.muokattavaTiedote = _.cloneDeep(rivi)
    this.opintopolkuJulkaisu = _.includes(rivi.julkaisupaikat, 'opintopolku')
    this.opsJulkaisu = _.includes(rivi.julkaisupaikat, 'ops')
    this.amosaaJulkaisu = _.includes(rivi.julkaisupaikat, 'amosaa')
    this.opintopolkuJulkaisuEtusivu = _.includes(rivi.julkaisupaikat, 'opintopolku_etusivu')
    this.opintopolkuJulkaisuKoulutustyyppiTutkinto = !_.isEmpty(rivi.koulutustyypit)

    this.koulutustyypitTaiTutkinnot = [
      ..._.map(rivi.koulutustyypit, (koulutustyyppi) => {
        return {
          type: 'koulutustyyppi',
          object: koulutustyyppi
        }
      }),
      ..._.map(rivi.perusteet, (peruste) => {
        return {
          type: 'peruste',
          object: peruste.id
        }
      })
    ]

    if (this.muokattavaTiedote.luotu) {
      const kayttaja = (await Kayttajat.getKayttaja((this.muokattavaTiedote.muokkaaja as any))).data
      if (kayttaja) {
        this.muokkaavanKayttajanNimi = parsiEsitysnimi(kayttaja)
      } else {
        this.muokkaavanKayttajanNimi = (this.muokattavaTiedote.muokkaaja as any)
      }
    }

    (this as any).$refs.tiedoteMuokkausModal.show()
  }

  async poista () {
    this.suljeTiedote()

    if (await this.vahvistaPoisto()) {
      await this.tiedotteetStore.delete(this.muokattavaTiedote)
      success('tiedote-poistettu')
    }
  }

  public async vahvistaPoisto () {
    const vahvistusSisalto = this.$createElement('div', {},
      [
        this.$createElement('div', this.$t('poista-tiedote-vahvistus') as string),
        this.$createElement('div', '"' + (this as any).$kaanna(this.muokattavaTiedote.otsikko) + '"'),
        this.$createElement('br', ''),
        this.$createElement('div', this.$t('poista-tiedote-varmistus') as string)
      ]
    ).children

    return this.$bvModal.msgBoxConfirm((vahvistusSisalto as any), {
      title: this.$t('poista-tiedote-kysymys'),
      okVariant: 'primary',
      okTitle: this.$t('poista') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
      ...{} as any
    })
  }
}
</script>

<style scoped lang="scss">

  .tiedote-muokkaustieto {
    font-size: 0.8rem;
  }

</style>
