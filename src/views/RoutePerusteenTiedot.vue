<template>
  <div v-if="!isInitializing && store">
    <EpEditointi :store="store">
      <template v-slot:header="{ }">
        <h2 class="m-0">{{ $t('perusteen-tiedot') }}</h2>
      </template>

      <template v-slot:default="{ data, isEditing, validation, supportData }">

        <b-tabs>
          <b-tab :title="$t('perustiedot')">
            <b-container fluid="xl" class="perustiedot-container">
              <b-row no-gutters >
                <b-col class="mb-4">
                  <b-form-group :label="$t('perusteen-nimi') + '*'">
                    <ep-input v-model="data.nimi"
                              :is-editing="isEditing"
                              :validation="validation.nimi"></ep-input>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row no-gutters>
                <b-col lg="6" v-if="filtersContain('laajuus') && data.vstSisalto" class="mb-4">
                  <b-form-group :label="$t('laajuus')">
                    <div class="d-flex align-items-center">
                      <ep-input v-model="data.vstSisalto.laajuus"
                                type="string"
                                :is-editing="isEditing"
                                :validation="validation.laajuus"></ep-input>
                      <div class="ml-2">{{$t('opintopiste')}}</div>
                    </div>
                  </b-form-group>
                </b-col>
                <b-col lg="6" v-if="filtersContain('diaarinumero')" class="mb-4">
                  <b-form-group :label="$t('diaarinumero')">
                    <div class="d-flex">
                      <ep-input v-model="data.diaarinumero"
                                type="string"
                                :is-editing="isEditing"
                                :validation="validation.diaarinumero"
                                class="w-80"></ep-input>
                      <EpInfoPopover v-if="isEditing" class="info ml-2" unique-id="1">{{ $t('diaarinumeron-muoto') }}</EpInfoPopover>
                    </div>
                  </b-form-group>
                </b-col>
                <b-col lg="6" v-if="filtersContain('paatospaivamaara')" class="mb-4">
                  <b-form-group :label="$t('maarayksen-paatospaivamaara')">
                    <ep-datepicker v-model="data.paatospvm" :is-editing="isEditing" />
                  </b-form-group>
                </b-col>
                <b-col lg="6" v-if="filtersContain('voimassaolo')" class="mb-4">
                  <b-form-group :label="$t('voimassaolo')">
                    <div class="d-flex align-items-center">
                      <ep-datepicker v-model="data.voimassaoloAlkaa" :is-editing="isEditing" />
                      <div class="ml-2 mr-2">-</div>
                      <ep-datepicker v-model="data.voimassaoloLoppuu" :is-editing="isEditing" />
                    </div>
                  </b-form-group>
                </b-col>
                <b-col lg="6" v-if="filtersContain('siirtymaPaattyy')" class="mb-4">
                  <b-form-group :label="$t('siirtymaajan-paattymisaika')">
                    <ep-datepicker v-model="data.siirtymaPaattyy" :is-editing="isEditing" :help="'siirtymaajan-paattymisaika-kuvaus'"/>
                  </b-form-group>
                </b-col>
                <b-col lg="6" v-if="filtersContain('koulutustyyppi')" class="mb-4">
                  <b-form-group :label="$t('koulutustyyppi')">
                    <ep-koulutustyyppi-select v-model="data.koulutustyyppi"
                                              :koulutustyypit="siirtymat[data.koulutustyyppi]"
                                              :is-editing="isEditing && !!siirtymat[data.koulutustyyppi]" />
                  </b-form-group>
                </b-col>
                <b-col lg="6" v-if="filtersContain('perusteenkieli')" class="mb-4">
                  <b-form-group :label="$t('perusteen-kielet')">
                    <b-form-checkbox-group v-if="isEditing" v-model="data.kielet" stacked>
                      <b-form-checkbox v-for="kieli in kielet" :key="kieli" :value="kieli">
                        {{ $t(kieli) }}
                      </b-form-checkbox>
                    </b-form-checkbox-group>
                    <div v-else class="text-nowrap">
                      <span v-for="(kieli, idx) in data.kielet" :key="kieli" :value="kieli">
                        {{ $t(kieli) }}<span class="mr-0" v-if="idx < data.kielet.length - 1">,</span>
                      </span>
                    </div>
                  </b-form-group>
                </b-col>
                <b-col lg="6" v-if="tyypinVaihtoSallittu" class="mb-4">
                  <b-form-group :label="$t('tyyppi')">
                    <b-form-select v-model="data.tyyppi" :options="perusteenTyypit" v-if="isEditing" ></b-form-select>
                    <div v-else>{{ $t('perustetyyppi-' + data.tyyppi) }}</div>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row no-gutters v-if="data.kvliite">
                <b-col class="mb-4">
                  <b-form-group>
                    <div class="d-flex mb-2">
                      <span class="font-weight-600">{{$t('tutkinnon-suorittaneen-osaaminen')}}</span>
                      <EpInfoPopover v-if="isEditing" class="ml-2" unique-id="2">{{ $t('kentat-tulostetaan-kv-liitteelle') }}</EpInfoPopover>
                    </div>
                    <ep-content
                      v-model="data.kvliite.suorittaneenOsaaminen"
                      layout="normal"
                      :is-editable="isEditing"></ep-content>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row no-gutters v-if="data.kvliite">
                <b-col class="mb-4">
                  <b-form-group>
                    <div class="d-flex mb-2">
                      <span class="font-weight-600">{{$t('tyotehtavat-joissa-voi-toimia')}}</span>
                      <EpInfoPopover v-if="isEditing" class="ml-2" unique-id="3">{{ $t('kentat-tulostetaan-kv-liitteelle') }}</EpInfoPopover>
                    </div>
                    <ep-content
                      v-if="data.kvliite.tyotehtavatJoissaVoiToimia || isEditing"
                      v-model="data.kvliite.tyotehtavatJoissaVoiToimia"
                      layout="normal"
                      :is-editable="isEditing"></ep-content>
                  </b-form-group>
                </b-col>
              </b-row>

              <hr/>

              <b-row no-gutters>
                <b-col class="mb-4">
                  <b-form-group>
                    <h3 slot="label">{{$t('peruste-koulutukset')}}</h3>
                    <b-table striped
                      show-empty
                            :items="data.koulutukset"
                            :fields="koulutuksetFields"
                            :empty-text="$t('ei-koulutuskoodeja') ">
                      <template v-slot:empty="">
                        <h4>{{ $t('ei-koulutuskoodeja') }}</h4>
                      </template>
                      <template v-slot:cell(koodi)="data">
                        <span class="font-weight-bold">{{ data.item.koulutuskoodiArvo }}</span>
                      </template>
                      <template v-slot:cell(nimi)="data">
                        {{ $kaanna(data.item.nimi) }}
                      </template>
                      <template v-slot:cell(poista)="data">
                        <div v-if="isEditing" class="default-icon clickable" @click="poistaKoulutusKoodi(data)">
                          <EpMaterialIcon>delete</EpMaterialIcon>
                        </div>
                      </template>
                    </b-table>
                    <ep-koodisto-select @add="addKoulutuskoodi(data, $event)"
                      :store="koulutuskoodisto"
                      v-if="isEditing">
                      <template v-slot:default="{ open }">
                        <ep-button @click="open" icon="add" variant="outline">
                          {{ $t('lisaa-koulutus') }}
                        </ep-button>
                      </template>
                    </ep-koodisto-select>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row no-gutters>
                <b-col class="mb-4">
                  <b-form-group>
                    <h3 slot="label">{{$t('korvattavat-perusteet')}}</h3>
                    <b-table v-if="korvattavatDiaarinumerot && korvattavatDiaarinumerot.length > 0"
                            :items="korvattavatDiaarinumerot"
                            :fields="korvattavatFields"
                            responsive
                            borderless
                            striped
                            fixed
                            hover>
                      <template v-slot:cell(diaarinumero)="data">
                        {{ data.item }}
                      </template>
                      <template v-slot:cell(peruste)="data">
                        <span v-if="korvattavatPerusteet[data.item]">
                          {{ $kaanna(korvattavatPerusteet[data.item].nimi) }}
                        </span>
                        <span v-else-if="korvattavatPerusteet[data.item] === null" class="font-italic">
                          {{ $t('ei-eperusteissa') }}
                        </span>
                        <ep-spinner v-else />
                      </template>
                      <template v-slot:cell(toiminnot)="data">
                        <div class="text-center" v-if="isEditing">
                          <ep-button variant="link" icon="delete" @click="poistaKorvattava(data.item)">
                            {{ $t('poista') }}
                          </ep-button>
                        </div>
                      </template>
                    </b-table>
                    <b-input-group v-if="isEditing">
                      <b-form-input v-model="korvattavaDiaarinumero"></b-form-input>
                      <b-input-group-append>
                        <b-button @click="lisaaDiaarinumero" variant="primary" :disabled="!korvattavaDiaarinumero">
                          {{ $t('lisaa-peruste') }}
                        </b-button>
                      </b-input-group-append>
                    </b-input-group>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-container>
          </b-tab>

          <b-tab :title="$t('liitteet-ja-maaraykset')">
            <b-container fluid="xl" class="perustiedot-container">

              <div class="d-flex">
                <h3>{{$t('maarayskirje')}}</h3>
                <EpInfoPopover v-if="isEditing" class="ml-2" unique-id="4">{{ $t('pdf-tiedoston-maksimikoko', { koko: fileMaxSize }) }}</EpInfoPopover>
              </div>

              <b-row no-gutters>
                <b-col class="mb-4">

                  <EpSpinner v-if="maarayskirjeFile" />

                  <ep-tiedosto-lataus :fileTypes="['application/pdf']" v-model="maarayskirjeFile" :as-binary="true" v-if="isEditing && !maarayskirjeFile && !maarayskirje" />

                  <b-table v-if="maarayskirje"
                      class="mb-2 w-90"
                      :items="liitteetMaarayskirje"
                      :fields="liitetableFields">
                    <template v-slot:cell(nimi)="{ item }">
                      <a :href="item.url" target="_blank" rel="noopener noreferrer" v-if="item.url">{{ item.nimi }}</a>
                      <span v-else>{{ item.nimi }}</span>
                    </template>
                    <template v-slot:cell(toiminnot)="data">
                      <div class="text-center" v-if="isEditing">
                        <ep-button variant="link" icon="delete" @click="poistaMaarayskirje(data.item)">
                          {{ $t('poista') }}
                        </ep-button>
                      </div>
                    </template>
                  </b-table>
                </b-col>
              </b-row>

              <template v-if="data.maarays">
                <b-row no-gutters v-if="isEditing || data.maarays.asiasanat[kieli].asiasana.length > 0">
                  <b-col class="mb-4">
                    <b-form-group :label="$t('maarayskirjeen-asiasana')">
                      <EpMaaraysAsiasanat v-model="data.maarays.asiasanat[kieli].asiasana" :asiasanat="asiasanat" :isEditing="isEditing"/>
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-row no-gutters v-if="isEditing || !!data.maarays.kuvaus">
                  <b-col>
                    <b-form-group :label="$t('maarayskirjeen-kuvaus')">
                      <ep-content v-model="data.maarays.kuvaus" layout="normal" :is-editable="isEditing"/>
                    </b-form-group>
                  </b-col>
                </b-row>
              </template>

              <hr/>

              <b-row no-gutters>
                <b-col>
                  <b-form-group>
                    <h3 slot="label">{{$t('muutosmaaraykset')}}</h3>
                    <EpMuutosmaaraykset v-model="data.muutosmaaraykset"
                                        :is-editing="isEditing"
                                        :perusteStore="perusteStore" />
                  </b-form-group>
                </b-col>
              </b-row>

              <hr/>

              <b-row>
                <b-col class="mb-4">
                  <b-form-group>
                    <h3 slot="label">{{$t('saamen-kielelle-kaannetyt-perusteet')}}</h3>
                    <ep-spinner v-if="!liitteet" />
                    <div v-if="isEditing" class="mb-4">
                      <div class="d-flex">
                        <div class="lataaliite mb-3">{{ $t('lataa-uusi-liitetiedosto') }}</div>
                        <EpInfoPopover v-if="isEditing" class="ml-2" unique-id="5">{{ $t('pdf-tiedoston-maksimikoko', { koko: fileMaxSize }) }}</EpInfoPopover>
                      </div>
                      <ep-tiedosto-lataus :fileTypes="['application/pdf']" v-model="kaannosFile" :as-binary="true" />
                    </div>
                    <b-table v-if="kaannokset.length > 0"
                            :items="kaannokset"
                            :fields="kaannoksetFields"
                            responsive
                            borderless
                            striped
                            fixed
                            hover>
                      <template v-slot:cell(nimi)="data">
                        <a class="btn btn-link pl-0" :href="data.item.url" target="_blank" rel="noopener noreferrer" variant="link">
                          {{ data.item.nimi }}
                        </a>
                      </template>
                      <template v-slot:cell(toiminnot)="data">
                        <div class="text-center" v-if="isEditing">
                          <ep-button variant="link" icon="delete" @click="poistaLiite(data.item)">
                            {{ $t('poista') }}
                          </ep-button>
                        </div>
                      </template>
                    </b-table>
                  </b-form-group>
                </b-col>
              </b-row>

              <hr/>

              <b-row v-if="isAmmatillinen">
                <b-col class="mb-4">
                  <b-form-group>
                    <h3 slot="label">{{$t('koulutusviennin-ohje')}}</h3>
                    <ep-spinner v-if="!liitteet" />

                    <div v-if="isEditing">
                      <div class="mb-4">
                        <b-form-radio-group stacked v-model="data.poikkeamismaaraysTyyppi" class="mb-2">
                          <b-form-radio value="ei_tarvita_ohjetta"
                                        name="poikkeamismaaraysTyyppi">{{ $t('voi-kayttaa-tutkintoviennissa') }}</b-form-radio>
                          <b-form-radio value="ei_voi_poiketa"
                                        name="poikkeamismaaraysTyyppi">{{ $t('ei-voi-poiketa-tutkinnon-perusteista-tutkintoviennin-yhteydessa') }}</b-form-radio>
                          <b-form-radio value="koulutusvientiliite"
                                        name="poikkeamismaaraysTyyppi">{{ $t('maarays-tutkinnon-perusteista-poikkeamiseen-tutkintoviennissa') }}</b-form-radio>
                        </b-form-radio-group>

                        <EpButton variant="link" class="no-padding" v-if="data.poikkeamismaaraysTyyppi" @click="data.poikkeamismaaraysTyyppi = null">{{$t('tyhjenna-valinta')}}</EpButton>
                      </div>

                    </div>
                    <div v-else>
                      <span>{{ poikkeamismaaraysTyyppiText }}</span>
                    </div>

                    <div v-if="data.poikkeamismaaraysTyyppi === 'koulutusvientiliite'">
                      <div v-if="isEditing">
                        <div class="d-flex">
                          <div class="lataaliite">{{ $t('lataa-uusi-liitetiedosto') }}</div>
                          <EpInfoPopover v-if="isEditing" class="ml-2" unique-id="6">{{ $t('pdf-tiedoston-maksimikoko', { koko: fileMaxSize }) }}</EpInfoPopover>
                        </div>
                        <div class="liiteohje" v-html="$t('koulutusviennin-lataus-ohje')"></div>
                        <ep-tiedosto-lataus :fileTypes="['application/pdf']"
                                            v-model="koulutusvienninOhjeFile"
                                            :as-binary="true" />
                      </div>
                      <b-table v-if="koulutusvienninOhjeet.length > 0"
                              :items="koulutusvienninOhjeet"
                              :fields="koulutusvientiOhjeFields"
                              responsive
                              borderless
                              striped
                              fixed
                              hover>

                        <template v-slot:cell(diaarinumero)="{index}">
                          <div class="d-flex">
                            <EpInput type="string" :isEditing="isEditing" :placeholder="$t('kirjoita-diaarinumero')" v-model="koulutusvienninOhjeet[index].lisatieto"/>
                          </div>
                        </template>
                        <template v-slot:cell(toiminnot)="data">
                          <div class="text-center" v-if="isEditing">
                            <ep-button variant="link" icon="delete" @click="poistaLiite(data.item)">
                              {{ $t('poista') }}
                            </ep-button>
                          </div>
                        </template>
                      </b-table>
                    </div>

                    <b-form-group :label="$t('tarkennus')" class="mt-4">
                      <ep-content
                        v-model="data.poikkeamismaaraysTarkennus"
                        layout="normal"
                        :is-editable="isEditing"></ep-content>
                    </b-form-group>

                  </b-form-group>
                </b-col>
              </b-row>

            </b-container>
          </b-tab>
          <b-tab :title="$t('osaamisalat-ja-tutkintonimikkeet')" v-if="isAmmatillinen">
            <b-container fluid="lg" class="perustiedot-container">
              <b-row no-gutters>
                <b-col class="mb-4">
                  <b-form-group>
                    <h3 slot="label">{{$t('osaamisalat')}}</h3>
                    <div class="text-muted font-size-small">
                      {{ $t('lisaa-tai-poista-osaamisala') }} <router-link :to="{ name: 'muodostuminen' }">{{ $t('tutkinnon-muodostumisessa') }}</router-link>
                    </div>
                    <b-table striped
                      show-empty
                            :items="osaamisalat"
                            :fields="fields"
                            :empty-text="$t('ei-kiinnitettyja-osaamisaloja')">
                      <template v-slot:cell(koodi)="data">
                        <span class="font-weight-bold">{{ data.item.arvo }}</span>
                      </template>
                      <template v-slot:cell(nimi)="data">
                        {{ $kaanna(data.item.nimi) }}
                      </template>
                    </b-table>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row no-gutters>
                <b-col class="mb-4">
                  <b-form-group>
                    <h3 slot="label">{{$t('tutkintonimikkeet')}}</h3>
                    <div class="text-muted font-size-small">
                      {{ $t('lisaa-tai-poista-tutkintonimike') }} <router-link :to="{ name: 'muodostuminen' }">{{ $t('tutkinnon-muodostumisessa') }}</router-link>
                    </div>
                    <b-table striped
                      show-empty
                            :items="tutkintonimikkeet"
                            :fields="fields"
                            :empty-text="$t('ei-kiinnitettyja-tutkintonimikkeita')">
                      <template v-slot:cell(koodi)="data">
                        <span class="font-weight-bold">{{ data.item.arvo }}</span>
                      </template>
                      <template v-slot:cell(nimi)="data">
                        {{ $kaanna(data.item.nimi) }}
                      </template>
                    </b-table>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-container>
          </b-tab>
        </b-tabs>

      </template>
    </EpEditointi>
  </div>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Watch, Prop, Component } from 'vue-property-decorator';
import EpTiedostoLataus from '@shared/components/EpTiedosto/EpTiedostoLataus.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpMuutosmaaraykset from '@/components/EpPerusteenTiedot/EpMuutosmaaraykset.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Api, Liitetiedostot, Koodisto, LiiteDtoTyyppiEnum, LiitetiedostotParam, baseURL } from '@shared/api/eperusteet';
import { SallitutKoulutustyyppisiirtymat, Koulutustyyppi } from '@shared/tyypit';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { PerusteEditStore } from '@/stores/PerusteEditStore';
import { PerusteetStore } from '@/stores/PerusteetStore';
import PerustetyoryhmaSelect from './PerustetyoryhmaSelect.vue';
import EpKoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { UiKielet, Kielet } from '@shared/stores/kieli';
import _ from 'lodash';
import EpMaaraysAsiasanat from '@/components/maaraykset/EpMaaraysAsiasanat.vue';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';

export type TietoFilter = 'laajuus' | 'voimassaolo' | 'diaarinumero' | 'paatospaivamaara' | 'koulutustyyppi' | 'perusteenkieli' | 'koulutusviento';

const perustetyyppiTietoFilters = [
  {
    tyyppi: ['digitaalinen_osaaminen'],
    filters: ['diaarinumero', 'paatospaivamaara', 'voimassaolo', 'siirtymaPaattyy', 'perusteenkieli'],
  },
];

const koulutustyyppiTietoFilters = [
  {
    koulutustyypit: ['default'],
    filters: ['diaarinumero', 'paatospaivamaara', 'voimassaolo', 'siirtymaPaattyy', 'koulutustyyppi', 'perusteenkieli', 'koulutusvienti'],
  },
  {
    koulutustyypit: [Koulutustyyppi.vapaasivistystyo],
    filters: ['laajuus', 'diaarinumero', 'paatospaivamaara', 'siirtymaPaattyy', 'voimassaolo', 'koulutustyyppi', 'perusteenkieli'],
  },
  {
    koulutustyypit: [Koulutustyyppi.maahanmuuttajienkotoutumiskoulutus, Koulutustyyppi.vapaasivistystyolukutaito],
    filters: ['diaarinumero', 'paatospaivamaara', 'voimassaolo', 'siirtymaPaattyy', 'koulutustyyppi', 'perusteenkieli', 'koulutusvienti'],
  },
];

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
    EpMultiSelect,
    EpMuutosmaaraykset,
    EpSpinner,
    EpTiedostoLataus,
    EpToggle,
    PerustetyoryhmaSelect,
    EpMaterialIcon,
    EpMaaraysAsiasanat,
  },
})
export default class RoutePerusteenTiedot extends PerusteprojektiRoute {
  @Prop({ required: true })
  private perusteetStore!: PerusteetStore;

  private store: EditointiStore | null = null;
  private maarayskirjeFile: any | null = null;
  private koulutusvienninOhjeFile: any | null = null;
  private kaannosFile: any | null = null;
  private liitteet: any[] | null = null;
  private liitteenNimi = '';
  private korvattavatPerusteet: { [diaari: string]: any } = {};
  private korvattavaDiaarinumero = '';
  private poikkeamismaaraysTyyppi: 'ei_tarvita_ohjetta' | 'ei_voi_poiketa' | 'koulutusvientiliite' | null = null;
  private fileMaxSize = 10;

  async onProjektiChange(projektiId: number, perusteId: number) {
    this.store = new EditointiStore(new PerusteEditStore(projektiId, perusteId, this.perusteStore, this.tallennaKoulutusvienninOhjeDiaari));
    await this.fetchLiitteet();
    await this.perusteStore.fetchMaaraykset();
  }

  async fetchLiitteet() {
    const res = await Liitetiedostot.getAllLiitteet(Number(this.perusteId!));
    this.liitteet = _.map(res.data, liite => ({
      ...liite,
      lisatieto: liite.lisatieto || '',
      url: baseURL + LiitetiedostotParam.getLiite(this.perusteId!, liite.id!).url,
    }));
  }

  get koulutusvienninOhjeet() {
    return _.filter(this.liitteet, liite => liite.tyyppi === _.toLower(LiiteDtoTyyppiEnum.KOULUTUSVIENNINOHJE));
  }

  get kaannokset() {
    return _.filter(this.liitteet, liite => liite.tyyppi === _.toLower(LiiteDtoTyyppiEnum.KAANNOS));
  }

  get siirtymat() {
    return SallitutKoulutustyyppisiirtymat;
  }

  get kielet() {
    return UiKielet;
  }

  get data() {
    return this.store?.data?.value || null;
  }

  get tutkintonimikkeet() {
    return this.store?.data?.value?.tutkintonimikkeet || [];
  }

  get osaamisalat() {
    return this.store?.data?.value?.osaamisalat || [];
  }

  get korvattavatDiaarinumerot() {
    return this.store?.data?.value?.korvattavatDiaarinumerot || null;
  }

  @Watch('koulutusvienninOhjeet', { deep: true })
  async onKoulutusvienninOhjeetChanged() {
    this.store!.setData({
      ...this.store!.data.value,
      koulutusvienninOhjeLiitteet: this.koulutusvienninOhjeet,
    });
  }

  @Watch('korvattavatDiaarinumerot')
  async fetchKorvattavat(diaarit) {
    const uudet: any = {};
    for (const diaarinumero of diaarit) {
      if (this.korvattavatPerusteet[diaarinumero] === undefined) {
        const res = await this.perusteetStore.findPerusteet({ diaarinumero });
        uudet[diaarinumero] = _.first(res.data) || null;
      }
    }

    this.korvattavatPerusteet = {
      ...this.korvattavatPerusteet,
      ...uudet,
    };
  }

  get fields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
    }, {
      key: 'koodi',
      label: this.$t('koodi'),
    }];
  }

  get koulutuksetFields() {
    return [{
      key: 'koodi',
      label: this.$t('koodi'),
    }, {
      key: 'nimi',
      label: this.$t('koulutuksen-nimi'),
    }, {
      key: 'poista',
      label: '',
    }];
  }

  get korvattavatFields() {
    return [{
      key: 'diaarinumero',
      label: this.$t('diaarinumero'),
      thStyle: { width: '20%' },
      sortable: true,
    }, {
      key: 'peruste',
      label: this.$t('perusteen-nimi'),
      sortable: true,
    }, {
      key: 'toiminnot',
      label: '',
      thStyle: { width: '10%', borderBottom: '0px' },
      sortable: false,
    }];
  }

  get liitetableFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
      thStyle: { width: '60%' },
      sortable: false,
      thClass: 'border-bottom-1',
      tdClass: 'align-middle',
    }, {
      key: 'luotu',
      label: this.$t('julkaistu'),
      sortable: false,
      thClass: 'border-bottom-1',
      tdClass: 'align-middle',
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$sdt(value);
      },
    }, {
      key: 'toiminnot',
      label: '',
      thStyle: { width: '10%' },
      sortable: false,
      thClass: 'border-bottom-1',
      tdClass: 'align-middle',
    }];
  }

  get koulutusvientiOhjeFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
      thStyle: { width: '50%' },
      tdClass: ['liite-nimi', 'align-middle'],
      sortable: false,
    }, {
      key: 'diaarinumero',
      label: this.$t('diaarinumero'),
      thStyle: { width: '25%' },
      tdClass: 'align-middle',
      sortable: false,
    }, {
      key: 'luotu',
      label: this.$t('julkaistu'),
      thStyle: { width: '15%' },
      tdClass: 'align-middle',
      sortable: false,
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$sdt(value);
      },
    }, {
      key: 'toiminnot',
      label: '',
      thStyle: { width: '10%' },
      sortable: false,
    }];
  }

  get kaannoksetFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
      thStyle: { width: '40%' },
      sortable: false,
    }, {
      key: 'luotu',
      label: this.$t('julkaistu'),
      sortable: false,
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$sdt(value);
      },
    }, {
      key: 'toiminnot',
      label: '',
      thStyle: { width: '10%' },
      sortable: false,
    }];
  }

  get poikkeamismaaraysTyyppiText() {
    if (this.store?.data?.value?.poikkeamismaaraysTyyppi === 'ei_tarvita_ohjetta') {
      return this.$t('voi-kayttaa-tutkintoviennissa');
    }
    else if (this.store?.data?.value?.poikkeamismaaraysTyyppi === 'ei_voi_poiketa') {
      return this.$t('ei-voi-poiketa-tutkinnon-perusteista-tutkintoviennin-yhteydessa');
    }
    return '';
  }

  private koulutuskoodisto = new KoodistoSelectStore({
    koodisto: 'koulutus',
    async query(query: string, sivu = 0, koodisto: string) {
      return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  addKoulutuskoodi(data, koodi) {
    data.koulutukset = [...data.koulutukset, {
      nimi: koodi.nimi,
      koulutuskoodiUri: koodi.uri,
      koulutuskoodiArvo: koodi.arvo,
    }];
  }

  @Watch('maarayskirjeFile')
  async maarayskirjeFileChange() {
    if (this.maarayskirjeFile) {
      const data = new FormData();
      data.append('file', window.btoa(this.maarayskirjeFile.binary));
      data.set('nimi', this.maarayskirjeFile.file.name);
      data.set('tyyppi', 'maarayskirje');
      const maarayskirjeUuid = _.get(await Api.request({
        method: 'POST',
        url: `api/perusteet/${this.perusteId!}/liitteet/b64`,
        data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }), 'data');
      this.$success(this.$t('kaannos-tallennettu') as string);
      await this.fetchLiitteet();
      this.maarayskirje = _.find(this.liitteet, liite => liite.id === maarayskirjeUuid);
      this.maarayskirjeFile = null;
    }
  }

  get maarayskirje() {
    const maarayskirjeLiite = this.store?.data.value?.maarayskirje?.liitteet[this.$slang.value];
    if (maarayskirjeLiite) {
      return _.find(this.liitteet, liite => liite.id === maarayskirjeLiite.id);
    }

    return null;
  }

  get liitteetMaarayskirje() {
    return this.maarayskirje
      ? [
        {
          ...this.maarayskirje,
          url: this.maarayskirjeUrl,
        },
      ] : [];
  }

  set maarayskirje(liite: any) {
    this.store!.setData({
      ...this.store!.data.value,
      maarayskirje: {
        liitteet: {
          ...(this.store!.data.value.maarayskirje?.liitteet ? this.store!.data.value.maarayskirje?.liitteet : []),
          [this.$slang.value]: liite,
        },
      },
    });
  }

  get maarayskirjeUrl() {
    if (this.maarayskirje) {
      return `/eperusteet-service/api/perusteet/${this.perusteId!}/liitteet/${this.maarayskirje.id}`;
    }
    else {
      return null;
    }
  }

  async poistaMaarayskirje(maarayskirje) {
    await this.poistaLiite(maarayskirje);
    this.store!.setData({
      ...this.store!.data.value,
      maarayskirje: {
        ...this.store?.data.value.maarayskirje,
        liitteet: _.omit(this.store?.data.value.maarayskirje.liitteet, this.$slang.value),
      },
    });
  }

  async poistaLiite(item: any) {
    try {
      await Liitetiedostot._delete(Number(this.perusteId!), item.id);
      this.$success(this.$t('liitetiedoston-poisto-onnistui') as string);
      this.fetchLiitteet();
    }
    catch (err) {
      this.$fail(this.$t('liitetiedoston-poisto-epaonnistui') as string);
      console.log(err);
    }
  }

  lisaaDiaarinumero() {
    const data = this.store?.data?.value;
    this.store!.setData({
      ...data,
      korvattavatDiaarinumerot: [
        ...data?.korvattavatDiaarinumerot || [],
        this.korvattavaDiaarinumero,
      ],
    });
    this.korvattavaDiaarinumero = '';
  }

  poistaKorvattava(diaarinumero: string) {
    const data = this.store?.data?.value;
    this.store!.setData({
      ...data,
      korvattavatDiaarinumerot: _.reject(data?.korvattavatDiaarinumerot, x => x === diaarinumero),
    });
  }

  get peruste() {
    return this.store?.data?.value || {};
  }

  get koulutustyyppiFilters() {
    return _.find(koulutustyyppiTietoFilters, filter => _.includes(filter.koulutustyypit, this.peruste.koulutustyyppi))
      || _.find(perustetyyppiTietoFilters, filter => _.includes(filter.tyyppi, this.peruste.tyyppi));
  }

  get tietoFilters() {
    return _.get(this.koulutustyyppiFilters ? this.koulutustyyppiFilters : _.find(koulutustyyppiTietoFilters, filter => _.includes(filter.koulutustyypit, 'default')), 'filters');
  }

  filtersContain(filter) {
    return _.includes(this.tietoFilters, filter);
  }

  @Watch('koulutusvienninOhjeFile')
  async koulutusvienninOhjeFileChange() {
    if (this.koulutusvienninOhjeFile) {
      const data = new FormData();
      data.append('file', window.btoa(this.koulutusvienninOhjeFile.binary));
      data.set('nimi', this.koulutusvienninOhjeFile.file.name);
      data.set('tyyppi', 'koulutusvienninohje');
      await Api.request({
        method: 'POST',
        url: `api/perusteet/${this.perusteId!}/liitteet/b64`,
        data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      this.$success(this.$t('koulutusvienninohje-tallennettu') as string);
      this.fetchLiitteet();
      this.koulutusvienninOhjeFile = null;
    }
  }

  @Watch('kaannosFile')
  async kaannosFileChange() {
    if (this.kaannosFile) {
      const data = new FormData();
      data.append('file', window.btoa(this.kaannosFile.binary));
      data.set('nimi', this.kaannosFile.file.name);
      data.set('tyyppi', 'kaannos');
      await Api.request({
        method: 'POST',
        url: `api/perusteet/${this.perusteId!}/liitteet/b64`,
        data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      this.$success(this.$t('kaannos-tallennettu') as string);
      this.fetchLiitteet();
      this.kaannosFile = null;
    }
  }

  async tallennaKoulutusvienninOhjeDiaari() {
    if (!_.isEmpty(this.koulutusvienninOhjeet)) {
      await Promise.all(_.map(this.koulutusvienninOhjeet, liite =>
        Liitetiedostot.paivitaLisatieto(this.perusteId!, liite.id, liite.lisatieto)));
    }
  }

  get tyypinVaihtoSallittu() {
    return this.isAmmatillinen && this.$isAdmin() && _.includes(_.map(this.perusteenTyypit, 'value'), this.peruste.tyyppi);
  }

  get perusteenTyypit() {
    return [
      { text: this.$t('perustetyyppi-normaali'), value: 'normaali' },
      { text: this.$t('perustetyyppi-amosaayhteinen'), value: 'amosaayhteinen' },
    ];
  }

  poistaKoulutusKoodi({ item }) {
    this.store!.setData({
      ...this.store?.data.value,
      koulutukset: _.filter(this.store?.data.value.koulutukset, koulutus => koulutus.koulutuskoodiUri !== item.koulutuskoodiUri),
    });
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get asiasanat() {
    if (_.isEmpty(this.store?.supportData.value.asiasanat[this.kieli])) {
      return [];
    }

    return this.store?.supportData.value.asiasanat[this.kieli];
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

.perustiedot-container {
  margin-left: 10px;
  margin-top: 20px;
  padding-left: 0px;
}

.table-no-edit {
  margin-top: -25px;
}

hr {
  border-top-color: $gray;
  margin-bottom: 3rem;
}

.info {
  align-self: center;
}

::v-deep .liite-nimi {
  overflow-x: auto;
}
</style>
