<template>
  <div v-if="!isInitializing && store">
    <EpEditointi :store="store">
      <template #header="{ }">
        <h2 class="m-0">
          {{ $t('perusteen-tiedot') }}
        </h2>
      </template>

      <template #default="{ data, isEditing, validation }">
        <b-tabs>
          <b-tab :title="$t('perustiedot')">
            <b-container
              fluid="xl"
              class="perustiedot-container"
            >
              <b-row no-gutters>
                <b-col class="mb-4">
                  <b-form-group :label="$t('perusteen-nimi') + '*'">
                    <ep-input
                      v-model="data.nimi"
                      :is-editing="isEditing"
                      :validation="validation.nimi"
                    />
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row no-gutters>
                <b-col
                  v-if="filtersContain('laajuus') && data.vstSisalto"
                  lg="6"
                  class="mb-4"
                >
                  <b-form-group :label="$t('laajuus')">
                    <div class="d-flex align-items-center">
                      <ep-input
                        v-model="data.vstSisalto.laajuus"
                        type="string"
                        :is-editing="isEditing"
                        :validation="validation.laajuus"
                      />
                      <div class="ml-2">
                        {{ $t('opintopiste') }}
                      </div>
                    </div>
                  </b-form-group>
                </b-col>
                <b-col
                  v-if="filtersContain('diaarinumero')"
                  lg="6"
                  class="mb-4"
                >
                  <b-form-group :label="$t('diaarinumero')">
                    <div class="d-flex">
                      <ep-input
                        v-model="data.diaarinumero"
                        type="string"
                        :is-editing="isEditing"
                        :validation="validation.diaarinumero"
                        class="w-80"
                      />
                      <EpInfoPopover
                        v-if="isEditing"
                        class="info ml-2"
                        unique-id="1"
                      >
                        {{ $t('diaarinumeron-muoto') }}
                      </EpInfoPopover>
                    </div>
                  </b-form-group>
                </b-col>
                <b-col
                  v-if="filtersContain('paatospaivamaara')"
                  lg="6"
                  class="mb-4"
                >
                  <b-form-group :label="$t('maarayksen-paatospaivamaara')">
                    <ep-datepicker
                      v-model="data.paatospvm"
                      :is-editing="isEditing"
                    />
                  </b-form-group>
                </b-col>
                <b-col
                  v-if="filtersContain('voimassaolo')"
                  lg="6"
                  class="mb-4"
                >
                  <b-form-group :label="$t('voimassaolo')">
                    <div class="d-flex align-items-center">
                      <ep-datepicker
                        v-model="data.voimassaoloAlkaa"
                        :is-editing="isEditing"
                      />
                      <div class="ml-2 mr-2">
                        -
                      </div>
                      <ep-datepicker
                        v-model="data.voimassaoloLoppuu"
                        :is-editing="isEditing"
                      />
                    </div>
                  </b-form-group>
                </b-col>
                <b-col
                  v-if="filtersContain('siirtymaPaattyy')"
                  lg="6"
                  class="mb-4"
                >
                  <b-form-group :label="$t('siirtymaajan-paattymisaika')">
                    <ep-datepicker
                      v-model="data.siirtymaPaattyy"
                      :is-editing="isEditing"
                      :help="'siirtymaajan-paattymisaika-kuvaus'"
                    />
                  </b-form-group>
                </b-col>
                <b-col
                  v-if="filtersContain('koulutustyyppi')"
                  lg="6"
                  class="mb-4"
                >
                  <b-form-group :label="$t('koulutustyyppi')">
                    <ep-koulutustyyppi-select
                      v-model="data.koulutustyyppi"
                      :koulutustyypit="valittavatKoulutustyypit"
                      :is-editing="isEditing && (!data.koulutustyyppi || valittavatKoulutustyypit.includes(data.koulutustyyppi))"
                    />
                  </b-form-group>
                </b-col>
                <b-col
                  v-if="filtersContain('perusteenkieli')"
                  lg="6"
                  class="mb-4"
                >
                  <b-form-group :label="$t('perusteen-kielet')">
                    <EpToggleGroup
                      v-model="data.kielet"
                      :label="$t('perusteen-kielet')"
                      :items="kielet"
                      stacked
                      :is-editing="isEditing"
                    >
                      <template #default="{ item }">
                        {{ $t(item) }}
                      </template>
                    </EpToggleGroup>
                  </b-form-group>
                </b-col>
                <b-col
                  v-if="tyypinVaihtoSallittu && (isEditing || peruste.tyyppi === 'amosaayhteinen') "
                  lg="6"
                  class="mb-4"
                >
                  <b-form-group :label="$t('tyyppi')">
                    <EpToggle
                      v-if="isEditing"
                      v-model="amosaaYhteinen"
                      :label="$t('perustetyyppi-amosaa_yhteinen')"
                    />
                    <div v-else>
                      {{ $t('perustetyyppi-amosaa_yhteinen') }}
                    </div>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row
                v-if="data.kvliite"
                no-gutters
              >
                <b-col class="mb-4">
                  <b-form-group>
                    <div class="d-flex mb-2">
                      <span class="font-weight-600">{{ $t('tutkinnon-suorittaneen-osaaminen') }}</span>
                      <EpInfoPopover
                        v-if="isEditing"
                        class="ml-2"
                        unique-id="2"
                      >
                        {{ $t('kentat-tulostetaan-kv-liitteelle') }}
                      </EpInfoPopover>
                    </div>
                    <ep-content
                      v-model="data.kvliite.suorittaneenOsaaminen"
                      layout="normal"
                      :is-editable="isEditing"
                    />
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row
                v-if="data.kvliite"
                no-gutters
              >
                <b-col class="mb-4">
                  <b-form-group>
                    <div class="d-flex mb-2">
                      <span class="font-weight-600">{{ $t('tyotehtavat-joissa-voi-toimia') }}</span>
                      <EpInfoPopover
                        v-if="isEditing"
                        class="ml-2"
                        unique-id="3"
                      >
                        {{ $t('kentat-tulostetaan-kv-liitteelle') }}
                      </EpInfoPopover>
                    </div>
                    <ep-content
                      v-if="data.kvliite.tyotehtavatJoissaVoiToimia || isEditing"
                      v-model="data.kvliite.tyotehtavatJoissaVoiToimia"
                      layout="normal"
                      :is-editable="isEditing"
                    />
                  </b-form-group>
                </b-col>
              </b-row>

              <hr>

              <b-row no-gutters>
                <b-col class="mb-4">
                  <b-form-group>
                    <template #label>
                      <h3>{{ $t('peruste-koulutukset') }}</h3>
                    </template>
                    <b-table
                      striped
                      show-empty
                      :items="data.koulutukset"
                      :fields="koulutuksetFields"
                      :empty-text="$t('ei-koulutuskoodeja') "
                    >
                      <template #empty="">
                        <h4>{{ $t('ei-koulutuskoodeja') }}</h4>
                      </template>
                      <template #cell(koodi)="data">
                        <span class="font-weight-bold">{{ data.item.koulutuskoodiArvo }}</span>
                      </template>
                      <template #cell(nimi)="data">
                        {{ $kaanna(data.item.nimi) }}
                      </template>
                      <template #cell(poista)="data">
                        <div
                          v-if="isEditing"
                          class="default-icon clickable"
                          @click="poistaKoulutusKoodi(data)"
                        >
                          <EpMaterialIcon>delete</EpMaterialIcon>
                        </div>
                      </template>
                    </b-table>
                    <ep-koodisto-select
                      v-if="isEditing"
                      :store="koulutuskoodisto"
                      @add="addKoulutuskoodi(data, $event)"
                    >
                      <template #default="{ open }">
                        <ep-button
                          icon="add"
                          variant="outline"
                          @click="open"
                        >
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
                    <template #label>
                      <h3>{{ $t('korvattavat-perusteet') }}</h3>
                    </template>
                    <b-table
                      v-if="korvattavatDiaarinumerot && korvattavatDiaarinumerot.length > 0"
                      :items="korvattavatDiaarinumerot"
                      :fields="korvattavatFields"
                      responsive
                      borderless
                      striped
                      fixed
                      hover
                    >
                      <template #cell(diaarinumero)="data">
                        {{ data.item }}
                      </template>
                      <template #cell(peruste)="data">
                        <span v-if="korvattavatPerusteet[data.item]">
                          {{ $kaanna(korvattavatPerusteet[data.item].nimi) }}
                        </span>
                        <span
                          v-else-if="korvattavatPerusteet[data.item] === null"
                          class="font-italic"
                        >
                          {{ $t('ei-eperusteissa') }}
                        </span>
                        <ep-spinner v-else />
                      </template>
                      <template #cell(toiminnot)="data">
                        <div
                          v-if="isEditing"
                          class="text-center"
                        >
                          <ep-button
                            variant="link"
                            icon="delete"
                            @click="poistaKorvattava(data.item)"
                          >
                            {{ $t('poista') }}
                          </ep-button>
                        </div>
                      </template>
                    </b-table>
                    <b-input-group v-if="isEditing">
                      <b-form-input
                        :value="korvattavaDiaarinumero"
                        @input="korvattavaDiaarinumero = $event"
                      />
                      <b-input-group-append>
                        <b-button
                          variant="primary"
                          :disabled="!korvattavaDiaarinumero"
                          @click="lisaaDiaarinumero"
                        >
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
            <b-container
              fluid="xl"
              class="perustiedot-container"
            >
              <div class="d-flex">
                <h3>{{ $t('maarayskirje') }}</h3>
                <EpInfoPopover
                  v-if="isEditing"
                  class="ml-2"
                  unique-id="4"
                >
                  {{ $t('pdf-tiedoston-maksimikoko', { koko: fileMaxSize }) }}
                </EpInfoPopover>
              </div>

              <b-row no-gutters>
                <b-col class="mb-4">
                  <EpSpinner v-if="maarayskirjeFile" />

                  <ep-tiedosto-lataus
                    v-if="isEditing && !maarayskirjeFile && !maarayskirje"
                    v-model="maarayskirjeFile"
                    :file-types="['application/pdf']"
                    :as-binary="true"
                  />

                  <b-table
                    v-if="maarayskirje"
                    class="mb-2 w-90"
                    :items="liitteetMaarayskirje"
                    :fields="liitetableFields"
                  >
                    <template #cell(nimi)="{ item }">
                      <a
                        v-if="item.url"
                        :href="item.url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >{{ item.nimi }}</a>
                      <span v-else>{{ item.nimi }}</span>
                    </template>
                    <template #cell(toiminnot)="data">
                      <div
                        v-if="isEditing"
                        class="text-center"
                      >
                        <ep-button
                          variant="link"
                          icon="delete"
                          @click="poistaMaarayskirje(data.item)"
                        >
                          {{ $t('poista') }}
                        </ep-button>
                      </div>
                    </template>
                  </b-table>
                </b-col>
              </b-row>

              <template v-if="data.maarays">
                <b-row
                  v-if="isEditing || data.maarays.asiasanat[kieli].asiasana.length > 0"
                  no-gutters
                >
                  <b-col class="mb-4">
                    <b-form-group :label="$t('maarayskirjeen-asiasana')">
                      <EpMaaraysAsiasanat
                        v-model="data.maarays.asiasanat[kieli].asiasana"
                        :asiasanat="asiasanat"
                        :is-editing="isEditing"
                      />
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-row
                  v-if="isEditing || !!data.maarays.kuvaus"
                  no-gutters
                >
                  <b-col>
                    <b-form-group :label="$t('maarayskirjeen-kuvaus')">
                      <ep-content
                        v-model="data.maarays.kuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                      />
                    </b-form-group>
                  </b-col>
                </b-row>
              </template>

              <hr>

              <b-row no-gutters>
                <b-col>
                  <b-form-group>
                    <template #label>
                      <h3>{{ $t('muutosmaaraykset') }}</h3>
                    </template>
                    <EpMuutosmaaraykset
                      v-model="data.muutosmaaraykset"
                      :is-editing="isEditing"
                      :peruste-store="perusteStore"
                    />
                  </b-form-group>
                </b-col>
              </b-row>

              <hr>

              <b-row>
                <b-col class="mb-4">
                  <b-form-group>
                    <template #label>
                      <h3>{{ $t('saamen-kielelle-kaannetyt-perusteet') }}</h3>
                    </template>
                    <ep-spinner v-if="!liitteet" />
                    <div
                      v-if="isEditing"
                      class="mb-4"
                    >
                      <div class="d-flex">
                        <div class="lataaliite mb-3">
                          {{ $t('lataa-uusi-liitetiedosto') }}
                        </div>
                        <EpInfoPopover
                          v-if="isEditing"
                          class="ml-2"
                          unique-id="5"
                        >
                          {{ $t('pdf-tiedoston-maksimikoko', { koko: fileMaxSize }) }}
                        </EpInfoPopover>
                      </div>
                      <ep-tiedosto-lataus
                        v-model="kaannosFile"
                        :file-types="['application/pdf']"
                        :as-binary="true"
                      />
                    </div>
                    <b-table
                      v-if="kaannokset.length > 0"
                      :items="kaannokset"
                      :fields="kaannoksetFields"
                      responsive
                      borderless
                      striped
                      fixed
                      hover
                    >
                      <template #cell(nimi)="data">
                        <a
                          class="btn btn-link pl-0"
                          :href="data.item.url"
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="link"
                        >
                          {{ data.item.nimi }}
                        </a>
                      </template>
                      <template #cell(toiminnot)="data">
                        <div
                          v-if="isEditing"
                          class="text-center"
                        >
                          <ep-button
                            variant="link"
                            icon="delete"
                            @click="poistaLiite(data.item)"
                          >
                            {{ $t('poista') }}
                          </ep-button>
                        </div>
                      </template>
                    </b-table>
                  </b-form-group>
                </b-col>
              </b-row>

              <hr>

              <b-row v-if="isAmmatillinen">
                <b-col class="mb-4">
                  <b-form-group>
                    <template #label>
                      <h3>{{ $t('koulutusviennin-ohje') }}</h3>
                    </template>
                    <ep-spinner v-if="!liitteet" />

                    <div v-if="isEditing">
                      <div class="mb-4">
                        <EpRadio
                          v-model="data.poikkeamismaaraysTyyppi"
                          value="ei_tarvita_ohjetta"
                          name="poikkeamismaaraysTyyppi"
                          :label="$t('voi-kayttaa-tutkintoviennissa')"
                        />
                        <EpRadio
                          v-model="data.poikkeamismaaraysTyyppi"
                          value="ei_voi_poiketa"
                          name="poikkeamismaaraysTyyppi"
                          :label="$t('ei-voi-poiketa-tutkinnon-perusteista-tutkintoviennin-yhteydessa')"
                        />
                        <EpRadio
                          v-model="data.poikkeamismaaraysTyyppi"
                          value="koulutusvientiliite"
                          name="poikkeamismaaraysTyyppi"
                          :label="$t('maarays-tutkinnon-perusteista-poikkeamiseen-tutkintoviennissa')"
                        />

                        <EpButton
                          v-if="data.poikkeamismaaraysTyyppi"
                          variant="link"
                          class="no-padding"
                          @click="data.poikkeamismaaraysTyyppi = null"
                        >
                          {{ $t('tyhjenna-valinta') }}
                        </EpButton>
                      </div>
                    </div>
                    <div v-else>
                      <span>{{ poikkeamismaaraysTyyppiText }}</span>
                    </div>

                    <div v-if="data.poikkeamismaaraysTyyppi === 'koulutusvientiliite'">
                      <div v-if="isEditing">
                        <div class="d-flex">
                          <div class="lataaliite">
                            {{ $t('lataa-uusi-liitetiedosto') }}
                          </div>
                          <EpInfoPopover
                            v-if="isEditing"
                            class="ml-2"
                            unique-id="6"
                          >
                            {{ $t('pdf-tiedoston-maksimikoko', { koko: fileMaxSize }) }}
                          </EpInfoPopover>
                        </div>
                        <div
                          class="liiteohje"
                          v-html="$t('koulutusviennin-lataus-ohje')"
                        />
                        <ep-tiedosto-lataus
                          v-model="koulutusvienninOhjeFile"
                          :file-types="['application/pdf']"
                          :as-binary="true"
                        />
                      </div>
                      <b-table
                        v-if="koulutusvienninOhjeet.length > 0"
                        :items="koulutusvienninOhjeet"
                        :fields="koulutusvientiOhjeFields"
                        responsive
                        borderless
                        striped
                        fixed
                        hover
                      >
                        <template #cell(diaarinumero)="{index}">
                          <div class="d-flex">
                            <EpInput
                              v-model="koulutusvienninOhjeet[index].lisatieto"
                              type="string"
                              :is-editing="isEditing"
                              :placeholder="$t('kirjoita-diaarinumero')"
                            />
                          </div>
                        </template>
                        <template #cell(toiminnot)="data">
                          <div
                            v-if="isEditing"
                            class="text-center"
                          >
                            <ep-button
                              variant="link"
                              icon="delete"
                              @click="poistaLiite(data.item)"
                            >
                              {{ $t('poista') }}
                            </ep-button>
                          </div>
                        </template>
                      </b-table>
                    </div>

                    <b-form-group
                      :label="$t('tarkennus')"
                      class="mt-4"
                    >
                      <ep-content
                        v-model="data.poikkeamismaaraysTarkennus"
                        layout="normal"
                        :is-editable="isEditing"
                      />
                    </b-form-group>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-container>
          </b-tab>
          <b-tab
            v-if="isAmmatillinen"
            :title="$t('osaamisalat-ja-tutkintonimikkeet')"
          >
            <b-container
              fluid="lg"
              class="perustiedot-container"
            >
              <b-row no-gutters>
                <b-col class="mb-4">
                  <b-form-group>
                    <template #label>
                      <h3>{{ $t('osaamisalat') }}</h3>
                    </template>
                    <div class="text-muted font-size-small">
                      {{ $t('lisaa-tai-poista-osaamisala') }} <router-link :to="{ name: 'muodostuminen' }">
                        {{ $t('tutkinnon-muodostumisessa') }}
                      </router-link>
                    </div>
                    <b-table
                      striped
                      show-empty
                      :items="osaamisalat"
                      :fields="fields"
                      :empty-text="$t('ei-kiinnitettyja-osaamisaloja')"
                    >
                      <template #cell(koodi)="data">
                        <span class="font-weight-bold">{{ data.item.arvo }}</span>
                      </template>
                      <template #cell(nimi)="data">
                        {{ $kaanna(data.item.nimi) }}
                      </template>
                    </b-table>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row no-gutters>
                <b-col class="mb-4">
                  <b-form-group>
                    <template #label>
                      <h3>{{ $t('tutkintonimikkeet') }}</h3>
                    </template>
                    <div class="text-muted font-size-small">
                      {{ $t('lisaa-tai-poista-tutkintonimike') }} <router-link :to="{ name: 'muodostuminen' }">
                        {{ $t('tutkinnon-muodostumisessa') }}
                      </router-link>
                    </div>
                    <b-table
                      striped
                      show-empty
                      :items="tutkintonimikkeet"
                      :fields="fields"
                      :empty-text="$t('ei-kiinnitettyja-tutkintonimikkeita')"
                    >
                      <template #cell(koodi)="data">
                        <span class="font-weight-bold">{{ data.item.tutkintonimikeArvo }}</span>
                      </template>
                      <template #cell(nimi)="data">
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

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import EpTiedostoLataus from '@shared/components/EpTiedosto/EpTiedostoLataus.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpMuutosmaaraykset from '@/components/EpPerusteenTiedot/EpMuutosmaaraykset.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Api, Liitetiedostot, Koodisto, LiiteDtoTyyppiEnum, LiitetiedostotParam, baseURL } from '@shared/api/eperusteet';
import { AmmatillisetKoulutustyypit, Koulutustyyppi } from '@shared/tyypit';
import { usePerusteprojekti } from './PerusteprojektiRoute';
import { PerusteEditStore } from '@/stores/PerusteEditStore';
import { OmatPerusteetStore } from '@/stores/OmatPerusteetStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpKoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { UiKielet, Kielet } from '@shared/stores/kieli';
import _ from 'lodash';
import EpMaaraysAsiasanat from '@/components/maaraykset/EpMaaraysAsiasanat.vue';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import { KayttajaStore } from '@/stores/kayttaja';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { TyoryhmaStore } from '@/stores/TyoryhmaStore';
import { $t, $kaanna, $success, $fail, $slang, $sdt, $isAdmin } from '@shared/utils/globals';
import EpToggleGroup from '@shared/components/forms/EpToggleGroup.vue';
import EpRadio from '@shared/components/forms/EpRadio.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';

export type TietoFilter = 'laajuus' | 'voimassaolo' | 'diaarinumero' | 'paatospaivamaara' | 'koulutustyyppi' | 'perusteenkieli' | 'koulutusviento';

const perustetyyppiTietoFilters = [
  {
    tyyppi: ['digitaalinen_osaaminen'],
    filters: ['diaarinumero', 'paatospaivamaara', 'voimassaolo', 'siirtymaPaattyy', 'perusteenkieli'],
  },
  {
    tyyppi: ['kieli_kaantaja_tutkinto'],
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

const props = defineProps<{
  perusteetStore: OmatPerusteetStore;
  perusteStore: PerusteStore;
  kayttajaStore: KayttajaStore;
  tiedotteetStore: TiedotteetStore;
  muokkaustietoStore: MuokkaustietoStore;
  aikatauluStore: AikatauluStore;
  tyoryhmaStore: TyoryhmaStore;
}>();

const route = useRoute();
const store = ref<EditointiStore | null>(null);
const maarayskirjeFile = ref<any | null>(null);
const koulutusvienninOhjeFile = ref<any | null>(null);
const kaannosFile = ref<any | null>(null);
const liitteet = ref<any[] | null>(null);
const liitteenNimi = ref('');
const korvattavatPerusteet = ref<{ [diaari: string]: any }>({});
const korvattavaDiaarinumero = ref('');
const poikkeamismaaraysTyyppi = ref<'ei_tarvita_ohjetta' | 'ei_voi_poiketa' | 'koulutusvientiliite' | null>(null);
const fileMaxSize = ref(10);

const {
  isInitializing,
  perusteId,
  isAmmatillinen,
} = usePerusteprojekti({
  perusteStore: props.perusteStore,
  kayttajaStore: props.kayttajaStore,
  tiedotteetStore: props.tiedotteetStore,
  muokkaustietoStore: props.muokkaustietoStore,
  aikatauluStore: props.aikatauluStore,
  tyoryhmaStore: props.tyoryhmaStore,
});

const fetchLiitteet = async () => {
  const res = await Liitetiedostot.getAllLiitteet(Number(perusteId.value!));
  liitteet.value = _.map(res.data, liite => ({
    ...liite,
    lisatieto: liite.lisatieto || '',
    url: baseURL + LiitetiedostotParam.getLiite(perusteId.value!, liite.id!).url,
  }));
};

const koulutusvienninOhjeet = computed(() => {
  return _.filter(liitteet.value, liite => liite.tyyppi === _.toLower(LiiteDtoTyyppiEnum.KOULUTUSVIENNINOHJE));
});

const kaannokset = computed(() => {
  return _.filter(liitteet.value, liite => liite.tyyppi === _.toLower(LiiteDtoTyyppiEnum.KAANNOS));
});

const valittavatKoulutustyypit = computed(() => {
  return AmmatillisetKoulutustyypit;
});

const kielet = computed(() => {
  return UiKielet;
});

const tutkintonimikkeet = computed(() => {
  return store.value?.data?.tutkintonimikkeet || [];
});

const osaamisalat = computed(() => {
  return store.value?.data?.osaamisalat || [];
});

const korvattavatDiaarinumerot = computed(() => {
  return store.value?.data?.korvattavatDiaarinumerot || null;
});

const onProjektiChange = async (projektiId: number, perusteId: number) => {
  store.value = new EditointiStore(new PerusteEditStore(projektiId, perusteId, props.perusteStore, tallennaKoulutusvienninOhjeDiaari));
  await fetchLiitteet();
  await props.perusteStore.fetchMaaraykset();
};

// Watch handlers
watch(koulutusvienninOhjeet, async () => {
  store.value!.setData({
    ...store.value!.data,
    koulutusvienninOhjeLiitteet: koulutusvienninOhjeet.value,
  });
}, { deep: true });

watch(korvattavatDiaarinumerot, async (diaarit) => {
  if (!diaarit) return;

  const uudet: any = {};
  for (const diaarinumero of diaarit) {
    if (korvattavatPerusteet.value[diaarinumero] === undefined) {
      const res = await props.perusteetStore.findPerusteet({ diaarinumero });
      uudet[diaarinumero] = _.first(res.data) || null;
    }
  }

  korvattavatPerusteet.value = {
    ...korvattavatPerusteet.value,
    ...uudet,
  };
});

watch(maarayskirjeFile, async () => {
  if (maarayskirjeFile.value) {
    const data = new FormData();
    data.append('file', window.btoa(maarayskirjeFile.value.binary));
    data.set('nimi', maarayskirjeFile.value.file.name);
    data.set('tyyppi', 'maarayskirje');
    const maarayskirjeUuid = _.get(await Api.request({
      method: 'POST',
      url: `api/perusteet/${perusteId.value!}/liitteet/b64`,
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }), 'data');
    $success($t('kaannos-tallennettu') as string);
    await fetchLiitteet();
    maarayskirje.value = _.find(liitteet.value, liite => liite.id === maarayskirjeUuid);
    maarayskirjeFile.value = null;
  }
});

watch(koulutusvienninOhjeFile, async () => {
  if (koulutusvienninOhjeFile.value) {
    const data = new FormData();
    data.append('file', window.btoa(koulutusvienninOhjeFile.value.binary));
    data.set('nimi', koulutusvienninOhjeFile.value.file.name);
    data.set('tyyppi', 'koulutusvienninohje');
    await Api.request({
      method: 'POST',
      url: `api/perusteet/${perusteId.value!}/liitteet/b64`,
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    $success($t('koulutusvienninohje-tallennettu') as string);
    fetchLiitteet();
    koulutusvienninOhjeFile.value = null;
  }
});

watch(kaannosFile, async () => {
  if (kaannosFile.value) {
    const data = new FormData();
    data.append('file', window.btoa(kaannosFile.value.binary));
    data.set('nimi', kaannosFile.value.file.name);
    data.set('tyyppi', 'kaannos');
    await Api.request({
      method: 'POST',
      url: `api/perusteet/${perusteId.value!}/liitteet/b64`,
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    $success($t('kaannos-tallennettu') as string);
    fetchLiitteet();
    kaannosFile.value = null;
  }
});

// Computed properties
const fields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
    thStyle: { width: '80%' },
  }, {
    key: 'koodi',
    label: $t('koodi'),
  }];
});

const koulutuksetFields = computed(() => {
  return [{
    key: 'koodi',
    label: $t('koodi'),
  }, {
    key: 'nimi',
    label: $t('koulutuksen-nimi'),
  }, {
    key: 'poista',
    label: '',
  }];
});

const korvattavatFields = computed(() => {
  return [{
    key: 'diaarinumero',
    label: $t('diaarinumero'),
    thStyle: { width: '20%' },
    sortable: true,
  }, {
    key: 'peruste',
    label: $t('perusteen-nimi'),
    sortable: true,
  }, {
    key: 'toiminnot',
    label: '',
    thStyle: { width: '10%', borderBottom: '0px' },
    sortable: false,
  }];
});

const liitetableFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
    thStyle: { width: '60%' },
    sortable: false,
    thClass: 'border-bottom-1',
    tdClass: 'align-middle',
  }, {
    key: 'luotu',
    label: $t('julkaistu'),
    sortable: false,
    thClass: 'border-bottom-1',
    tdClass: 'align-middle',
    formatter: (value: any, key: any, item: any) => {
      return $sdt(value);
    },
  }, {
    key: 'toiminnot',
    label: '',
    thStyle: { width: '10%' },
    sortable: false,
    thClass: 'border-bottom-1',
    tdClass: 'align-middle',
  }];
});

const koulutusvientiOhjeFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
    thStyle: { width: '50%' },
    tdClass: ['liite-nimi', 'align-middle'],
    sortable: false,
  }, {
    key: 'diaarinumero',
    label: $t('diaarinumero'),
    thStyle: { width: '25%' },
    tdClass: 'align-middle',
    sortable: false,
  }, {
    key: 'luotu',
    label: $t('julkaistu'),
    thStyle: { width: '15%' },
    tdClass: 'align-middle',
    sortable: false,
    formatter: (value: any, key: any, item: any) => {
      return $sdt(value);
    },
  }, {
    key: 'toiminnot',
    label: '',
    thStyle: { width: '10%' },
    sortable: false,
  }];
});

const kaannoksetFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
    thStyle: { width: '40%' },
    sortable: false,
  }, {
    key: 'luotu',
    label: $t('julkaistu'),
    sortable: false,
    formatter: (value: any, key: any, item: any) => {
      return $sdt(value);
    },
  }, {
    key: 'toiminnot',
    label: '',
    thStyle: { width: '10%' },
    sortable: false,
  }];
});

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const asiasanat = computed(() => {
  if (_.isEmpty(store.value?.supportData?.asiasanat?.[kieli.value])) {
    return [];
  }
  return store.value?.supportData.asiasanat[kieli.value];
});

const peruste = computed(() => {
  return store.value?.data || {};
});

const koulutustyyppiFilters = computed(() => {
  return _.find(koulutustyyppiTietoFilters, filter => _.includes(filter.koulutustyypit, peruste.value.koulutustyyppi))
    || _.find(perustetyyppiTietoFilters, filter => _.includes(filter.tyyppi, peruste.value.tyyppi));
});

const tietoFilters = computed(() => {
  return _.get(koulutustyyppiFilters.value ? koulutustyyppiFilters.value : _.find(koulutustyyppiTietoFilters, filter => _.includes(filter.koulutustyypit, 'default')), 'filters');
});

const tyypinVaihtoSallittu = computed(() => {
  return isAmmatillinen.value && $isAdmin() && _.includes(perusteenTyypit.value, peruste.value.tyyppi);
});

const perusteenTyypit = computed(() => {
  return ['normaali', 'amosaayhteinen'];
});

const amosaaYhteinen = computed({
  get: () => store.value.data.tyyppi === 'amosaayhteinen',
  set: (value) => store.value.setData({
    ...store.value!.data,
    tyyppi: value ? 'amosaayhteinen' : 'normaali',

  }),
});

const poikkeamismaaraysTyyppiText = computed(() => {
  if (store.value?.data?.poikkeamismaaraysTyyppi === 'ei_tarvita_ohjetta') {
    return $t('voi-kayttaa-tutkintoviennissa');
  }
  else if (store.value?.data?.poikkeamismaaraysTyyppi === 'ei_voi_poiketa') {
    return $t('ei-voi-poiketa-tutkinnon-perusteista-tutkintoviennin-yhteydessa');
  }
  return '';
});

const maarayskirje = computed({
  get: () => {
    const maarayskirjeLiite = store.value?.data?.maarayskirje?.liitteet[$slang.value];
    if (maarayskirjeLiite) {
      return _.find(liitteet.value, liite => liite.id === maarayskirjeLiite.id);
    }
    return null;
  },
  set: (liite: any) => {
    store.value!.setData({
      ...store.value!.data,
      maarayskirje: {
        liitteet: {
          ...(store.value!.data.maarayskirje?.liitteet ? store.value!.data.maarayskirje?.liitteet : []),
          [$slang.value]: liite,
        },
      },
    });
  },
});

const maarayskirjeUrl = computed(() => {
  if (maarayskirje.value) {
    return `/eperusteet-service/api/perusteet/${perusteId.value!}/liitteet/${maarayskirje.value.id}`;
  }
  else {
    return null;
  }
});

const liitteetMaarayskirje = computed(() => {
  return maarayskirje.value
    ? [
      {
        ...maarayskirje.value,
        url: maarayskirjeUrl.value,
      },
    ] : [];
});

// Methods
const filtersContain = (filter: string) => {
  return _.includes(tietoFilters.value, filter);
};

const koulutuskoodisto = new KoodistoSelectStore({
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

const poistaMaarayskirje = async (maarayskirje: any) => {
  await poistaLiite(maarayskirje);
  store.value!.setData({
    ...store.value!.data,
    maarayskirje: {
      ...store.value?.data.lue.maarayskirje,
      liitteet: _.omit(store.value?.data.maarayskirje.liitteet, $slang.value),
    },
  });
};

const poistaLiite = async (item: any) => {
  try {
    await Liitetiedostot._delete(Number(perusteId.value!), item.id);
    $success($t('liitetiedoston-poisto-onnistui') as string);
    fetchLiitteet();
  }
  catch (err) {
    $fail($t('liitetiedoston-poisto-epaonnistui') as string);
    console.log(err);
  }
};

const lisaaDiaarinumero = () => {
  const dataValue = store.value?.data;
  store.value!.setData({
    ...dataValue,
    korvattavatDiaarinumerot: [
      ...dataValue?.korvattavatDiaarinumerot || [],
      korvattavaDiaarinumero.value,
    ],
  });
  korvattavaDiaarinumero.value = '';
};

const poistaKorvattava = (diaarinumero: string) => {
  const dataValue = store.value?.data;
  store.value!.setData({
    ...dataValue,
    korvattavatDiaarinumerot: _.reject(dataValue?.korvattavatDiaarinumerot, x => x === diaarinumero),
  });
};

const addKoulutuskoodi = (data: any, koodi: any) => {
  data.koulutukset = [...data.koulutukset, {
    nimi: koodi.nimi,
    koulutuskoodiUri: koodi.uri,
    koulutuskoodiArvo: koodi.arvo,
  }];
};

const poistaKoulutusKoodi = ({ item }: { item: any }) => {
  store.value!.setData({
    ...store.value?.data,
    koulutukset: _.filter(store.value?.data.koulutukset, koulutus => koulutus.koulutuskoodiUri !== item.koulutuskoodiUri),
  });
};

const tallennaKoulutusvienninOhjeDiaari = async () => {
  if (!_.isEmpty(koulutusvienninOhjeet.value)) {
    await Promise.all(_.map(koulutusvienninOhjeet.value, liite =>
      Liitetiedostot.paivitaLisatieto(perusteId.value!, liite.id, liite.lisatieto)));
  }
};

// Setup watch for projektiId
onMounted(async () => {
  const projektiIdNumber = _.parseInt(route.params.projektiId as string);
  if (projektiIdNumber) {
    await onProjektiChange(projektiIdNumber, perusteId.value!);
  }
});
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

:deep(.liite-nimi) {
  overflow-x: auto;
}
</style>
