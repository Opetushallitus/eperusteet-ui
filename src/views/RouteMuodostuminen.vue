<template>
  <div>
    <ep-spinner v-if="!store || !peruste" />
    <EpEditointi v-else :store="store" :key="'' + new Date()">
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
                      {{ $t('luo-tutkinnolle-rakenne-ohje') }}
                    </div>
                    <MuodostumisNode v-model="data.rakenne.osat" ref="root" :is-editing="isEditing" :tutkinnonOsatMap="tutkinnonOsatMap">
                      <template #moduuli="{ depth, node, color, uuid }">
                        <div class="mt-2 d-flex align-items-center moduuli ryhma" tabindex="0" :moduuli="uuid">
                          <div class="colorblock" :style="{ height: '52px', background: color }"></div>
                          <div class="ml-2 nimi flex-grow-1">{{ $kaanna(node.nimi) }}</div>
                        </div>
                      </template>

                      <template #osa="{ depth, node, color, uuid }">
                        <div class="mt-2 moduuli osa d-flex align-items-center" tabindex="0" :moduuli="uuid">
                          <div class="colorblock" :style="{ height: '42px', background: color }"></div>
                          <div class="ml-2 nimi flex-grow-1 text-truncate">{{ $kaanna(tutkinnonOsatMap[node._tutkinnonOsaViite].nimi) }}</div>
                        </div>
                      </template>
                    </MuodostumisNode>
                  </div>
                </div>
                <div class="drag-area-right">
                  <div class="menu p-3">
                    <h5 class="font-weight-600">{{ $t('paaryhmat') }}</h5>
                    <div class="mt-3">
                    <draggable :value="paaryhmat" v-bind="optionsPaaryhma" tag="div">
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
                      <draggable :value="tutkinnonOsat" v-bind="optionsTutkinnonOsat" tag="div">
                        <div v-for="tosa in tutkinnonosatPaged" :key="tosa.id" class="mb-1 d-flex align-items-center p-2 pr-3 m-1 tosa draggable tosa">
                          <div class="grip mr-2" v-if="isEditing">
                            <fas icon="grip-vertical"/>
                          </div>
                          <div class="flex-grow-1">
                            {{ $kaanna(tosa.nimi) }}
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
                      <ep-koodisto-select :store="osaamisalaStore" @add="lisaaOsaamisala" v-if="isEditing" multiple>
                        <template #default="{ open }">
                          <ep-button @click="open" icon="plus" variant="outline">
                            {{ $t('lisaa-osaamisala') }}
                          </ep-button>
                        </template>
                      </ep-koodisto-select>
                      <draggable :value="osaamisalat" v-bind="optionsKoodit" tag="div">
                        <div v-for="ryhma in osaamisalatPaged" :key="ryhma.osaamisala.osaamisalakoodiUri" class="mb-1 d-flex justify-content-center align-items-center draggable">
                          <div class="colorblock p-1" :style="{ border:'1px solid ' + colorMap['osaamisala'],  background: colorMap['osaamisala'] }">
                            <fas icon="grip-vertical"/>
                          </div>
                          <div class="flex-grow-1 paaryhma-label p-1 pl-2 noselect">
                            {{ $kaanna(ryhma.nimi) }}
                          </div>
                          <div class="flex-shrink pl-2">
                            <ep-button @click="poistaOsaamisala(ryhma)" variant="link" icon="roskalaatikko"  v-if="isEditing"></ep-button>
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
                      <ep-koodisto-select :store="tutkintonimikeStore" @add="lisaaTutkintonimike" v-if="isEditing" multiple>
                        <template #default="{ open }">
                          <ep-button @click="open" icon="plus" variant="outline">
                            {{ $t('lisaa-tutkintonimike') }}
                          </ep-button>
                        </template>
                      </ep-koodisto-select>
                      <draggable :value="tutkintonimikkeet" v-bind="optionsKoodit" tag="div">
                        <div v-for="ryhma in tutkintonimikkeetPaged" :key="ryhma.tutkintonimike.uri" class="mb-1 d-flex justify-content-center align-items-center draggable">
                          <div class="colorblock p-1" :style="{ border:'1px solid ' + colorMap['tutkintonimike'], background: colorMap['tutkintonimike'] }">
                            <fas icon="grip-vertical"/>
                          </div>
                          <div class="flex-grow-1 paaryhma-label p-1 pl-2 noselect">
                            {{ $kaanna(ryhma.nimi) }}
                          </div>
                          <div class="flex-shrink pl-2">
                            <ep-button @click="poistaTutkintonimike(ryhma)" variant="link" icon="roskalaatikko" v-if="isEditing"></ep-button>
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

        <!-- <b-modal
          ref="addModal"
          size="xl"
          :cancelTitle="$t('peruuta')">

          <template #modal-header>
            <h2>{{ $t('lisaa-ryhma') }}</h2>
          </template>

          <template #modal-ok>
            <ep-button @click="addUusi(data.rakenne)" :disabled="addModalInvalid">
              {{$t('tallenna')}}
            </ep-button>
          </template>

          <template #default>
            <div>
              <b-form-group :label="$t('ryhma') + ' *'">
                <b-form-radio class="ml-1" v-model="uusi.tyyppi" value="osaamisala" name="tyyppi">
                  {{ $t('osaamisala') }}
                </b-form-radio>
                <b-form-radio class="ml-1" v-model="uusi.tyyppi" value="tutkintonimike" name="tyyppi">
                  {{ $t('tutkintonimike') }}
                </b-form-radio>
                <b-form-radio class="ml-1 mt-2" v-model="uusi.tyyppi" value="rakenne-moduuli-pakollinen" name="tyyppi">
                  {{ $t('rakenne-moduuli-pakollinen') }}
                </b-form-radio>
                <b-form-radio class="ml-1" v-model="uusi.tyyppi" value="rakenne-moduuli-valinnainen" name="tyyppi">
                  {{ $t('rakenne-moduuli-valinnainen') }}
                </b-form-radio>
                <b-form-radio class="ml-1" v-model="uusi.tyyppi" value="rakenne-moduuli-ammatilliset" name="tyyppi">
                  {{ $t('rakenne-moduuli-ammatilliset') }}
                </b-form-radio>
                <b-form-radio class="ml-1" v-model="uusi.tyyppi" value="rakenne-moduuli-yhteiset" name="tyyppi">
                  {{ $t('rakenne-moduuli-yhteiset') }}
                </b-form-radio>
                <b-form-radio class="ml-1 mt-2" v-model="uusi.tyyppi" value="rakenne-moduuli-paikalliset" name="tyyppi">
                  {{ $t('rakenne-moduuli-paikalliset') }}
                </b-form-radio>
              </b-form-group>
              <EpRakenneModalNimi v-model="uusi.ryhma.nimi" :tyyppi="uusi.tyyppi" />

              <b-form-group :label="$t('laajuus')">
                <div class="d-flex align-items-center">
                  <div>
                    <ep-input type="number" is-editing v-model="uusi.ryhma.muodostumisSaanto.laajuus.minimi">
                    </ep-input>
                  </div>
                  <div class="ml-2" v-if="uusi.useRange">
                    -
                  </div>
                  <div class="ml-2" v-if="uusi.useRange">
                    <ep-input type="number" is-editing v-model="uusi.ryhma.muodostumisSaanto.laajuus.maksimi">
                    </ep-input>
                  </div>
                  <div class="ml-2">
                    {{$t('osaamispiste')}}
                  </div>
                </div>
                <ep-toggle
                  :value="uusi.useRange"
                  @input="toggleRange"
                  switch>
                  {{ $t('aseta-myos-maksimiarvo') }}
                </ep-toggle>
              </b-form-group>
              <b-form-group :label="$t('kuvaus')">
                <ep-content v-model="uusi.ryhma.kuvaus" :is-editable="true" layout="normal"></ep-content>
              </b-form-group>
            </div>
          </template>
        </b-modal> -->
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
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
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
import { Kieli } from '@shared/tyypit';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { v4 as genUuid } from 'uuid';
import { Kielet } from '@shared/stores/kieli';
import EpRakenneModal from '@/components/muodostuminen/EpRakenneModal.vue';
import { DefaultRyhma, ryhmaTemplate, ColorMap, RakenneMainType, RakenneModuuliType } from '@/components/muodostuminen/utils';

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
    EpPerusteprojektiListaus,
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
    // }, {
    //   kind: 'osaamisala',
    //   label: 'rakenne-moduuli-osaamisala',
    // }, {
    //   kind: 'tutkintonimike',
    //   label: 'rakenne-moduuli-tutkintonimike',
    }];
  }

  get optionsKoodit() {
    return {
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
      sort: false,
    };
  }

  get optionsTutkinnonOsat() {
    return {
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
      sort: false,
    };
  }

  get isEditing() {
    return !!this.store?.isEditing;
  }

  get optionsPaaryhma() {
    return {
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
      sort: false,
    };
  }

  get liitetytOsat() {
    if (!this.store) {
      return null;
    }
    const osat = [] as any[];
    const walk = (node) => {
      if (node._tutkinnonOsaViite) {
        osat.push(node);
      }
      _.forEach(node.osat, walk);
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
    return _.map(this.store?.data.value.tutkintonimikkeet, tutkintonimike => {
      return {
        ...ryhmaTemplate('tutkintonimike', this),
        nimi: tutkintonimike.nimi,
        tutkintonimike: {
          ...tutkintonimike,
          uri: tutkintonimike.tutkintonimikeUri,
          arvo: tutkintonimike.tutkintonimikeArvo,
        },
      };
    });
  }

  lisaaTutkintonimike(koodit: any) {
    this.store?.setData(
      {
        ...this.store.data.value,
        tutkintonimikkeet: [
          ...this.store.data.value.tutkintonimikkeet,
          ..._.map(koodit, koodi => ({
            nimi: koodi.nimi,
            'tutkintonimikeUri': koodi.uri,
            'tutkintonimikeArvo': koodi.arvo,
          })),
        ],
      });
  }

  @ProvideReactive('osaamisalat')
  get osaamisalat() {
    return _.map(this.store?.data.value.osaamisalat, osaamisala => {
      return {
        ...ryhmaTemplate('osaamisala', this),
        nimi: osaamisala.nimi,
        osaamisala: {
          'osaamisalakoodiArvo': osaamisala.arvo,
          'osaamisalakoodiUri': osaamisala.uri,
        },
      };
    });
  }

  lisaaOsaamisala(koodit: any) {
    this.store?.setData(
      {
        ...this.store.data.value,
        osaamisalat: [
          ...this.store.data.value.osaamisalat,
          ...koodit,
        ],
      });
  }

  poistaOsaamisala(ryhma) {
    this.store?.setData(
      {
        ...this.store.data.value,
        osaamisalat: _.filter(this.store.data.value.osaamisalat, osaamisala => osaamisala.uri !== ryhma.osaamisala.osaamisalakoodiUri),
      });
  }

  poistaTutkintonimike(ryhma) {
    this.store?.setData(
      {
        ...this.store.data.value,
        tutkintonimikkeet: _.filter(this.store.data.value.tutkintonimikkeet, tutkintonimike => tutkintonimike.tutkintonimikeUri !== ryhma.tutkintonimike.uri),
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
    (this.$refs['root'] as any).toggleRakenne(this.naytaRakenne);
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
      }
    }
  }
}

.draggable {
  cursor: grab;

  &.paaryhma {
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
