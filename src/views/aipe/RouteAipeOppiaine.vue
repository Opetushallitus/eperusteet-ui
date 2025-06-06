<template>
  <EpEditointi :store="store" :versionumero="versionumero">
    <template #header="{ data }">
      <h2 v-if="data.koodi">{{ $kaanna(data.koodi.nimi) }}</h2>
      <h2 v-else-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else class="font-italic" >{{ $t('nimeton-oppiaine') }}</h2>
    </template>

    <template #default="{ data, isEditing, supportData }">
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
          <EpSisaltoTekstikappaleet v-model="storeData" :isEditing="isEditing" :sisaltoAvaimet="['tehtava', 'tyotavat', 'ohjaus', 'arviointi', 'sisaltoalueinfo']" />

          <template v-if="!data['_oppiaine'] && oppiaineId && (!data.kurssit || data.kurssit.length == 0)">
            <b-form-group :label="$t('oppimaarat')">
              <draggable
                v-bind="oppiaineetDragOptions"
                tag="div"
                v-model="data.oppimaarat">
                  <div class="listaus p-3 d-flex" v-for="oppimaara in data.oppimaarat" :key="'oppimaara'+oppimaara.id">
                    <EpMaterialIcon v-if="isEditing" class="order-handle mr-2">drag_indicator</EpMaterialIcon>
                    <router-link :to="{ name: 'aipeoppiaine', params: { oppiaineId: oppimaara.id } }">{{ $kaanna(oppimaara.nimi) || $t('nimeton-oppimaara') }}</router-link>
                  </div>
              </draggable>
            </b-form-group>

            <ep-button variant="outline-primary" icon="add" @click="lisaaOppimaara" v-if="!isEditing" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
              {{ $t('lisaa-oppimaara') }}
            </ep-button>
          </template>

          <template v-if="oppiaineId && (!data.oppimaarat || data.oppimaarat.length == 0)">
            <b-form-group :label="$t('kurssit')" class="mt-4">
              <draggable
                v-bind="kurssitDragOptions"
                tag="div"
                v-model="data.kurssit">
                  <div class="listaus p-3 d-flex" v-for="kurssi in data.kurssit" :key="'kurssi'+kurssi.id">
                    <EpMaterialIcon v-if="isEditing" class="order-handle mr-2">drag_indicator</EpMaterialIcon>
                    <router-link :to="{ name: 'aipekurssi', params: { kurssiId: kurssi.id } }">{{ $kaanna(kurssi.nimi) || $t('nimeton-kurssi') }}</router-link>
                  </div>
              </draggable>
            </b-form-group>

            <ep-button variant="outline-primary" icon="add" @click="lisaaKurssi" v-if="!isEditing" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
              {{ $t('lisaa-kurssi') }}
            </ep-button>
          </template>

          <b-form-group :label="$t('opetuksen-tavoitteet')" class="mt-4 pt-3">
            <draggable
              v-bind="tavoitteetDragOptions"
              tag="div"
              v-model="data.tavoitteet">

                <EpCollapse
                  v-for="(tavoite, tavoiteIndex) in data.tavoitteet"
                  :key="'tavoite'+tavoiteIndex"
                  class="tavoite p-3 mb-4 w-100"
                  :borderBottom="false"
                  :usePadding="false">

                  <template #header>
                    <div class="d-flex">
                      <EpMaterialIcon v-if="isEditing" class="order-handle mr-3">drag_indicator</EpMaterialIcon>
                      <h4 class="mb-0">{{$kaanna(tavoite.tavoite)}}</h4>
                    </div>
                  </template>

                  <EpOppiaineenTavoite v-model="data.tavoitteet[tavoiteIndex]" :isEditing="isEditing" :supportData="supportData" @poista="poistaTavoite(tavoite)"/>

                </EpCollapse>
            </draggable>

            <ep-button @click="lisaaTavoite" variant="outline" icon="add" v-if="isEditing">
              {{ $t('lisaa-tavoite') }}
            </ep-button>
          </b-form-group>

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
import { AipeOppiaineStore } from '@/stores/AipeOppiaineStore';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import draggable from 'vuedraggable';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpSisaltoTekstikappaleet from '@/components/EpSisaltoTekstikappaleet.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpOppiaineenTavoite from '@/views/aipe/yleiset/EpOppiaineenTavoite.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpEditointi,
    EpInput,
    EpContent,
    EpButton,
    draggable,
    EpKoodistoSelect,
    EpSisaltoTekstikappaleet,
    EpCollapse,
    EpOppiaineenTavoite,
    EpMaterialIcon,
  },
})
export default class RouteAipeOppiaine extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: false })
  vaiheId: any;

  @Prop({ required: false })
  oppiaineId: any;

  @Prop({ required: false })
  parentId: any;

  store: EditointiStore | null = null;

  @Watch('oppiaineId', { immediate: true })
  async oppiaineChange() {
    const store = new AipeOppiaineStore(this.perusteId!, this.vaiheId, this.oppiaineId, this.parentId, this.perusteStore, this, this.versionumero);
    this.store = new EditointiStore(store);
  }

  @Watch('versionumero', { immediate: true })
  async versionumeroChange() {
    await this.oppiaineChange();
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }

  private readonly koodisto = new KoodistoSelectStore({
    koodisto: 'oppiaineetyleissivistava2',
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

  lisaaOppimaara() {
    this.$router.push({ name: 'aipeoppimaara', params: { vaiheId: this.vaiheId, parentId: this.oppiaineId } });
  }

  lisaaKurssi() {
    this.$router.push({ name: 'aipekurssi', params: { vaiheId: this.vaiheId, oppiaineId: this.oppiaineId } });
  }

  get defaultDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
    };
  }

  get isEditing() {
    return this.store?.isEditing.value;
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

  get kurssitDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      disabled: !this.isEditing,
      group: {
        name: 'kurssit',
      },
    };
  }

  get tavoitteetDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      disabled: !this.isEditing,
      group: {
        name: 'tavoitteet',
      },
    };
  }

  lisaaTavoite() {
    this.store?.setData(
      {
        ...this.store.data.value,
        tavoitteet: [
          ...this.store.data.value.tavoitteet,
          {
            laajattavoitteet: [],
            arvioinninkohteet: [],
            sisaltoalueet: [],
            oppiaineenTavoitteenOpetuksenTavoitteet: [],
          },
        ],
      },
    );
  }

  poistaTavoite(poistettavaTavoite) {
    this.store?.setData(
      {
        ...this.store.data.value,
        tavoitteet: _.reject(this.store.data.value.tavoitteet, poistettavaTavoite),
      },
    );
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

</style>
