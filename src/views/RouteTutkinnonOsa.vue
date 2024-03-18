<template>
  <div>
    <div v-if="store">
      <EpEditointi :store="store" :versionumero="versionumero" :labelCopyConfirm="'kopioidaanko-tutkinnonosa'" :labelRemove="'poista-tutkinnonosa'">
      <template v-slot:header="{ data }">
        <h2 class="m-0" style="white-space: pre">
          <span v-if="data.tutkinnonOsa.nimi">{{$kaanna(data.tutkinnonOsa.nimi)}}</span>
          <span v-else> {{$t('nimeton-tutkinnonosa')}}</span>
          <span v-if="data.laajuus">, {{ data.laajuus }} {{ $t('OSAAMISPISTE') }}</span>
        </h2>
      </template>

      <template v-slot:kopioi="{ data, supportData }">
        <EpTutkinnonOsaKaytossaModal
          v-if="supportData.projektitJoissaKaytossa.length > 1"
          :alkuperainenPeruste="data.tutkinnonOsa.alkuperainenPeruste"
          :projektit="supportData.projektitJoissaKaytossa"
          :kopioi="kopioiTutkinnonoOsa"
          :muokkaa="muokkaaTutkinnonOsaa"/>
      </template>

      <template v-slot:default="{ data, isEditing, validation }">
        <div class="mt-1" v-if="isEditing && isNew">
          <ep-error-wrapper>
            <b-form-group :label="$t('tyyppi')">
              <b-form-radio v-model="data.tutkinnonOsa.tyyppi" name="tyyppi" value="normaali">
                {{ $t('ammatillinen-tutkinnon-osa') }}
              </b-form-radio>
              <b-form-radio v-model="data.tutkinnonOsa.tyyppi" name="tyyppi" value="reformi_tutke2">
                {{ $t('yhteinen-tutkinnon-osa') }}
              </b-form-radio>
            </b-form-group>
          </ep-error-wrapper>
        </div>

        <b-row class="mb-4">
          <b-col md="8">
            <b-form-group :label="$t('tutkinnon-osan-nimi')">
              <ep-koodisto-select v-if="isEditing || !nimi"
                :store="tutkinnonosaKoodisto"
                v-model="data.tutkinnonOsa.koodi"
                :is-editing="isEditing"
                :naytaArvo="false"
                :additionalFields="tutkinnonosaKoodistoKaytossaField"
                @add="tutkinnonOsaNimiKoodiLisays">
                <template #default="{ open }">
                  <div class="d-flex">
                    <b-input-group>
                      <b-form-input v-model="nimi" :disabled="data.tutkinnonOsa.koodi !== null || koodiTallennus"></b-form-input>
                      <b-input-group-append>
                        <b-button @click="open" variant="primary">
                          {{ $t('hae-koodistosta') }}
                        </b-button>
                      </b-input-group-append>
                    </b-input-group>

                    <ep-button v-if="data.tutkinnonOsa.koodi" icon="delete" variant="link" @click="tyhjennaTutkinnonosaKoodi"/>
                    <ep-button variant="link" v-if="!data.tutkinnonOsa.koodi" @click="lisaaTutkinnonosaNimiKoodistoon" :disabled="!hasNimi">
                      {{$t('vie-koodistoon')}}
                    </ep-button>
                    <ep-spinner v-if="koodiTallennus" />
                  </div>
                </template>
              </ep-koodisto-select>
              <div v-else>
                {{nimi}}
              </div>
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group :label="$t('laajuus')">
              <ep-laajuus-input v-model="data.laajuus" :is-editing="isEditing" :validation="validation.laajuus" />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row class="mb-4">
          <b-col>
            <b-form-group :label="$t('koodi')">
              <div v-if="data.tutkinnonOsa.koodi">{{data.tutkinnonOsa.koodi.arvo}}</div>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-form-group :label="$t('kuvaus')">
              <ep-content v-model="data.tutkinnonOsa.kuvaus"
                          :validation="validation.tutkinnonOsa.kuvaus"
                          layout="normal"
                          :is-editable="isEditing"></ep-content>
            </b-form-group>
          </b-col>
        </b-row>

        <div v-if="data.tutkinnonOsa.tyyppi === 'normaali'">
          <ep-collapse tyyppi="ammattitaitovaatimukset" :border-bottom="false" :border-top="isEditing">
            <h3 slot="header">{{ $t('ammattitaitovaatimukset') }}</h3>
            <b-form-group>
              <ep-content v-if="data.tutkinnonOsa.ammattitaitovaatimukset"
                          v-model="data.tutkinnonOsa.ammattitaitovaatimukset"
                          layout="normal"
                          :is-editable="isEditing"
                          class="mb-4"></ep-content>

              <EpAmmattitaitovaatimukset v-model="data.tutkinnonOsa.ammattitaitovaatimukset2019"
                                         :validation="validation.tutkinnonOsa.ammattitaitovaatimukset2019"
                                         :is-editing="isEditing" />
            </b-form-group>
          </ep-collapse>

          <ep-collapse tyyppi="osaamisen-arviointi" :border-bottom="false" :border-top="true">
            <h3 slot="header">{{ $t('osaamisen-arviointi') }}</h3>

            <EpButton v-if="isEditing && !valittuArviointiTyyppi"
                      variant="outline"
                      icon="add"
                      @click="arvioinninTyyppi = 'geneerinen'">
              {{$t('lisaa-geneerinen-arviointi')}}
            </EpButton>

            <div class="mb-4" v-if="valittuArviointiTyyppi === 'geneerinen'">
              <div class="font-weight-600">{{$t('geneerinen-arviointi')}}</div>
              <b-form-group v-if="isEditing">
                <b-form-radio
                  class="ml-1"
                  v-for="geneerinen in geneeriset"
                  v-model="data.tutkinnonOsa._geneerinenArviointiasteikko"
                  name="geneerinen"
                  :value="'' + geneerinen.id"
                  :key="'geneerinen-' + geneerinen.id">
                  {{ $kaanna(geneerinen.nimi) }}
                </b-form-radio>
              </b-form-group>
              <b-form-group v-else-if="valittuGeneerinen">
                <div class="mt-3 mb-4">
                  <div class="font-weight-bold">{{ $t('arvioinnin-kohde') }}</div>
                  <div>{{ $kaanna(valittuGeneerinen.kohde) }}</div>
                </div>

                <div v-if="kriteeritonGeneerinenValittu">
                  {{ $kaanna(valittuGeneerinen.osaamistasot[0].otsikko)}}
                </div>

                <table v-else class="table table-striped">
                  <thead>
                    <tr>
                      <th width="20%">{{ $t('osaamistaso') }}</th>
                      <th>{{ $t('kriteerit') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(ot, idx) in valittuGeneerinen.osaamistasot" :key="'ot-' + idx">
                      <td>{{ $kaanna(ot.otsikko) }}</td>
                      <td>
                        <ul class="pl-4">
                          <li v-for="(kriteeri, idx) in ot.kriteerit" :key="idx">
                            {{ $kaanna(kriteeri) }}
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </b-form-group>

              <EpButton v-if="isEditing"
                        class="no-padding"
                        variant="link"
                        icon="delete"
                        @click="poistaGeneerinenaArviointi">
                {{$t('poista-geneerinen-arviointi')}}
              </EpButton>
            </div>

            <div v-if="valittuArviointiTyyppi !== 'geneerinen'">
              <EpArvioinninKohdeAlueet
                v-model="data.tutkinnonOsa.arviointi.arvioinninKohdealueet"
                :isEditing="isEditing"
                :arviointiasteikot="arviointiasteikot"
              />
            </div>

            <EpAlert :text="$t('arviointia-ei-asetettu')" v-if="!isEditing && !data.tutkinnonOsa.arviointi && !valittuGeneerinen" />
          </ep-collapse>

          <ep-collapse tyyppi="ammattitaidon-osoittamistavat" :border-bottom="false" :border-top="true">
            <h3 slot="header">{{ $t('ammattitaidonOsoittamistavat') }}</h3>
            <b-form-group>
              <ep-content v-model="data.tutkinnonOsa.ammattitaidonOsoittamistavat"
                          :validation="validation.tutkinnonOsa.ammattitaidonOsoittamistavat"
                          layout="normal"
                          :is-editable="isEditing"></ep-content>
            </b-form-group>
          </ep-collapse>

          <ep-collapse :border-bottom="false" :border-top="true" v-if="data.tutkinnonOsa.tavoitteet">
            <h3 slot="header">{{ $t('tavoitteet') }}</h3>
            <b-form-group>
              <ep-content v-model="data.tutkinnonOsa.tavoitteet"
                          layout="normal"
                          :is-editable="isEditing"></ep-content>
            </b-form-group>
          </ep-collapse>

          <ep-collapse :border-bottom="false" :border-top="true" v-if="data.tutkinnonOsa.arviointi && data.tutkinnonOsa.arviointi.lisatiedot">
            <h3 slot="header">{{ $t('arviointi') }}</h3>
            <b-form-group>
              <ep-content v-model="data.tutkinnonOsa.arviointi.lisatiedot"
                          layout="normal"
                          :is-editable="isEditing"></ep-content>
            </b-form-group>
          </ep-collapse>

        </div>
        <div v-else>
          <ep-collapse tyyppi="osa-alueet" :border-bottom="false" :border-top="true">
            <h3 slot="header">{{ $t('osa-alueet') }}</h3>
            <div>
              <EpBalloonList v-if="data.tutkinnonOsa.osaAlueet" v-model="data.tutkinnonOsa.osaAlueet" :isEditing="isEditing" sortable>
                <template v-slot:default="{ item }">
                  <router-link :to="{ name: 'osaalue', params: { osaalueId: item.id } }">{{ $kaanna(item.nimi) || $t('nimeton') }}</router-link>
                  <span v-if="item.koodi" class="ml-1">({{ item.koodi.arvo }})</span>
                </template>
              </EpBalloonList>
            </div>
            <ep-button @click="lisaaOsaAlue(data.tutkinonOsa)" variant="outline" icon="add" v-if="!isEditing && tutkinnonOsaEditable">
              {{ $t('lisaa-osa-alue') }}
            </ep-button>
          </ep-collapse>
        </div>
      </template>
      </EpEditointi>
    </div>
    <EpSpinner v-else />
  </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpErrorWrapper from '@shared/components/forms/EpErrorWrapper.vue';
import EpAmmattitaitovaatimukset from '@shared/components/EpAmmattitaitovaatimukset/EpAmmattitaitovaatimukset.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpBalloonList from '@shared/components/EpBalloonList/EpBalloonList.vue';
import { YhdistettyGeneerinen } from '@/components/EpGeneerinenAsteikko/EpGeneerinenAsteikko.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { TutkinnonOsaEditStore } from '@/stores/TutkinnonOsaEditStore';
import { ArviointiStore } from '@/stores/ArviointiStore';
import _ from 'lodash';
import { Murupolku } from '@shared/stores/murupolku';
import { Koodisto, TutkinnonosatPrivate } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { Kielet } from '@shared/stores/kieli';
import EpTutkinnonOsaKaytossaModal from '@/components/EpTutkinnonOsaKaytossaModal.vue';
import EpArvioinninKohdeAlueet from '@/views/tutkinnonosat/EpArvioinninKohdeAlueet.vue';

@Component({
  components: {
    EpAlert,
    EpAmmattitaitovaatimukset,
    EpBalloonList,
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpErrorWrapper,
    EpInput,
    EpLaajuusInput,
    EpSpinner,
    EpKoodistoSelect,
    EpTutkinnonOsaKaytossaModal,
    EpArvioinninKohdeAlueet,
  },
})
export default class RouteTutkinnonosa extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  arviointiStore!: ArviointiStore;

  private store: EditointiStore | null = null;
  private koodiTallennus = false;
  private arvioinninTyyppi: 'geneerinen' | 'tutkinnonosa-kohtainen' | null = null;

  private readonly tutkinnonosaKoodisto = new KoodistoSelectStore({
    koodisto: 'tutkinnonosat',
    async query(query: string, sivu = 0, koodisto: string) {
      const koodit = (await Koodisto.kaikkiSivutettuna(koodisto, query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;

      const kaytetyt = (await TutkinnonosatPrivate.getTutkinnonOsaByKoodit(_.map(koodit.data, 'koodiUri'))).data;

      return {
        ...koodit,
        data: _.map(koodit.data, koodi => {
          return {
            ...koodi,
            kaytossa: kaytetyt[koodi.koodiUri],
          };
        }),
      };
    },
  });

  get tutkinnonOsaEditable() {
    return this.store?.features.value?.editable;
  }

  get tutkinnonosaKoodistoKaytossaField() {
    return [{
      key: 'kaytossa',
      label: this.$t('kaytossa'),
      thStyle: { width: '10rem' },
      formatter: (value, key, item) => {
        if (value) {
          return this.$t('kylla');
        }

        return '';
      },
    }];
  }

  get isNew() {
    return this.tutkinnonOsaId === 'uusi';
  }

  get tov() {
    if (!this.store) {
      return null;
    }
    return this.store.data.value;
  }

  @Watch('tov')
  onDataChange(tov) {
    if (tov && tov.tutkinnonOsa) {
      Murupolku.aseta('tutkinnonosa', this.$kaanna(tov.tutkinnonOsa.nimi), {
        name: 'tutkinnonosa',
      });
    }
  }

  get tutkinnonOsaId() {
    return this.$route.params.tutkinnonOsaId;
  }

  get arviointiasteikot() {
    return this.arviointiStore.arviointiasteikot.value;
  }

  get arviointiasteikotKeyById() {
    return _.keyBy(_.map(this.arviointiasteikot, arviointiasteikko => {
      return {
        ...arviointiasteikko,
        osaamistasot: _.keyBy(arviointiasteikko.osaamistasot, 'id'),
      };
    }), 'id');
  }

  get kaikkiGeneeriset() {
    return this.arviointiStore.geneeriset.value;
  }

  get valittuGeneerinen(): YhdistettyGeneerinen | null {
    if (!this.tov || !this.tov.tutkinnonOsa?._geneerinenArviointiasteikko) {
      return null;
    }

    const geneerinen = _.first(_.filter(this.kaikkiGeneeriset,
      g => g.id === Number(this.tov!.tutkinnonOsa._geneerinenArviointiasteikko)));

    if (!geneerinen) {
      return null;
    }

    const asteikko = _.first(_.filter(this.arviointiasteikot,
      g => g.id === Number((geneerinen as any)._arviointiAsteikko)));

    if (!asteikko) {
      return null;
    }

    const kriteeriMap = _.keyBy(geneerinen.osaamistasonKriteerit, '_osaamistaso');

    return {
      nimi: geneerinen.nimi as any,
      kohde: geneerinen.kohde as any,
      osaamistasot: _.map(_.reverse(asteikko?.osaamistasot || []), (ot: any) => {
        return {
          otsikko: ot.otsikko as any,
          kriteerit: kriteeriMap[ot.id!]!.kriteerit!,
        };
      }),
    };
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get geneeriset() {
    return _.filter(this.arviointiStore.geneeriset.value, 'julkaistu');
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  @Watch('versionumero', { immediate: true })
  async versionumeroChange() {
    await this.fetch();
  }

  @Watch('tutkinnonOsaId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === _.toString(oldId)) {
      return;
    }
    await this.arviointiStore.fetchArviointiasteikot();
    await this.arviointiStore.fetchGeneeriset();
    await this.fetch();
  }

  async fetch() {
    await this.perusteStore.blockUntilInitialized();
    const store = new TutkinnonOsaEditStore(this.perusteId!, !this.isNew ? this.tutkinnonOsaId : undefined, this, this.versionumero);
    this.store = new EditointiStore(store);
  }

  async lisaaOsaAlue(tutkinnonOsa) {
    this.$router.push({
      name: 'osaalue',
      params: {
        osaalueId: 'uusi',
      },
      query: {
        tutkinnonOsaId: this.tutkinnonOsaId,
      },
    });
  }

  get hasNimi() {
    return !_.isEmpty(_.get(this.store?.data.value.tutkinnonOsa.nimi, Kielet.getSisaltoKieli.value));
  }

  set nimi(value) {
    this.store?.setData({
      ...this.store?.data.value,
      tutkinnonOsa: {
        ...this.store?.data.value.tutkinnonOsa,
        nimi: {
          ...this.store?.data.value.tutkinnonOsa.nimi,
          [Kielet.getSisaltoKieli.value]: value,
        },
      },
    });
  }

  get nimi() {
    return _.get(this.store?.data.value.tutkinnonOsa.nimi, Kielet.getSisaltoKieli.value);
  }

  tutkinnonOsaNimiKoodiLisays(koodi) {
    if (koodi.kaytossa) {
      this.$fail(this.$t('tutkinnon-osan-koodi-kaytossa') as string);
      this.tyhjennaTutkinnonosaKoodi();
    }
    else {
      this.store?.setData({
        ...this.store?.data.value,
        tutkinnonOsa: {
          ...this.store?.data.value.tutkinnonOsa,
          nimi: koodi.nimi,
          koodi,
        },
      });
    }
  }

  tyhjennaTutkinnonosaKoodi() {
    this.store?.setData({
      ...this.store?.data.value,
      tutkinnonOsa: {
        ...this.store?.data.value.tutkinnonOsa,
        koodi: null,
        nimi: null,
      },
    });
  }

  async lisaaTutkinnonosaNimiKoodistoon() {
    this.koodiTallennus = true;

    try {
      if (_.isEmpty(_.get(this.store?.data.value.tutkinnonOsa.nimi, 'fi')) || _.isEmpty(_.get(this.store?.data.value.tutkinnonOsa.nimi, 'sv'))) {
        this.$fail(this.$t('koodistoon-vienti-epaonnistui') as string, this.$t('tutkinnon-osan-nimi-koodisto-vienti-vaadittu-kieli-virhe') as string);
      }
      else {
        const koodi = (await Koodisto.lisaaUusiKoodi('tutkinnonosat', this.store?.data.value.tutkinnonOsa.nimi)).data as any;

        this.store?.setData({
          ...this.store?.data.value,
          tutkinnonOsa: {
            ...this.store?.data.value.tutkinnonOsa,
            koodi: {
              uri: koodi.koodiUri,
              koodisto: koodi.koodisto.koodistoUri,
              arvo: koodi.koodiArvo,
            },
            nimi: _.mapValues(_.keyBy(koodi.metadata, v => _.toLower(v.kieli)), v => v.nimi),
          },
        });
      }
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
    finally {
      this.koodiTallennus = false;
    }
  }

  async kopioiTutkinnonoOsa() {
    await this.store?.copy();
    this.$success(this.$t('tutkinnon-osa-kopioitu') as string);
  }

  async muokkaaTutkinnonOsaa() {
    await this.store?.start();
  }

  get valittuArviointiTyyppi() {
    if (this.valittuGeneerinen) {
      return 'geneerinen';
    }

    if (_.size(this.store?.data.value?.tutkinnonOsa?.arviointi?.arvioinninKohdealueet) > 0) {
      return 'tutkinnonosa-kohtainen';
    }

    return this.arvioinninTyyppi;
  }

  poistaGeneerinenaArviointi() {
    this.store?.setData({
      ...this.store?.data.value,
      tutkinnonOsa: {
        ...this.store?.data.value.tutkinnonOsa,
        _geneerinenArviointiasteikko: null,
      },
    });

    this.arvioinninTyyppi = null;
  }

  get kriteeritonGeneerinenValittu() {
    return this.valittuGeneerinen?.osaamistasot?.length === 1
      && _.chain(this.valittuGeneerinen.osaamistasot)
        .map('kriteerit')
        .flatten()
        .isEmpty()
        .value();
  }
}
</script>

<style lang="scss" scoped>
</style>
