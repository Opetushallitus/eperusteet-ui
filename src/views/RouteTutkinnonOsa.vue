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
            <template #header>
              <h3>{{ $t('ammattitaitovaatimukset') }}</h3>
            </template>
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
            <template #header>
              <h3>{{ $t('osaamisen-arviointi') }}</h3>
            </template>

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
            <template #header>
              <h3>{{ $t('ammattitaidon-osoittamistavat') }}</h3>
            </template>
            <b-form-group>
              <ep-content v-model="data.tutkinnonOsa.ammattitaidonOsoittamistavat"
                          :validation="validation.tutkinnonOsa.ammattitaidonOsoittamistavat"
                          layout="normal"
                          :is-editable="isEditing"></ep-content>
            </b-form-group>
          </ep-collapse>

          <ep-collapse :border-bottom="false" :border-top="true" v-if="data.tutkinnonOsa.tavoitteet">
            <template #header>
              <h3>{{ $t('tavoitteet') }}</h3>
            </template>
            <b-form-group>
              <ep-content v-model="data.tutkinnonOsa.tavoitteet"
                          layout="normal"
                          :is-editable="isEditing"></ep-content>
            </b-form-group>
          </ep-collapse>

          <ep-collapse :border-bottom="false" :border-top="true" v-if="data.tutkinnonOsa.arviointi && data.tutkinnonOsa.arviointi.lisatiedot">
            <template #header>
              <h3>{{ $t('arviointi') }}</h3>
            </template>
            <b-form-group>
              <ep-content v-model="data.tutkinnonOsa.arviointi.lisatiedot"
                          layout="normal"
                          :is-editable="isEditing"></ep-content>
            </b-form-group>
          </ep-collapse>

        </div>
        <div v-else>
          <ep-collapse tyyppi="osa-alueet" :border-bottom="false" :border-top="true">
            <template #header>
              <h3>{{ $t('osa-alueet') }}</h3>
            </template>
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

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
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
import { $kaanna, $t, $success, $fail } from '@shared/utils/globals';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{
  perusteStore: PerusteStore;
  arviointiStore: ArviointiStore;
}>();

const router = useRouter();
const route = useRoute();

const store = ref<EditointiStore | null>(null);
const koodiTallennus = ref(false);
const arvioinninTyyppi = ref<'geneerinen' | 'tutkinnonosa-kohtainen' | null>(null);

const tutkinnonosaKoodisto = new KoodistoSelectStore({
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

const tutkinnonOsaEditable = computed(() => {
  return store.value?.features.value?.editable;
});

const tutkinnonosaKoodistoKaytossaField = computed(() => {
  return [{
    key: 'kaytossa',
    label: $t('kaytossa'),
    thStyle: { width: '10rem' },
    formatter: (value, key, item) => {
      if (value) {
        return $t('kylla');
      }

      return '';
    },
  }];
});

const isNew = computed(() => {
  return tutkinnonOsaId.value === 'uusi';
});

const tov = computed(() => {
  if (!store.value) {
    return null;
  }
  return store.value.data.value;
});

// Watch tov for changes to update Murupolku
watch(tov, (newTov) => {
  if (newTov && newTov.tutkinnonOsa) {
    Murupolku.aseta('tutkinnonosa', $kaanna(newTov.tutkinnonOsa.nimi), {
      name: 'tutkinnonosa',
    });
  }
});

const tutkinnonOsaId = computed(() => {
  return route.params.tutkinnonOsaId as string;
});

const arviointiasteikot = computed(() => {
  return props.arviointiStore.arviointiasteikot.value;
});

const arviointiasteikotKeyById = computed(() => {
  return _.keyBy(_.map(arviointiasteikot.value, arviointiasteikko => {
    return {
      ...arviointiasteikko,
      osaamistasot: _.keyBy(arviointiasteikko.osaamistasot, 'id'),
    };
  }), 'id');
});

const kaikkiGeneeriset = computed(() => {
  return props.arviointiStore.geneeriset.value;
});

const valittuGeneerinen = computed((): YhdistettyGeneerinen | null => {
  if (!tov.value || !tov.value.tutkinnonOsa?._geneerinenArviointiasteikko) {
    return null;
  }

  const geneerinen = _.first(_.filter(kaikkiGeneeriset.value,
    g => g.id === Number(tov.value!.tutkinnonOsa._geneerinenArviointiasteikko)));

  if (!geneerinen) {
    return null;
  }

  const asteikko = _.first(_.filter(arviointiasteikot.value,
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
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const geneeriset = computed(() => {
  return _.filter(props.arviointiStore.geneeriset.value, 'julkaistu');
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

// Watch version number changes
watch(versionumero, async () => {
  await fetch();
}, { immediate: true });

// Watch tutkinnonOsaId changes
watch(tutkinnonOsaId, async (id, oldId) => {
  if (!id || id === _.toString(oldId)) {
    return;
  }
  await props.arviointiStore.fetchArviointiasteikot();
  await props.arviointiStore.fetchGeneeriset();
  await fetch();
}, { immediate: true });

const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const editStore = new TutkinnonOsaEditStore(perusteId.value!, !isNew.value ? tutkinnonOsaId.value : undefined, null, versionumero.value);
  store.value = new EditointiStore(editStore);
};

const lisaaOsaAlue = async (tutkinnonOsa) => {
  router.push({
    name: 'osaalue',
    params: {
      osaalueId: 'uusi',
    },
    query: {
      tutkinnonOsaId: tutkinnonOsaId.value,
    },
  });
};

const hasNimi = computed(() => {
  return !_.isEmpty(_.get(store.value?.data.value.tutkinnonOsa.nimi, Kielet.getSisaltoKieli.value));
});

// Computed property for nimi with getter and setter
const nimi = computed({
  get() {
    return _.get(store.value?.data.value.tutkinnonOsa.nimi, Kielet.getSisaltoKieli.value);
  },
  set(value) {
    store.value?.setData({
      ...store.value?.data.value,
      tutkinnonOsa: {
        ...store.value?.data.value.tutkinnonOsa,
        nimi: {
          ...store.value?.data.value.tutkinnonOsa.nimi,
          [Kielet.getSisaltoKieli.value]: value,
        },
      },
    });
  }
});

const tutkinnonOsaNimiKoodiLisays = (koodi) => {
  if (koodi.kaytossa) {
    $fail($t('tutkinnon-osan-koodi-kaytossa') as string);
    tyhjennaTutkinnonosaKoodi();
  }
  else {
    store.value?.setData({
      ...store.value?.data.value,
      tutkinnonOsa: {
        ...store.value?.data.value.tutkinnonOsa,
        nimi: koodi.nimi,
        koodi,
      },
    });
  }
};

const tyhjennaTutkinnonosaKoodi = () => {
  store.value?.setData({
    ...store.value?.data.value,
    tutkinnonOsa: {
      ...store.value?.data.value.tutkinnonOsa,
      koodi: null,
      nimi: null,
    },
  });
};

const lisaaTutkinnonosaNimiKoodistoon = async () => {
  koodiTallennus.value = true;

  try {
    if (_.isEmpty(_.get(store.value?.data.value.tutkinnonOsa.nimi, 'fi')) || _.isEmpty(_.get(store.value?.data.value.tutkinnonOsa.nimi, 'sv'))) {
      $fail($t('koodistoon-vienti-epaonnistui') as string, $t('tutkinnon-osan-nimi-koodisto-vienti-vaadittu-kieli-virhe') as string);
    }
    else {
      const koodi = (await Koodisto.lisaaUusiKoodi('tutkinnonosat', store.value?.data.value.tutkinnonOsa.nimi)).data as any;

      store.value?.setData({
        ...store.value?.data.value,
        tutkinnonOsa: {
          ...store.value?.data.value.tutkinnonOsa,
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
    $fail($t('virhe-palvelu-virhe') as string);
  }
  finally {
    koodiTallennus.value = false;
  }
};

const kopioiTutkinnonoOsa = async () => {
  await store.value?.copy();
  $success($t('tutkinnon-osa-kopioitu') as string);
};

const muokkaaTutkinnonOsaa = async () => {
  await store.value?.start();
};

const valittuArviointiTyyppi = computed(() => {
  if (valittuGeneerinen.value) {
    return 'geneerinen';
  }

  if (_.size(store.value?.data.value?.tutkinnonOsa?.arviointi?.arvioinninKohdealueet) > 0) {
    return 'tutkinnonosa-kohtainen';
  }

  return arvioinninTyyppi.value;
});

const poistaGeneerinenaArviointi = () => {
  store.value?.setData({
    ...store.value?.data.value,
    tutkinnonOsa: {
      ...store.value?.data.value.tutkinnonOsa,
      _geneerinenArviointiasteikko: null,
    },
  });

  arvioinninTyyppi.value = null;
};

const kriteeritonGeneerinenValittu = computed(() => {
  return valittuGeneerinen.value?.osaamistasot?.length === 1
    && _.chain(valittuGeneerinen.value.osaamistasot)
      .map('kriteerit')
      .flatten()
      .isEmpty()
      .value();
});
</script>

<style lang="scss" scoped>
</style>
