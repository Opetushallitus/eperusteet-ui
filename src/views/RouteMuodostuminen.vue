<template>
  <ep-spinner v-if="!store || !peruste" />
  <EpEditointi v-else :store="store" :key="new Date()">
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
            <span class="ml-2 text-nowrap">{{ laskettuLaajuus }} / {{ vaadittuLaajuus }} {{ laajuustyyppi }}</span>
            <ep-button variant="link" icon="pen" @click="editMuodostuminen" v-if="isEditing"></ep-button>
          </h5>
          <div class="filters">
            <ep-search v-model="query" :placeholder="$t('etsi-rakenteesta')" />
          </div>
          <div class="tree mt-3">
            <div class="actions p-2">
              <ep-button @click="notImplemented" variant="link" icon="plus">
                {{ $t('lisaa-ryhma-rakenteeseen') }}
              </ep-button>
              <ep-button @click="notImplemented" variant="link">
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
                    <b-button variant="link" @click="notImplemented">{{ $t('avaa-sulje') }}</b-button>
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
                <MuodostumisNode v-else v-model="data.osat" ref="root" :is-editing="isEditing" :tutkinnonOsatMap="tutkinnonOsatMap">
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
                    <div v-for="(ryhma, idx) in paaryhmat" :key="ryhma.uuid" class="mb-1 d-flex justify-content-center paaryhma align-items-center">
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
                      <div v-for="(tosa, idx) in tutkinnonOsat" :key="tosa.id" class="mb-1 d-flex align-items-center p-2 pl-3 pr-3 m-1 tosa">
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
                    <ep-button @click="notImplemented" icon="plus" variant="outline">
                      {{ $t('lisaa-osaamisala') }}
                    </ep-button>
                    <div v-for="(ryhma, idx) in osaamisalat" :key="ryhma.koodi.uri" class="mb-1 d-flex justify-content-center paaryhma align-items-center">
                      <div class="colorblock" :style="{ background: colorMap['osaamisala'] }"></div>
                      <div class="flex-grow-1 paaryhma-label pl-2 noselect">
                        not implemented
                      </div>
                      <div class="flex-shrink paaryhma-label pl-2">
                        <ep-button @click="notImplemented" variant="link" icon="roskakori"></ep-button>
                      </div>
                    </div>
                  </div>

                  <h5 class="mt-4">{{ $t('ryhma-tutkintonimikkeet') }}</h5>
                  <div>
                    <ep-button @click="notImplemented" icon="plus" variant="outline">
                      {{ $t('lisaa-tutkintonimike') }}
                    </ep-button>
                    <div v-for="(ryhma, idx) in tutkintonimikkeet" :key="ryhma.koodi.uri" class="mb-1 d-flex justify-content-center paaryhma align-items-center">
                      <div class="colorblock" :style="{ background: colorMap['tutkintonimike'] }"></div>
                      <div class="flex-grow-1 paaryhma-label pl-2 noselect">
                        not implemented
                      </div>
                      <div class="flex-shrink paaryhma-label pl-2">
                        <ep-button @click="notImplemented" variant="link" icon="roskakori"></ep-button>
                      </div>
                    </div>
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
                  osp
                </div>
              </div>
            </b-form-group>
          </div>
        </template>
      </b-modal>
      <pre>{{ data }}</pre>
    </template>
  </EpEditointi>
</template>


<script lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
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
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import { ColorMap, RakenneMainType, RakenneModuuliType } from './muodostuminen/utils';
import { BrowserStore } from '@shared/stores/BrowserStore';
import _ from 'lodash';
import draggable from 'vuedraggable';
import { Kieli } from '@shared/tyypit';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { v4 as genUuid } from 'uuid';


@Component({
  components: {
    EpButton,
    EpContent,
    EpEditointi,
    EpIcon,
    EpInput,
    EpJarjesta,
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
    }
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
    const Defaults = {
      kuvaus: null,
      vieras: null,
      pakollinen: false,
      nimi: null,
      rooli: "määritelty",
      tunniste: null,
      muodostumisSaanto: null,
      osaamisala: null,
      tutkintonimike: null,
      osat: [],
    };

    const getNimi =(key: string) => {
      return {
        fi: this.$t(key, Kieli.fi),
        sv: this.$t(key, Kieli.sv),
        en: this.$t(key, Kieli.en),
      };
    }

    return [{
      kind: 'pakollinen',
      label: 'rakenne-moduuli-pakollinen',
      uuid: genUuid(),
      create: () => ({
        ...Defaults,
        nimi: getNimi('rakenne-moduuli-pakollinen'),
      }),
    }, {
      kind: 'valinnainen',
      label: 'rakenne-moduuli-valinnainen',
      uuid: genUuid(),
      create: () => ({
        ...Defaults,
        nimi: getNimi('rakenne-moduuli-valinnainen'),
      }),
    }, {
      kind: 'ammatilliset',
      label: 'rakenne-moduuli-ammatilliset',
      uuid: genUuid(),
      create: () => ({
        ...Defaults,
        nimi: getNimi('rakenne-moduuli-ammatilliset'),
      }),
    }, {
      kind: 'yhteiset',
      label: 'rakenne-moduuli-yhteiset',
      uuid: genUuid(),
      create: () => ({
        ...Defaults,
        nimi: getNimi('rakenne-moduuli-yhteiset'),
        rooli: 'vieras',
      }),
    }, {
      kind: 'paikalliset',
      label: 'rakenne-moduuli-paikalliset',
      uuid: genUuid(),
      create: () => ({
        ...Defaults,
        nimi: getNimi('rakenne-moduuli-paikalliset'),
        rooli: 'määrittelemätön',
      }),
    // }, {
    //   kind: 'osaamisala',
    //   label: 'rakenne-moduuli-osaamisala',
    // }, {
    //   kind: 'tutkintonimike',
    //   label: 'rakenne-moduuli-tutkintonimike',
    }];
  }

  get optionsTutkinnonOsat() {
    return {
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

  get optionsPaaryhma() {
    return {
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

  get tutkinnonOsat() {
    // const suodatin = this.$suodatin(this.queryTutkinnonOsa);
    return _(this.tutkinnonOsatRaw)
      .filter(this.$filterBy('nimi', this.queryTutkinnonOsa))
      .sortBy(tosa => this.$kaanna(tosa.nimi as any))
      .value();
  }

  get tutkintonimikkeet() {
    return [];
  }

  get osaamisalat() {
    return [];
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

</style>
