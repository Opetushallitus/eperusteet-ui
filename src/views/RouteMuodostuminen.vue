<template>
  <div>
    <ep-spinner v-if="!store || !peruste" />
    <EpEditointi v-else :store="store" :allowSave="tarkistaTallennusLeikelauta" :allowCancel="tarkistaPeruutusLeikelauta">
      <template #header="{ data }">
        <h2>{{ $t('tutkinnon-muodostuminen') }}</h2>
      </template>
      <template #default="{ data, isEditing }">
        <div>
          <div class="upper mb-3">
            <b-form-group :label="$t('rakenteen-kuvaus')">
              <ep-content v-model="data.rakenne.kuvaus" layout="normal" :is-editable="isEditing"></ep-content>
            </b-form-group>
          </div>
          <div class="lower">
            <h5>
              <span>{{ $kaanna(peruste.nimi) }}</span>
              <span class="ml-2 text-nowrap">
                <span :class="{ 'text-danger': laskettuLaajuus < vaadittuLaajuus }">
                  {{ laskettuLaajuus }}
                </span>
                / {{ vaadittuLaajuus }} {{ laajuustyyppi }}</span>
              <ep-button variant="link" icon="pen" @click="editMuodostuminen" v-if="isEditing"></ep-button>
            </h5>
            <div class="filters">
              <ep-search v-model="query" :placeholder="$t('etsi-rakenteesta')" />
            </div>
            <div class="tree mt-3">
              <div class="drag-area p-3 d-flex">
                <div class="flex-grow-1">
                  <div class="d-flex actions pb-3 justify-content-between">
                    <ep-button @click="toggleDescription" variant="link">
                      {{ $t('nayta-ryhmien-kuvaukset') }}
                    </ep-button>
                    <ep-button @click="addRyhma" variant="outline" icon="plus" v-if="isEditing">
                      {{ $t('lisaa-ryhma-rakenteeseen') }}
                    </ep-button>
                    <EpRakenneModal
                      v-model="uusi.ryhma"
                      ref="eprakennemodal"
                      @save="addUusi(data.rakenne)"/>
                  </div>
                  <div class="drag-area-left mr-3">
                    <div class="d-flex align-items-center mb-1">
                      <div class="flex-shrink-1 font-weight-bold">
                        {{ $t('rakenne') }}
                         <span class="btn-link" @click="toggleRakenne">({{$t('avaa')}} / {{$t('sulje')}})</span>
                      </div>
                      <div class="flex-grow-1">
                      </div>
                      <div style="width: 100px" class="text-center font-weight-bold">
                        {{$t('osaamispiste')}}
                      </div>
                      <div style="width: 80px">
                      </div>
                    </div>
                    <ep-spinner v-if="!data" />
                    <div class="p-3 helptext text-muted text-center" v-else-if="data.rakenne.osat.length === 0">
                      <span v-if="!isEditing">
                        {{ $t('luo-tutkinnolle-rakenne-muokkaamalla-ohje') }}
                      </span>
                      <span v-else>
                        {{ $t('luo-tutkinnolle-rakenne-ohje') }}
                      </span>
                    </div>
                    <MuodostumisNode
                      v-model="data.rakenne.osat"
                      ref="root"
                      :is-editing="isEditing"
                      :tutkinnonOsatMap="tutkinnonOsatMap"
                      :copyToClipBoard="copy">
                    </MuodostumisNode>
                  </div>
                </div>
                <div class="drag-area-right" v-if="isEditing">
                  <div class="menu p-3">
                    <h5 class="font-weight-600">{{ $t('leikelauta') }}</h5>
                    <div class="mt-3">
                      <draggable v-model="leikelauta" v-bind="optionsLeikelauta" tag="div" class="leikelauta" :class="{'empty': leikelauta.length === 0}" @add="onLeikelautaAdd">
                        <div v-for="lauta in leikelautaWithColor"
                          :key="'leikelauta' + (lauta.tunniste || lauta.uuid)"
                          class="mb-1 d-flex justify-content-center align-items-center draggable kopioitava">
                          <div class="colorblock" :style="{ height: '54px', background: lauta.color }"></div>
                          <div class="flex-grow-1 paaryhma-label pl-2 noselect">
                            {{ $kaanna(lauta.nimi) }}
                            <div v-if="lauta.osat && lauta.osat.length > 0">({{lauta.osat.length}}
                              <span v-if="lauta.osat.length === 1">{{$t('ryhma')}}</span>
                              <span v-else>{{$t('ryhmaa')}}</span>)
                            </div>
                          </div>
                        </div>
                      </draggable>
                    </div>

                    <h5 class="mt-4 font-weight-600">{{ $t('paaryhmat') }}</h5>
                    <div class="mt-3">
                      <draggable :value="paaryhmat" v-bind="optionsPaaryhma" tag="div" class="paaryhmat">
                        <div v-for="ryhma in paaryhmat" :key="ryhma.uuid" class="mb-1 d-flex justify-content-center paaryhma align-items-center draggable">
                          <div class="colorblock" :style="{ height: '44px', background: colorMap[ryhma.kind] }"></div>
                          <div class="flex-grow-1 paaryhma-label pl-2 noselect">
                            {{ $t(ryhma.label) }}
                          </div>
                        </div>
                      </draggable>
                    </div>

                    <h5 class="mt-4 font-weight-600">{{ $t('tutkinnon-osat') }}</h5>
                    <div class="mt-3">
                      <ep-search v-model="queryTutkinnonOsa" :placeholder="$t('etsi-tutkinnon-osaa')" />
                      <div class="ml-1 mt-1">
                        <ep-toggle v-model="showUnusedTutkinnonOsat" :isSWitch="false">
                          <span class="noselect">
                            {{ $t('nayta-kayttamattomat') }}
                          </span>
                        </ep-toggle>
                      </div>
                      <draggable :value="tutkinnonosatPaged" v-bind="optionsTutkinnonOsat" tag="div">
                        <div v-for="tosa in tutkinnonosatPaged" :key="tosa.id" class="mb-1 d-flex align-items-center p-2 pr-3 m-1 tosa draggable tosa">
                          <div class="grip mr-2" v-if="isEditing">
                            <fas icon="grip-vertical"/>
                          </div>
                          <div class="flex-grow-1">
                            {{ $kaanna(tosa.nimi) }} <span v-if="tosa.tutkinnonOsa.koodiArvo">({{tosa.tutkinnonOsa.koodiArvo}})</span>
                          </div>
                          <div class="laajuus">
                            {{ tosa.laajuus }}
                          </div>
                        </div>
                      </draggable>
                      <b-pagination
                        v-if="tutkinnonOsat && tutkinnonOsat.length > 0"
                        v-model="tutkinnonosatSivu"
                        :total-rows="tutkinnonOsat.length"
                        :per-page="sivukoot"
                        aria-controls="tutkinnonosat"
                        align="center" />
                    </div>

                    <h5 class="mt-4 font-weight-600">{{ $t('osaamisalat') }}</h5>
                    <div>
                      <ep-button @click="lisaaOsaamisala" icon="plus" variant="outline">
                        {{ $t('lisaa-osaamisala') }}
                      </ep-button>
                      <draggable :value="osaamisalatPaged" v-bind="optionsKoodit" tag="div">
                        <div v-for="(ryhma, index) in osaamisalatPaged" :key="'osaamisala' + index" class="mb-1 d-flex justify-content-center align-items-center draggable osaamisalat">
                          <div class="colorblock" :style="{ border:'1px solid ' + colorMap['osaamisala'],  background: colorMap['osaamisala'] }">
                            <fas icon="grip-vertical"/>
                          </div>
                          <ep-koodisto-select :store="osaamisalaStore" v-if="isEditing" :value="index" @add="osaamisalaKoodiLisays" class="w-100">
                            <template #default="{ open }">
                              <b-input-group class="w-100 d-flex">
                                <ep-input class="koodi-input flex-grow-1"
                                  v-if="!ryhma.osaamisala.osaamisalakoodiUri.startsWith('temporary')"
                                  :value="$kaanna(ryhma.nimi) + ' (' + ryhma.osaamisala.osaamisalakoodiArvo + ')'"
                                  :isEditing="true"
                                  :disabled="true"/>
                                <ep-input class="koodi-input flex-grow-1"
                                  v-else
                                  v-model="ryhma.nimi"
                                  :isEditing="true"
                                  :disabled="false"
                                  :change="() => osaamisalaNimiChange(ryhma, index)"/>
                                <b-input-group-append>
                                  <b-button @click="open" icon="plus" variant="primary">
                                    {{ $t('hae') }}
                                  </b-button>
                                </b-input-group-append>
                              </b-input-group>
                            </template>
                          </ep-koodisto-select>
                          <div class="flex-shrink pl-2">
                            <ep-button @click="poistaOsaamisala(index)" variant="link" icon="roskalaatikko"  v-if="isEditing"></ep-button>
                          </div>
                        </div>
                      </draggable>
                      <b-pagination
                        v-if="osaamisalat && osaamisalat.length > 0"
                        v-model="osaamisalatSivu"
                        :total-rows="osaamisalat.length"
                        :per-page="sivukoot"
                        aria-controls="osaamisalat"
                        align="center" />
                    </div>

                    <h5 class="mt-4 font-weight-600">{{ $t('tutkintonimikkeet') }}</h5>
                    <div>
                      <ep-button @click="lisaaTutkintonimike" icon="plus" variant="outline">
                        {{ $t('lisaa-tutkintonimike') }}
                      </ep-button>

                      <draggable :value="tutkintonimikkeetPaged" v-bind="optionsKoodit" tag="div">
                        <div v-for="(ryhma, index) in tutkintonimikkeetPaged" :key="ryhma.tutkintonimike.uri" class="mb-1 d-flex justify-content-center align-items-center draggable tutkintonimikkeet">
                          <div class="colorblock" :style="{ border:'1px solid ' + colorMap['tutkintonimike'], background: colorMap['tutkintonimike'] }">
                            <fas icon="grip-vertical"/>
                          </div>
                           <ep-koodisto-select :store="tutkintonimikeStore" v-if="isEditing" :value="index" @add="tutkintonimikeKoodiLisays" class="w-100">
                            <template #default="{ open }">
                              <b-input-group class="w-100 d-flex">
                                <ep-input class="koodi-input flex-grow-1"
                                  v-if="!ryhma.tutkintonimike.uri.startsWith('temporary')"
                                  :value="$kaanna(ryhma.nimi) + ' (' + ryhma.tutkintonimike.arvo + ')'"
                                  :isEditing="true"
                                  :disabled="true"/>
                                <ep-input class="koodi-input flex-grow-1"
                                  v-else
                                  v-model="ryhma.nimi"
                                  :isEditing="true"
                                  :disabled="!ryhma.tutkintonimike.uri.startsWith('temporary')"
                                  :change="() => tutkintonimikeNimiChange(ryhma, index)"/>
                                <b-input-group-append>
                                  <b-button @click="open" icon="plus" variant="primary">
                                    {{ $t('hae') }}
                                  </b-button>
                                </b-input-group-append>
                              </b-input-group>
                            </template>
                          </ep-koodisto-select>
                          <div class="flex-shrink pl-2">
                            <ep-button @click="poistaTutkintonimike(index)" variant="link" icon="roskalaatikko" v-if="isEditing"></ep-button>
                          </div>
                        </div>
                      </draggable>
                      <b-pagination
                        v-if="tutkintonimikkeet && tutkintonimikkeet.length > 0"
                        v-model="tutkintonimikkeetSivu"
                        :total-rows="tutkintonimikkeet.length"
                        :per-page="sivukoot"
                        aria-controls="tutkintonimikkeet"
                        align="center" />
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <b-modal ref="editModal" size="lg">
          <template #modal-header>
            <h2>{{ $t('muokkaa') }}: {{ $kaanna({}) }}</h2>
          </template>

          <template #default>
            <div>
              <b-form-group :label="$t('laajuus')">
                <div class="d-flex align-items-center">
                  <div>
                    <ep-input type="number" is-editing v-model="data.rakenne.muodostumisSaanto.laajuus.minimi">
                    </ep-input>
                  </div>
                  <div class="ml-2">
                    {{$t('osaamispiste')}}
                  </div>
                </div>
              </b-form-group>
            </div>
          </template>
        </b-modal>
      </template>
    </EpEditointi>

  </div>
</template>

<script lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpJarjesta from '@shared/components/EpJarjesta/EpJarjesta.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import MuodostumisNode from '@/components/muodostuminen/MuodostumisNode.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { MuodostuminenStore } from '@/stores/MuodostuminenStore';
import { Koodisto } from '@shared/api/eperusteet';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { Watch, Prop, Component, Vue, Provide, ProvideReactive } from 'vue-property-decorator';
import { BrowserStore } from '@shared/stores/BrowserStore';
import _ from 'lodash';
import draggable from 'vuedraggable';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { v4 as genUuid } from 'uuid';
import { Kielet } from '@shared/stores/kieli';
import EpRakenneModal from '@/components/muodostuminen/EpRakenneModal.vue';
import { DefaultRyhma, ryhmaTemplate, ColorMap, RakenneMainType, RakenneModuuliType, rakenneNodecolor } from '@/components/muodostuminen/utils';

@Component({
  components: {
    EpButton,
    EpContent,
    EpEditointi,
    EpIcon,
    EpInput,
    EpJarjesta,
    EpKoodistoSelect,
    EpMainView,
    EpSearch,
    EpSpinner,
    EpToggle,
    MuodostumisNode,
    draggable,
    EpRakenneModal,
  },
  inject: [],
})
export default class RouteMuodostuminen extends PerusteprojektiRoute {
  @Prop({ required: true })
  private browserStore!: BrowserStore;

  @Prop({ required: true })
  private tutkinnonOsaStore!: TutkinnonOsaStore;

  private query = '';
  private queryTutkinnonOsa = '';
  private showUnusedTutkinnonOsat = false;
  private store: EditointiStore | null = null;
  private uusi: any | null = DefaultRyhma;
  private naytaKuvaukset = false;
  private naytaRakenne = true;
  private nimiValinta: 'paikallinen' | 'tutkinnonosato' | 'korkeakoulu' | 'yhteinen' | 'muu' | null = null;
  private osaamisalatSivu = 1;
  private tutkintonimikkeetSivu = 1;
  private tutkinnonosatSivu = 1;
  private sivukoot = 5;
  private leikelauta: any[] = [];

  private osaamisalaStore = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('osaamisala', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  private tutkintonimikeStore = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('tutkintonimikkeet', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  get peruste() {
    return this.perusteStore.peruste.value;
  }

  get tutkinnonOsatRaw() {
    return this.tutkinnonOsaStore.tutkinnonOsat.value;
  }

  get tutkinnonOsatMap() {
    return _.keyBy(this.tutkinnonOsatRaw, 'id');
  }

  get laajuustyyppi() {
    return 'osp';
  }

  get vaadittuLaajuus() {
    return this.store?.data.value?.rakenne.muodostumisSaanto?.laajuus?.minimi;
  }

  get laskettuLaajuus() {
    return _(this.store?.data.value?.rakenne.osat)
      .map(osa => osa.muodostumisSaanto?.laajuus?.maksimi || osa.muodostumisSaanto?.laajuus?.minimi || this.tutkinnonOsatMap[osa._tutkinnonOsaViite]?.laajuus || 0)
      .filter()
      .sum();
  }

  get colorMap() {
    return ColorMap;
  }

  get browserEvents() {
    return {
      focused: this.browserStore.activeElement.value,
      key: this.browserStore.latestKeypress.value,
    };
  }

  @Watch('browserEvents')
  onInput({ focused, key }) {
    if (focused && key) {
      const uuid = focused.getAttribute('moduuli');
      if (uuid) {
        const dir = {
          ArrowDown: 'down',
          ArrowUp: 'up',
          ArrowLeft: 'left',
          ArrowRight: 'right',
        }[key.code];
        if (key.ctrlKey && dir) {
          (this.$refs.root as any).move(uuid, dir);
        }
      }
    }
  }

  get paaryhmat(): RakenneMainType[] {
    return [{
      kind: 'pakollinen',
      label: 'rakenne-moduuli-pakollinen',
      uuid: genUuid(),
      create: () => ({
        ...ryhmaTemplate('rakenne-moduuli-pakollinen', this),
      }),
    }, {
      kind: 'valinnainen',
      label: 'rakenne-moduuli-valinnainen',
      uuid: genUuid(),
      create: () => ({
        ...ryhmaTemplate('rakenne-moduuli-valinnainen', this),
      }),
    }, {
      kind: 'ammatilliset',
      label: 'rakenne-moduuli-ammatilliset',
      uuid: genUuid(),
      create: () => ({
        ...ryhmaTemplate('rakenne-moduuli-ammatilliset', this),
      }),
    }, {
      kind: 'yhteiset',
      label: 'rakenne-moduuli-yhteiset',
      uuid: genUuid(),
      create: () => ({
        ...ryhmaTemplate('rakenne-moduuli-yhteiset', this),
      }),
    }, {
      kind: 'paikalliset',
      label: 'rakenne-moduuli-paikalliset',
      uuid: genUuid(),
      create: () => ({
        ...ryhmaTemplate('rakenne-moduuli-paikalliset', this),
      }),
    }];
  }

  get optionsKoodit() {
    return {
      ...this.defaultOptions,
      disabled: !this.isEditing,
      group: {
        name: 'rakennepuu',
        pull: 'clone',
        put: false,
      },
      clone(original) {
        return {
          ...original,
          muodostumisSaanto: {
            laajuus: {},
          },
        };
      },
    };
  }

  get optionsTutkinnonOsat() {
    return {
      ...this.defaultOptions,
      disabled: !this.isEditing,
      group: {
        name: 'rakennepuu',
        pull: 'clone',
        put: false,
      },
      clone(original) {
        return {
          kuvaus: null,
          vieras: null,
          tunniste: null,
          pakollinen: false,
          erikoisuus: null,
          _tutkinnonOsaViite: '' + original.id,
        };
      },
    };
  }

  get isEditing() {
    return !!this.store?.isEditing;
  }

  get optionsPaaryhma() {
    return {
      ...this.defaultOptions,
      disabled: !this.isEditing,
      group: {
        name: 'rakennepuu',
        pull: 'clone',
        put: false,
      },
      clone(original) {
        if (original.create) {
          return original.create();
        }
      },
    };
  }

  get optionsLeikelauta() {
    const self = this;
    return {
      ...this.defaultOptions,
      disabled: !this.isEditing,
      group: {
        name: 'rakennepuu',
      },
      emptyInsertThreshold: 10,
    };
  }

  onLeikelautaAdd(evt) {
    this.leikelauta = _.map(this.leikelauta, leike => {
      return {
        ...this.recursiveClone(leike),
      };
    });
  }

  get defaultOptions() {
    return {
      sort: false,
      scrollSensitivity: 100,
      forceFallback: true,
    };
  }

  get liitetytOsat() {
    if (!this.store) {
      return null;
    }
    const osat = [] as any[];
    const walk = (node) => {
      if (node) {
        if (node._tutkinnonOsaViite) {
          osat.push(node);
        }
        _.forEach(node.osat, walk);
      }
    };
    walk(this.store.data.value?.rakenne);
    return _.keyBy(osat, '_tutkinnonOsaViite');
  }

  @ProvideReactive('kayttamattomatTutkinnonOsat')
  get kayttamattomatTutkinnonOsat() {
    if (!this.liitetytOsat) {
      return [];
    }
    return _.filter(this.tutkinnonOsatRaw, osa => !this.liitetytOsat![osa.id!]);
  }

  get tutkinnonOsat() {
    return _(this.showUnusedTutkinnonOsat
      ? this.kayttamattomatTutkinnonOsat : this.tutkinnonOsatRaw)
      .filter(this.$filterBy('nimi', this.queryTutkinnonOsa))
      .sortBy(tosa => this.$kaanna(tosa.nimi as any))
      .value();
  }

  editMuodostuminen() {
    (this.$refs.editModal as any).show();
  }

  async onProjektiChange(projektiId: number) {
    if (this.perusteId) {
      const store = new MuodostuminenStore(this.perusteId);
      this.store = new EditointiStore(store);
      this.tutkinnonOsaStore.fetch();
    }
  }

  toggleDescription() {
    this.naytaKuvaukset = !this.naytaKuvaukset;
    (this.$refs['root'] as any).toggleDescription(this.naytaKuvaukset);
  }

  toggleRange() {
    this.uusi.useRange = !this.uusi.useRange;
    if (this.uusi.useRange) {
      this.uusi.ryhma.muodostumisSaanto.laajuus.maksimi = 0;
    }
    else {
      delete this.uusi.ryhma.muodostumisSaanto.laajuus.maksimi;
    }
  }

  addUusi(root) {
    const template = ryhmaTemplate(this.uusi.tyyppi, this);
    if (this.uusi) {
      root.osat = [{
        ...template,
        ...this.uusi.ryhma,
      }, ...root.osat];
    }
  }

  addRyhma() {
    this.uusi = _.cloneDeep(DefaultRyhma);
    (this.$refs.eprakennemodal as any).show(true);
  }

  @ProvideReactive('tutkintonimikkeet')
  get tutkintonimikkeet() {
    return _.map(this.store?.data?.value?.tutkintonimikkeet, tutkintonimike => {
      return {
        ...ryhmaTemplate('tutkintonimike', this),
        nimi: tutkintonimike.nimi,
        tutkintonimike: {
          nimi: tutkintonimike.nimi,
          uri: tutkintonimike.tutkintonimikeUri,
          arvo: tutkintonimike.tutkintonimikeArvo,
        },
      };
    });
  }

  tutkintonimikeSivutettuIndeksi(tutkintonimikeIndex) {
    return tutkintonimikeIndex + (this.tutkintonimikkeetSivu - 1) * this.sivukoot;
  }

  tutkintonimikeNimiChange(ryhma, tutkintonimikeIndex) {
    this.store?.setData(
      {
        ...this.store.data.value,
        tutkintonimikkeet: _.map(this.store.data.value.tutkintonimikkeet,
          (tutkintonimike, index) => index === this.tutkintonimikeSivutettuIndeksi(tutkintonimikeIndex) ? { ...tutkintonimike, nimi: ryhma.nimi } : tutkintonimike),
      });
  }

  lisaaTutkintonimike() {
    this.store?.setData(
      {
        ...this.store.data.value,
        tutkintonimikkeet: [
          ...this.store.data.value.tutkintonimikkeet,
          {
            nimi: {},
            tutkintonimikeUri: 'temporary_tutkintonimikkeet_' + genUuid(),
          },
        ],
      });
  }

  tutkintonimikeKoodiLisays(koodi, tutkintonimikeIndex) {
    this.store?.setData(
      {
        ...this.store.data.value,
        tutkintonimikkeet: _.map(this.store.data.value.tutkintonimikkeet,
          (tutkintonimike, index) => index === this.tutkintonimikeSivutettuIndeksi(tutkintonimikeIndex)
            ? {
              nimi: koodi.nimi,
              'tutkintonimikeUri': koodi.uri,
              'tutkintonimikeArvo': koodi.arvo,
            }
            : tutkintonimike),
      });
  }

  @ProvideReactive('osaamisalat')
  get osaamisalat() {
    return _.map(this.store?.data?.value?.osaamisalat, osaamisala => {
      return {
        ...ryhmaTemplate('osaamisala', this),
        nimi: osaamisala.nimi,
        osaamisala: {
          nimi: osaamisala.nimi,
          'osaamisalakoodiArvo': osaamisala.arvo,
          'osaamisalakoodiUri': osaamisala.uri,
        },
      };
    });
  }

  osaamisalaNimiChange(ryhma, osaamisalaIndex) {
    this.store?.setData(
      {
        ...this.store.data.value,
        osaamisalat: _.map(this.store.data.value.osaamisalat,
          (osaamisala, index) => index === this.osaamisalaSivutettuIndeksi(osaamisalaIndex) ? { ...osaamisala, nimi: ryhma.nimi } : osaamisala),
      });
  }

  lisaaOsaamisala() {
    this.store?.setData(
      {
        ...this.store.data.value,
        osaamisalat: [
          ...this.store.data.value.osaamisalat,
          {
            nimi: {},
            uri: 'temporary_osaamisala_' + genUuid(),
          },
        ],
      });
  }

  osaamisalaSivutettuIndeksi(osaamisalaIndex) {
    return osaamisalaIndex + (this.osaamisalatSivu - 1) * this.sivukoot;
  }

  osaamisalaKoodiLisays(koodi, osaamisalaIndex) {
    this.store?.setData(
      {
        ...this.store.data.value,
        osaamisalat: _.map(this.store.data.value.osaamisalat,
          (osaamisala, index) => index === this.osaamisalaSivutettuIndeksi(osaamisalaIndex) ? koodi : osaamisala),
      });
  }

  poistaOsaamisala(osaamisalaIndex) {
    this.store?.setData(
      {
        ...this.store.data.value,
        osaamisalat: _.filter(this.store.data.value.osaamisalat, (osaamisala, index) => index !== this.osaamisalaSivutettuIndeksi(osaamisalaIndex)),
      });
  }

  poistaTutkintonimike(tutkintonimikeIndex) {
    this.store?.setData(
      {
        ...this.store.data.value,
        tutkintonimikkeet: _.filter(this.store.data.value.tutkintonimikkeet, (tutkintonimike, index) => index !== this.tutkintonimikeSivutettuIndeksi(tutkintonimikeIndex)),
      });
  }

  get addModalInvalid() {
    if (this.uusi.ryhma.nimi) {
      return _.isEmpty(this.uusi.ryhma.nimi[Kielet.getSisaltoKieli.value]) || this.uusi.tyyppi === null;
    }
    return true;
  }

  get osaamisalatPaged() {
    return this.pageSliced(this.osaamisalat, this.osaamisalatSivu);
  }

  get tutkintonimikkeetPaged() {
    return this.pageSliced(this.tutkintonimikkeet, this.tutkintonimikkeetSivu);
  }

  get tutkinnonosatPaged() {
    return this.pageSliced(this.tutkinnonOsat, this.tutkinnonosatSivu);
  }

  pageSliced(array, page) {
    return _.slice(array, (page - 1) * this.sivukoot, ((page - 1) * this.sivukoot) + this.sivukoot);
  }

  toggleRakenne() {
    this.naytaRakenne = !this.naytaRakenne;
    this.store?.setData(
      {
        ...this.store.data.value,
        rakenne: {
          ...this.store.data.value.rakenne,
          osat: _.map(this.store.data.value.rakenne.osat, osa => this.toggleOsa(osa, this.naytaRakenne)),
        },
      });
  }

  toggleOsa(osa, isOpen) {
    return {
      ...osa,
      isOpen,
      osat: _.map(osa.osat, lapsi => this.toggleOsa(lapsi, isOpen)),
    };
  }

  copy(val) {
    const clone = _.cloneDeep(val);
    this.leikelauta = [
      ...this.leikelauta,
      this.recursiveClone(clone),
    ];
  }

  recursiveClone(clone) {
    return {
      ...clone,
      ...(clone.uuid && { uuid: genUuid() }),
      ...(clone.tunniste && { tunniste: genUuid() }),
      osat: _.map(clone.osat, osa => this.recursiveClone(osa)),
    };
  }

  get leikelautaWithColor() {
    return _.map(this.leikelauta, lauta => {
      return {
        ...lauta,
        color: rakenneNodecolor(lauta, false, this),
      };
    });
  }

  async tarkistaTallennusLeikelauta() {
    if (_.size(this.leikelauta) > 0) {
      const ok = await this.$bvModal.msgBoxConfirm(
        Kielet.kaannaOlioTaiTeksti('leikelauta-varoitus'), {
          title: Kielet.kaannaOlioTaiTeksti('vahvista-tallennus'),
          okTitle: Kielet.kaannaOlioTaiTeksti('tallenna'),
          cancelTitle: Kielet.kaannaOlioTaiTeksti('peruuta'),
          size: 'lg',
        });

      if (ok) {
        this.leikelauta = [];
      }

      return ok;
    }

    return true;
  }

  async tarkistaPeruutusLeikelauta() {
    if (_.size(this.leikelauta) > 0) {
      const ok = await this.$bvModal.msgBoxConfirm(
        Kielet.kaannaOlioTaiTeksti('leikelauta-varoitus'), {
          title: Kielet.kaannaOlioTaiTeksti('vahvista-peruutus'),
          okTitle: Kielet.kaannaOlioTaiTeksti('vahvista-peruutus'),
          cancelTitle: Kielet.kaannaOlioTaiTeksti('peruuta'),
          size: 'lg',
        });

      if (ok) {
        this.leikelauta = [];
      }

      return ok;
    }

    return true;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
.tree {
  background: #f2f2f2;

  .drag-area {
    .drag-area-left {
      .helptext {
        background: #eceaea;
        min-height: 20px;
        border: 1px dashed #cfcece;
      }

    }

    .drag-area-right {
      .tosa {
        background: #f9fbfe;
      }

      .menu {
        background: #fff;
        width: 400px;

        .paaryhma {
          height: 44px;
          background: #f0f4fb;
          border-bottom-right-radius: 4px;
          border-top-right-radius: 4px;
        }

        .kopioitava {
          height: 54px;
          background: #ffffff;
          border-bottom-right-radius: 4px;
          border-top-right-radius: 4px;
        }
      }
    }
  }
}

.leikelauta {
  padding: 10px;
  background: #f7f7f7;
  border:1px solid #e0e0e1;
  border-radius: 5px;

  &.empty {
    height: 80px;
  }
}

.draggable {
  cursor: grab;

  &.paaryhma, &.kopioitava {
    .colorblock {
      border-bottom-left-radius: 4px;
      border-top-left-radius: 4px;
      width: 8px;
      display: block;
    }

    .paaryhma-label {
      border: 0;
    }
  }

  .colorblock {
    width: 20px;
    color: $white;
    border-bottom-left-radius: 8px;
    border-top-left-radius: 8px;
    border-right: 0px;
  }

  .paaryhma-label {
    border: 1px solid $gray-lighten-3;
    border-left: 0px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.tosa {
    .grip {
      color: $blue-lighten-6;
    }
  }

  &.osaamisalat .colorblock, &.tutkintonimikkeet .colorblock{
    padding: 0.45rem 0.3rem !important;
  }

  .koodi-input ::v-deep input{
    border-radius: 0;
    border-right: 0;
    border-left: 0;
  }
}

.actions {

  ::v-deep .ep-button .btn-link {
    padding-left: 0px !important;
    .teksti{
      padding-left: 0px !important;
    }
  }

}

</style>
