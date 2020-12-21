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
            <!-- <b-form-group :label="$t('rakenteen-kuvaus')">                                             -->
            <!--   <ep-content v-model="data.kuvaus" layout="normal" :is-editable="isEditing"></ep-content> -->
            <!-- </b-form-group>                                                                            -->
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
              <div class="actions pl-2">
                <ep-button @click="addRyhma" variant="outline" icon="plus" v-if="isEditing">
                  {{ $t('lisaa-ryhma-rakenteeseen') }}
                </ep-button>
                <ep-button @click="toggleDescription" variant="link">
                  {{ $t('nayta-ryhmien-kuvaukset') }}
                </ep-button>
              </div>
              <div class="drag-area p-3 d-flex">
                <div class="drag-area-left mr-3 flex-grow-1">
                  <div class="d-flex align-items-center">
                    <div class="flex-shrink-1 font-weight-bold">
                      {{ $t('rakenne') }}
                    </div>
                    <div class="flex-grow-1">
                      <!-- <b-button variant="link" @click="notImplemented">{{ $t('avaa-sulje') }}</b-button> -->
                    </div>
                    <div style="width: 100px" class="text-center font-weight-bold">
                      osp
                    </div>
                    <div style="width: 80px">
                    </div>
                  </div>
                  <ep-spinner v-if="!data" />
                  <div class="p-3 helptext text-muted text-center" v-else-if="data.osat.length === 0">
                    {{ $t('luo-tutkinnolle-rakenne-ohje') }}
                  </div>
                  <MuodostumisNode v-model="data.osat" ref="root" :is-editing="isEditing" :tutkinnonOsatMap="tutkinnonOsatMap">
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
                <div class="drag-area-right">
                  <div class="menu p-3">
                    <h5>{{ $t('paaryhmat') }}</h5>
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

                    <h5 class="mt-4">{{ $t('tutkinnon-osat') }}</h5>
                    <div class="mt-3">
                      <ep-search v-model="queryTutkinnonOsa" :placeholder="$t('etsi-tutkinnon-osaa')" />
                      <div class="ml-1 mt-1">
                        <ep-toggle v-model="showUnusedTutkinnonOsat" switch>
                          <span class="noselect">
                            {{ $t('nayta-kayttamattomat') }}
                          </span>
                        </ep-toggle>
                      </div>
                      <draggable :value="tutkinnonOsat" v-bind="optionsTutkinnonOsat" tag="div">
                        <div v-for="tosa in tutkinnonOsat" :key="tosa.id" class="mb-1 d-flex align-items-center p-2 pl-3 pr-3 m-1 tosa draggable">
                          <div class="flex-grow-1">
                            {{ $kaanna(tosa.nimi) }}
                          </div>
                          <div class="laajuus">
                            {{ tosa.laajuus }}
                          </div>
                        </div>
                      </draggable>
                    </div>

                    <h5 class="mt-4">{{ $t('ryhma-osaamisalat') }}</h5>
                    <div>
                      <ep-koodisto-select :store="osaamisalaStore" @add="lisaaOsaamisala">
                        <template #default="{ open }">
                          <ep-button @click="open" icon="plus" variant="outline">
                            {{ $t('lisaa-osaamisala') }}
                          </ep-button>
                        </template>
                      </ep-koodisto-select>
                      <draggable :value="osaamisalat" v-bind="optionsKoodit" tag="div">
                        <div v-for="ryhma in osaamisalat" :key="ryhma.osaamisala.osaamisalakoodiUri" class="mb-1 d-flex justify-content-center paaryhma align-items-center">
                          <div class="colorblock" :style="{ background: colorMap['osaamisala'] }"></div>
                          <div class="flex-grow-1 paaryhma-label pl-2 noselect">
                            {{ $kaanna(ryhma.nimi) }}
                          </div>
                          <div class="flex-shrink paaryhma-label pl-2">
                            <ep-button @click="notImplemented" variant="link" icon="roskalaatikko"></ep-button>
                          </div>
                        </div>
                      </draggable>
                    </div>

                    <h5 class="mt-4">{{ $t('ryhma-tutkintonimikkeet') }}</h5>
                    <div>
                      <ep-koodisto-select :store="tutkintonimikeStore" @add="lisaaTutkintonimike">
                        <template #default="{ open }">
                          <ep-button @click="open" icon="plus" variant="outline">
                            {{ $t('lisaa-tutkintonimike') }}
                          </ep-button>
                        </template>
                      </ep-koodisto-select>
                      <draggable :value="tutkintonimikkeet" v-bind="optionsKoodit" tag="div">
                        <div v-for="ryhma in tutkintonimikkeet" :key="ryhma.tutkintonimike.uri" class="mb-1 d-flex justify-content-center paaryhma align-items-center">
                          <div class="colorblock" :style="{ background: colorMap['tutkintonimike'] }"></div>
                          <div class="flex-grow-1 paaryhma-label pl-2 noselect">
                            {{ $kaanna(ryhma.nimi) }}
                          </div>
                          <div class="flex-shrink paaryhma-label pl-2">
                            <ep-button @click="notImplemented" variant="link" icon="roskalaatikko"></ep-button>
                          </div>
                        </div>
                      </draggable>
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
                    <ep-input type="number" is-editing v-model="data.muodostumisSaanto.laajuus.minimi">
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

        <b-modal ref="addModal" size="lg" @ok="addUusi(data)">
          <template #modal-header>
            <h2>{{ $t('lisaa-ryhma') }}</h2>
          </template>

          <template #default>
            <div>
              <b-form-group :label="$t('pakollisuus')">
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
                    osp
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
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import MuodostumisNode from './MuodostumisNode.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { MuodostuminenStore } from '@/stores/MuodostuminenStore';
import { Koodisto } from '@shared/api/eperusteet';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import { ColorMap, RakenneMainType, RakenneModuuliType } from './muodostuminen/utils';
import { BrowserStore } from '@shared/stores/BrowserStore';
import _ from 'lodash';
import draggable from 'vuedraggable';
import { Kieli } from '@shared/tyypit';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { v4 as genUuid } from 'uuid';

const DefaultRyhma = {
  useRange: false,
  ryhma: {
    muodostumisSaanto: {
      laajuus: {
        minimi: 0,
      },
    },
  } as any,
  tyyppi: null as string | null,
};

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
  },
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
  private tutkintonimikkeet = [] as any[];
  private osaamisalat = [] as any[];
  private naytaKuvaukset = false;

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
    return this.store?.data.value?.muodostumisSaanto?.laajuus?.minimi;
  }

  get laskettuLaajuus() {
    return _(this.store?.data.value?.osat)
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

  getNimi(key: string) {
    return {
      fi: this.$t(key, Kieli.fi),
      sv: this.$t(key, Kieli.sv),
      en: this.$t(key, Kieli.en),
    };
  }

  ryhmaTemplate(kind: string) {
    const result = {
      kuvaus: null,
      vieras: null,
      pakollinen: false,
      rooli: 'määritelty',
      tunniste: null,
      muodostumisSaanto: null,
      osaamisala: null,
      tutkintonimike: null,
      osat: [],
      nimi: this.getNimi(kind),
      uuid: genUuid(),
    };

    if (kind === 'rakenne-moduuli-yhteiset') {
      result.rooli = 'vieras';
    }
    else if (kind === 'rakenne-moduuli-paikalliset') {
      result.rooli = 'määrittelemätön';
    }
    else if (kind === 'osaamisala') {
      result.rooli = 'osaamisala';
    }
    else if (kind === 'tutkintonimike') {
      result.rooli = 'tutkintonimike';
    }
    return result;
  }

  get paaryhmat(): RakenneMainType[] {
    return [{
      kind: 'pakollinen',
      label: 'rakenne-moduuli-pakollinen',
      uuid: genUuid(),
      create: () => ({
        ...this.ryhmaTemplate('rakenne-moduuli-pakollinen'),
      }),
    }, {
      kind: 'valinnainen',
      label: 'rakenne-moduuli-valinnainen',
      uuid: genUuid(),
      create: () => ({
        ...this.ryhmaTemplate('rakenne-moduuli-valinnainen'),
      }),
    }, {
      kind: 'ammatilliset',
      label: 'rakenne-moduuli-ammatilliset',
      uuid: genUuid(),
      create: () => ({
        ...this.ryhmaTemplate('rakenne-moduuli-ammatilliset'),
      }),
    }, {
      kind: 'yhteiset',
      label: 'rakenne-moduuli-yhteiset',
      uuid: genUuid(),
      create: () => ({
        ...this.ryhmaTemplate('rakenne-moduuli-yhteiset'),
      }),
    }, {
      kind: 'paikalliset',
      label: 'rakenne-moduuli-paikalliset',
      uuid: genUuid(),
      create: () => ({
        ...this.ryhmaTemplate('rakenne-moduuli-paikalliset'),
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
    walk(this.store.data.value);
    return _.keyBy(osat, '_tutkinnonOsaViite');
  }

  get kayttamattomatTutkinnonOsat() {
    if (!this.liitetytOsat) {
      return null;
    }
    return _.filter(this.tutkinnonOsatRaw, osa => !this.liitetytOsat![osa.id!]);
  }

  get tutkinnonOsat() {
    return _(this.showUnusedTutkinnonOsat
      ? this.tutkinnonOsatRaw
      : this.kayttamattomatTutkinnonOsat)
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
    try {
      const template = this.ryhmaTemplate(this.uusi.tyyppi);
      if (this.uusi) {
        root.osat = [{
          ...template,
          ...this.uusi.ryhma,
        }, ...root.osat];
      }
    }
    finally {
      (this.$refs.addModal as any).hide();
    }
  }

  addRyhma() {
    this.uusi = DefaultRyhma;
    (this.$refs.addModal as any).show();
  }

  lisaaTutkintonimike(koodi: any) {
    this.tutkintonimikkeet = [...this.tutkintonimikkeet, {
      ...this.ryhmaTemplate('tutkintonimike'),
      nimi: koodi.nimi,
      tutkintonimike: koodi,
    }];
  }

  lisaaOsaamisala(koodi: any) {
    this.osaamisalat = [...this.osaamisalat, {
      ...this.ryhmaTemplate('osaamisala'),
      nimi: koodi.nimi,
      osaamisala: {
        'osaamisalakoodiArvo': koodi.arvo,
        'osaamisalakoodiUri': koodi.uri,
      },
    }];
  }

  notImplemented() {
    throw new Error('not implemented yet.');
  }
}
</script>

<style scoped lang="scss">
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

.colorblock {
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  width: 8px;
  display: block;
}

.draggable {
  cursor: grab;
}

</style>
