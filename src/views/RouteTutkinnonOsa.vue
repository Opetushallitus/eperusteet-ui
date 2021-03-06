<template>
  <div>
    <div v-if="store">
      <EpEditointi :store="store" :labelCopyConfirm="'kopioidaanko-tutkinnonosa'" :labelRemove="'poista-tutkinnonosa'">
      <template v-slot:header="{ data }">
        <h2 class="m-0">
          <span>
            {{ $kaanna(data.tutkinnonOsa.nimi) || $t('nimeton-tutkinnonosa') }}{{ data.laajuus ? ',' : '' }}
          </span>
          <span v-if="data.laajuus">
            {{ data.laajuus }} {{ $t('OSAAMISPISTE') }}
          </span>
        </h2>
      </template>

      <template v-slot:default="{ data, isEditing, validation }">
        <div class="mt-1" v-if="isEditing && isNew">
          <ep-error-wrapper>
            <b-form-group :label="$t('tyyppi')">
              <b-form-radio v-model="data.tutkinnonOsa.tyyppi" name="tyyppi" value="normaali">
                {{ $t('tutkintokohtainen') }}
              </b-form-radio>
              <b-form-radio v-model="data.tutkinnonOsa.tyyppi" name="tyyppi" value="reformi_tutke2">
                {{ $t('yhteinen') }}
              </b-form-radio>
            </b-form-group>
          </ep-error-wrapper>
        </div>

        <b-row>
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
                        <b-button @click="open" icon="plus" variant="primary">
                          {{ $t('hae-koodistosta') }}
                        </b-button>
                      </b-input-group-append>
                    </b-input-group>

                    <ep-button icon="roskalaatikko" variant="link" v-if="data.tutkinnonOsa.koodi" @click="tyhjennaTutkinnonosaKoodi"/>
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
            <b-form-group v-if="isEditing">
              <b-form-radio
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
              <table class="table table-striped">
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
            <EpAlert :text="$t('arviointia-ei-asetettu')" v-else />
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

        </div>
        <div v-else>
          <ep-collapse tyyppi="osa-alueet" :border-bottom="false" :border-top="true">
            <h3 slot="header">{{ $t('osa-alueet') }}</h3>
            <div>
              <EpBalloonList v-if="data.tutkinnonOsa.osaAlueet" :value="data.tutkinnonOsa.osaAlueet">
              <template v-slot:default="{ item }">
                <router-link :to="{ name: 'osaalue', params: { osaalueId: item.id } }">{{ $kaanna(item.nimi) || $t('nimeton') }}</router-link>
                <span v-if="item.koodi" class="ml-1">({{ item.koodi.arvo }})</span>
              </template>
              </EpBalloonList>
            </div>
            <ep-button @click="lisaaOsaAlue(data.tutkinonOsa)" variant="outline" icon="plus" v-if="!isEditing">
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
import { LokalisoituTekstiDto } from '@shared/tyypit';
import { PerusteStore } from '@/stores/PerusteStore';
import { TutkinnonOsaEditStore } from '@/stores/TutkinnonOsaEditStore';
import { ArviointiStore } from '@/stores/ArviointiStore';
import _ from 'lodash';
import { Murupolku } from '@shared/stores/murupolku';
import { Koodisto, TutkinnonosatPrivate } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { Kielet } from '@shared/stores/kieli';

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
  },
})
export default class RouteTutkinnonosa extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  arviointiStore!: ArviointiStore;

  private store: EditointiStore | null = null;
  private koodiTallennus = false;

  private readonly tutkinnonosaKoodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      const koodit = (await Koodisto.kaikkiSivutettuna('tutkinnonosat', query, {
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

  @Watch('tutkinnonOsaId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    this.arviointiStore.fetchArviointiasteikot();
    this.arviointiStore.fetchGeneeriset();
    await this.perusteStore.blockUntilInitialized();
    const store = new TutkinnonOsaEditStore(this.perusteId!, id ? Number(id!) : undefined, this);
    this.store = new EditointiStore(store);
  }

  async lisaaOsaAlue(tutkinnonOsa) {
    this.$router.push({
      name: 'osaalue',
      params: {
        osaalueId: 'uusi',
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
      const koodi = (await Koodisto.lisaaUusiKoodi('tutkinnonosat', this.store?.data.value.tutkinnonOsa.nimi)).data as any;

      this.store?.setData({
        ...this.store?.data.value,
        tutkinnonOsa: {
          ...this.store?.data.value.tutkinnonOsa,
          koodi,
          nimi: _.mapValues(_.keyBy(koodi.metadata, v => _.toLower(v.kieli)), v => v.nimi),
        },
      });
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
    finally {
      this.koodiTallennus = false;
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
