<template>
  <EpEditointi :store="store">
    <template #header="{ data }">
      <h2 v-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else class="font-italic" >{{ $t('nimeton') }}</h2>
    </template>

    <template #default="{ data, isEditing }">
      <div class="col-11 pl-0">

        <div class="mt-1" v-if="isEditing">
          <h3>{{$t('vaiheen-nimi')}} *</h3>
          <ep-input v-model="data.nimi" :is-editing="true"></ep-input>
        </div>

        <hr v-if="isEditing" class="mt-5"/>

        <EpSisaltoTekstikappaleet v-model="storeData" :isEditing="isEditing" :sisaltoAvaimet="['paikallisestiPaatettavatAsiat', 'siirtymaEdellisesta', 'siirtymaSeuraavaan', 'tehtava']" />

        <template v-if="vaiheId">
          <b-form-group :label="$t('oppiaineet')">
            <draggable
              v-bind="oppiaineetDragOptions"
              tag="div"
              v-model="data.oppiaineet">
                <div class="oppiaine p-3 d-flex" v-for="oppiaine in data.oppiaineet" :key="'oppiaine'+oppiaine.id">
                  <EpMaterialIcon v-if="isEditing" class="order-handle mr-2">drag_indicator</EpMaterialIcon>
                  <router-link :to="{ name: 'aipeoppiaine', params: { oppiaineId: oppiaine.id } }">{{ $kaanna(oppiaine.nimi) || $t('nimeton-oppiaine') }}</router-link>
                </div>
            </draggable>
          </b-form-group>

          <ep-button variant="outline-primary" icon="add" @click="lisaaOppiaine" v-if="!isEditing" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
            {{ $t('lisaa-oppiaine') }}
          </ep-button>

          <hr/>
        </template>

        <b-form-group class="mt-4" :label="$t('opetuksen-tavoitealueet')">
          <div v-if="isEditing">
            <draggable
              v-bind="defaultDragOptions"
              tag="div"
              v-model="data.opetuksenKohdealueet">

              <b-row v-for="(kohdealue, index) in data.opetuksenKohdealueet" :key="'tavoite'+index" class="pb-2">
                <b-col cols="11">
                  <ep-input v-model="kohdealue.nimi" :is-editing="isEditing">
                    <div class="order-handle m-2" slot="left">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                  </ep-input>
                </b-col>
                <b-col cols="1" v-if="isEditing">
                  <div class="default-icon clickable mt-2" @click="poistaKohdealue(kohdealue)">
                    <EpMaterialIcon>delete</EpMaterialIcon>
                  </div>
                </b-col>
              </b-row>
            </draggable>

            <ep-button variant="outline" icon="add" @click="lisaaKohdealue" v-if="isEditing">
              {{ $t('lisaa-tavoitealue') }}
            </ep-button>
          </div>

          <div v-else>
            <ul>
              <li v-for="(kohdealue, index) in data.opetuksenKohdealueet" :key="'tavoite'+index">
                {{$kaanna(kohdealue.nimi)}}
              </li>
            </ul>
          </div>
        </b-form-group>
      </div>
    </template>
  </EpEditointi>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { AipeVaiheStore } from '@/stores/AipeVaiheStore';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import draggable from 'vuedraggable';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpSisaltoTekstikappaleet from '@/components/EpSisaltoTekstikappaleet.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpEditointi,
    EpInput,
    EpContent,
    EpButton,
    draggable,
    EpCollapse,
    EpSisaltoTekstikappaleet,
    EpMaterialIcon,
  },
})
export default class RouteAipeVaihe extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: false })
  vaiheId: any;

  store: EditointiStore | null = null;

  @Watch('vaiheId', { immediate: true })
  async vaiheChange() {
    const store = new AipeVaiheStore(this.perusteId!, this.vaiheId, this.perusteStore, this);
    this.store = new EditointiStore(store);
  }

  get sisaltoTekstiAvaimet() {
    return _.filter(['paikallisestiPaatettavatAsiat', 'siirtymaEdellisesta', 'siirtymaSeuraavaan', 'tehtava'], avain => !!_.get(this.store?.data.value, avain));
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }

  async postSave() {
    await this.perusteStore.updateNavigation();
  }

  get storeData() {
    return this.store?.data.value;
  }

  set storeData(data) {
    this.store?.setData(data);
  }

  lisaaKohdealue() {
    this.store?.setData(
      {
        ...this.store.data.value,
        opetuksenKohdealueet: [
          ...this.store.data.value.opetuksenKohdealueet,
          {},
        ],
      }
    );
  }

  poistaKohdealue(poistettavaKohdealue) {
    this.store?.setData(
      {
        ...this.store.data.value,
        opetuksenKohdealueet: _.filter(this.store.data.value.opetuksenKohdealueet, kohdealue => kohdealue !== poistettavaKohdealue),
      }
    );
  }

  lisaaOppiaine() {
    this.$router.push({ name: 'aipeoppiaine', params: { vaiheId: this.vaiheId } });
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
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

  .oppiaine:nth-of-type(even) {
    background-color: $table-even-row-bg-color;
  }
  .oppiaine:nth-of-type(odd) {
    background-color: $table-odd-row-bg-color;
  }

</style>
