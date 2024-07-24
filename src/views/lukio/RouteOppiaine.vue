<template>
  <EpEditointi :store="store">
    <template #header="{ data }">
      <h2 v-if="data.koodi">{{ $kaanna(data.koodi.nimi) }}</h2>
      <h2 v-else-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else class="font-italic" >{{ $t('nimeton-oppiaine') }}</h2>
    </template>

    <template #default="{ data, isEditing }">
      <b-row>
        <b-col cols="8" v-if="isEditing">
          <b-form-group :label="$t('oppiaineen-nimi')">
            <ep-koodisto-select :store="koodisto" v-model="data.koodi" :is-editing="isEditing" :naytaArvo="false">
              <template #default="{ open }">
                <b-input-group>
                  <b-form-input
                    :value="data.koodi ? $kaanna(data.koodi.nimi) : ''"
                    disabled></b-form-input>
                  <b-input-group-append>
                    <b-button @click="open" variant="primary">
                      {{ $t('hae-koodistosta') }}
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </template>
            </ep-koodisto-select>
          </b-form-group>
        </b-col>

        <b-col cols="3">
          <b-form-group :label="$t('koodi')">
            <span v-if="data.koodi">
              {{ data.koodi.arvo }}
            </span>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col cols="11">
          <hr/>

          <EpCollapse :collapsable="!isEditing" :usePadding="false">
            <template #header><h4>{{$t('oppiaineen-tehtava')}}</h4></template>
            <ep-content layout="normal" v-model="data.tehtava.kuvaus" :is-editable="isEditing"/>
          </EpCollapse>

          <EpCollapse :collapsable="!isEditing" :usePadding="false">
            <template #header><h4>{{$t('laaja-alaisen-osaamisen-osa-alueet')}}</h4></template>
            <ep-content layout="normal" v-model="data.laajaAlaisetOsaamiset.kuvaus" :is-editable="isEditing"/>
          </EpCollapse>

          <EpCollapse :collapsable="!isEditing" :usePadding="false">
            <template #header><h4>{{$t('tavoitteet')}}</h4></template>

            <h5>{{$t('tavoitteiden-kuvaus')}}</h5>
            <ep-content layout="normal" v-model="data.tavoitteet.kuvaus" :is-editable="isEditing"/>

            <div v-if="isEditing">

              <draggable
                v-bind="tavoitealueDragOptions"
                tag="div"
                v-model="data.tavoitealueet">

                <div v-for="(tavoitealue, tavoitealueIndex) in data.tavoitteet.tavoitealueet" :key="'tavoite'+tavoitealueIndex" class="mt-4 p-2 tavoitealue editing">
                  <div class="d-flex">
                    <div class="order-handle m-2">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                    <div class="mt-2 w-100">
                      <div class="row">
                        <div class="col-11">
                          <div class="font-weight-bold mb-2">{{$t('tavoitealueen-nimi')}}</div>
                          <ep-input v-model="tavoitealue.nimi" :isEditing="true" />

                          <div class="mt-3 mb-2 font-weight-bold">{{$t('kohde')}}</div>
                          <ep-input v-model="tavoitealue.kohde" :isEditing="true" />
                        </div>
                      </div>

                      <div class="mt-3 mb-2 font-weight-bold">{{$t('tavoitteet')}}</div>
                      <EpTavoitealueTavoitteet v-model="tavoitealue.tavoitteet">
                        <template #default="{tavoiteIndex}">
                          <EpInput
                              v-model="tavoitealue.tavoitteet[tavoiteIndex]"
                              :is-editing="true"
                              class="input-wrapper">
                              <div class="order-handle m-2" slot="left">
                                <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                              </div>
                            </EpInput>
                        </template>
                        <template #footer>
                          <EpButton icon="delete" class="mr-5" variant="link" @click="poistaTavoitealue(tavoitealue)">{{ $t('poista-tavoitealue') }}</EpButton>
                        </template>
                      </EpTavoitealueTavoitteet>
                    </div>
                  </div>
                </div>
              </draggable>

              <EpButton class="mt-4" variant="outline" icon="add" @click="lisaaTavoitealue()">{{ $t('lisaa-tavoitealue') }}</EpButton>

            </div>

            <div v-if="!isEditing">

              <div v-for="(tavoitealue, tavoitealueIndex) in data.tavoitteet.tavoitealueet" :key="'tavoite'+tavoitealueIndex" class="tavoitealue">
                <div class="font-weight-bold">{{$kaanna(tavoitealue.nimi)}}</div>
                <div>{{$kaanna(tavoitealue.kohde)}}</div>
                <ul>
                  <li v-for="tavoite in tavoitealue.tavoitteet" :key="'tavoite'+tavoite._id">{{$kaanna(tavoite)}}</li>
                </ul>
              </div>
            </div>
          </EpCollapse>

          <EpCollapse :collapsable="!isEditing" :usePadding="false">
            <template #header><h4>{{$t('osaamisen-arviointi')}}</h4></template>
            <ep-content layout="normal" v-model="data.arviointi.kuvaus" :is-editable="isEditing"/>
          </EpCollapse>

          <EpCollapse :collapsable="!isEditing" :usePadding="false">
            <template #header><h4>{{$t('moduulit')}}</h4></template>

            <h5>{{$t('pakollisten-moduulien-kuvaus')}}</h5>
            <ep-content layout="normal" v-model="data.pakollisetModuulitKuvaus" :is-editable="isEditing" v-if="isEditing || data.pakollisetModuulitKuvaus"/>
            <div class="d-flex mt-3" v-if="!isEditing">
              <router-link
                v-for="(moduuli, mindex) in pakollisetModuulit" :key="'pmoduuli'+mindex"
                :to="{ name: 'moduuli', params: { moduuliId: moduuli.id } }">
                <EpModuuli :moduuli="moduuli"/>
              </router-link>
            </div>

            <EpButton class="mt-4" variant="outline" icon="add" @click="lisaaModuuli(true)" v-if="!isEditing" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">{{ $t('lisaa-pakollinen-moduuli') }}</EpButton>

            <h5 class="mt-5">{{$t('valinnaisten-moduulien-kuvaus')}}</h5>
            <ep-content layout="normal" v-model="data.valinnaisetModuulitKuvaus" :is-editable="isEditing" v-if="isEditing || data.pakollisetModuulitKuvaus"/>
            <div class="d-flex mt-3" v-if="!isEditing">
              <router-link
                v-for="(moduuli, mindex) in valinnaisetModuulit" :key="'vmoduuli'+mindex"
                :to="{ name: 'moduuli', params: { moduuliId: moduuli.id } }">
                <EpModuuli :moduuli="moduuli"/>
              </router-link>
            </div>
            <EpButton class="mt-4" variant="outline" icon="add" @click="lisaaModuuli(false)" v-if="!isEditing" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">{{ $t('lisaa-valinnainen-moduuli') }}</EpButton>
          </EpCollapse>

          <EpCollapse :collapsable="!isEditing" :usePadding="false" :borderBottom="false" class="mt-4" v-if="!data._oppiaine || !data.id">
            <template #header><h4>{{$t('oppimaarat')}}</h4></template>

            <draggable
              v-bind="oppiaineetDragOptions"
              tag="div"
              v-model="data.oppimaarat">
                <div class="listaus p-3 d-flex" v-for="oppimaara in data.oppimaarat" :key="'oppimaara'+oppimaara.id">
                  <EpMaterialIcon v-if="isEditing" class="order-handle mr-2">drag_indicator</EpMaterialIcon>
                  <router-link :to="{ name: 'lukio_oppiaine', params: { oppiaineId: oppimaara.id } }">{{ $kaanna(oppimaara.nimi) || $t('nimeton-oppimaara') }}</router-link>
                </div>
            </draggable>

            <EpButton class="mt-2" variant="outline" icon="add" @click="lisaaOppimaara()" v-if="!isEditing" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">{{ $t('lisaa-oppimaara') }}</EpButton>
          </EpCollapse>

        </b-col>
      </b-row>
    </template>
  </EpEditointi>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import draggable from 'vuedraggable';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { LukioOppiaineStore } from '@/stores/LukioOppiaineStore';
import EpTavoitealueTavoitteet from '@shared/components/EpTavoitesisaltoalue/EpTavoitealueTavoitteet.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpModuuli from '@shared/components/EpModuuli/EpModuuli.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpEditointi,
    EpInput,
    EpContent,
    EpButton,
    draggable,
    EpKoodistoSelect,
    EpCollapse,
    EpTavoitealueTavoitteet,
    EpColorIndicator,
    EpModuuli,
    EpMaterialIcon,
  },
})
export default class RouteOppiaine extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: false })
  oppiaineId: any;

  @Prop({ required: false })
  parentId: any;

  store: EditointiStore | null = null;

  @Watch('oppiaineId', { immediate: true })
  async oppiaineChange() {
    const store = new LukioOppiaineStore(this.perusteId!, this.oppiaineId, this.parentId, this.perusteStore, this);
    this.store = new EditointiStore(store);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  private readonly koodisto = new KoodistoSelectStore({
    koodisto: 'oppiaineetjaoppimaaratlops2021',
    async query(query: string, sivu = 0, koodisto: string) {
      return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  get storeData() {
    return this.store?.data.value;
  }

  set storeData(data) {
    this.store?.setData(data);
  }

  poistaTavoitealue(poistettavaTavoitealue) {
    this.store?.setData({
      ...this.store.data.value,
      tavoitteet: {
        ...this.store.data.value.tavoitteet,
        tavoitealueet: _.filter(this.store.data.value.tavoitteet.tavoitealueet, tavoitealue => tavoitealue !== poistettavaTavoitealue),
      },
    });
  }

  lisaaTavoitealue() {
    this.store?.setData({
      ...this.store.data.value,
      tavoitteet: {
        ...this.store.data.value.tavoitteet,
        tavoitealueet: [
          ...this.store.data.value.tavoitteet.tavoitealueet,
          {
            tavoitteet: [],
          },
        ],
      },
    });
  }

  get defaultDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
    };
  }

  get isEditing() {
    return this.store?.isEditing.value;
  }

  get tavoitealueDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      disabled: !this.isEditing,
      group: {
        name: 'tavoitealue',
      },
    };
  }

  get oppiaineetDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      disabled: !this.isEditing,
      group: {
        name: 'oppiaineet',
      },
    };
  }

  lisaaOppimaara() {
    this.$router.push({
      name: 'lukio_oppiaine',
      params: {
        parentId: this.oppiaineId,
      },
    });
  }

  lisaaModuuli(pakollinen: boolean) {
    this.$router.push({
      name: 'moduuli',
      params: {
        oppiaineId: this.oppiaineId,
        pakollinen: _.toString(pakollinen),
      },
    });
  }

  get pakollisetModuulit() {
    return _.filter(this.store?.data.value.moduulit, 'pakollinen');
  }

  get valinnaisetModuulit() {
    return _.reject(this.store?.data.value.moduulit, 'pakollinen');
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

  .listaus:nth-of-type(even) {
    background-color: $table-even-row-bg-color;
  }
  .listaus:nth-of-type(odd) {
    background-color: $table-odd-row-bg-color;
  }

  .tavoite {
    @include tile-background-shadow;
    border-radius: 10px;
  }

  .tavoitealue {
    &.editing {
      border: 1px solid $gray-lighten-8;
      border-radius: 3px;
    }
  }

  .moduuli {
    width:160px;
    height:160px;
    background-color: #eaf6fe;
    border-radius: 0.5em;

    .opintopiste {
      font-size: 0.85rem;
    }
  }

</style>
