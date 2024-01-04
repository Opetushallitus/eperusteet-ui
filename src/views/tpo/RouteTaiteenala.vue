<template>
  <EpEditointi :store="store" :versionumero="versionumero">
    <template #header="{ data }">
      <h2 v-if="data.koodi">{{ $kaanna(data.koodi.nimi) }}</h2>
      <h2 v-else-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else class="font-italic" >{{ $t('nimeton') }}</h2>
    </template>

    <template #default="{ data, isEditing }">
      <b-row v-if="isEditing">
        <b-col cols="11">
          <b-form-group :label="$t('taiteenala') + ' *'">
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
      </b-row>

      <div class="col-11 pl-0">

        <h4 class="mt-4" v-if="isEditing">{{$t('kuvaus')}} *</h4>
        <ep-content
          layout="normal"
          v-model="data.teksti"
          :is-editable="isEditing"
          :kasiteHandler="kasiteHandler"/>

        <hr v-if="isEditing" class="mt-5"/>

        <EpSisaltoTekstikappaleet v-model="storeData" :isEditing="isEditing" :sisaltoAvaimet="sisaltoTekstiAvaimet" sisaltoTekstiOtsikkoField="nimi"/>
      </div>
    </template>
  </EpEditointi>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { PerusteStore } from '@/stores/PerusteStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { TaiteenalaStore } from '@/stores/TaiteenalaStore';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpSisaltoTekstikappaleet from '@/components/EpSisaltoTekstikappaleet.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';

@Component({
  components: {
    EpEditointi,
    EpInput,
    EpContent,
    EpButton,
    EpCollapse,
    EpSisaltoTekstikappaleet,
    EpKoodistoSelect,
  },
})
export default class RouteTaiteenala extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  taiteenalaId: any;

  @Prop({ required: false })
  uusi!: string;

  store: EditointiStore | null = null;

  @Watch('taiteenalaId', { immediate: true })
  async taiteenalaChange() {
    await this.fetch();
  }

  @Watch('versionumero', { immediate: true })
  async versionumeroChange() {
    await this.fetch();
  }

  public async fetch() {
    const store = new TaiteenalaStore(this.perusteId!, this.taiteenalaId, this.versionumero, !!this.uusi);
    this.store = new EditointiStore(store);
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

  get sisaltoTekstiAvaimet() {
    return ['aikuistenOpetus', 'kasvatus', 'oppimisenArviointiOpetuksessa', 'teemaopinnot', 'tyotavatOpetuksessa', 'yhteisetOpinnot'];
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

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
