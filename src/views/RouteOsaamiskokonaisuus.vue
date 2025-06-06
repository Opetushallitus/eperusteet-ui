<template>
  <EpEditointi :store="editointiStore" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 v-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else>{{ $t('nimeton-osaamiskokonaisuus') }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing, supportData }">

      <b-row v-if="isEditing" class="mb-4">
        <b-col lg="8">
          <b-form-group :label="$t('osaamiskokonaisuuden-nimi') + ' *'" required>
            <ep-input v-model="data.nimi" :is-editing="isEditing">
            </ep-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row class="mb-4">
        <b-col md="8">
          <b-form-group :label="$t('osaamiskokonaisuuden-kuvaus')">
            <ep-content v-model="data.kuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-col>
      </b-row>

      <h3>{{ $kaanna(data.nimi) }} {{$t('varhaiskasvatuksessa-ja-esi-ja-perusopetuksessa')}}</h3>

      <b-tabs>
        <b-tab :title="$t(kasitteisto.taso.toLowerCase())" v-for="kasitteisto in data.kasitteistot" :key="'kasitteisto' + kasitteisto.taso">
          <b-form-group>
            <ep-content v-model="kasitteisto.kuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-tab>
      </b-tabs>

      <hr/>

      <b-row>
        <b-col md="8">
          <b-form-group>
            <template #label>
              <div>
                <h3>{{$t('keskeinen-kasitteisto')}}</h3>
              </div>
            </template>
            <ep-content v-model="data.keskeinenKasitteisto"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-col>
      </b-row>

      <hr/>

      <h3 class="mt-4">{{$t('paa-alueet')}}</h3>

      <div v-if="isEditing">{{ $t('lisaa-paa-alueita-osaamiskokonaisuuden-tallennetusta-nakymasta') }}</div>
      <template v-else-if="supportData">
        <div v-for="paaAlue in supportData.paaAlueet" :key="'paaalue' + paaAlue.id" class="mb-2">
          <router-link :to="{ name: 'osaamiskokonaisuus_paa_alue', params: { osaamiskokonaisuusPaaAlueId: paaAlue.id } }">
            {{ $kaanna(paaAlue.perusteenOsa.nimi) || $t('nimeton-osaamiskokonaisuuden-paaalue') }}
          </router-link>
        </div>

        <ep-button @click="lisaaPaaAlue()" variant="outline" icon="add" class="mt-2">
          {{ $t('lisaa-paa-alue') }}
        </ep-button>

      </template>

    </template>
  </EpEditointi>
</template>

<script lang="ts">
import { KuvaStore } from '@/stores/KuvaStore';
import { OsaamiskokonaisuusStore } from '@/stores/OsaamiskokonaisuusStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { TermitStore } from '@/stores/TermitStore';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import * as _ from 'lodash';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { OsaamiskokonaisuusPaaAlueStore } from '@/stores/OsaamiskokonaisuusPaaAlueStore';

@Component({
  components: {
    EpEditointi,
    EpInput,
    EpContent,
    EpButton,
  },
})
export default class RouteOsaamiskokonaisuus extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  editointiStore: EditointiStore | null = null;

  @Prop({ required: true })
  osaamiskokonaisuusId!: number;

  @Watch('osaamiskokonaisuusId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    await this.fetch();
  }

  async fetch() {
    await this.perusteStore.blockUntilInitialized();
    const store = new OsaamiskokonaisuusStore(this.perusteId!, Number(this.osaamiskokonaisuusId), this.versionumero);
    this.editointiStore = new EditointiStore(store);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.perusteId!));
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  @Watch('versionumero', { immediate: true })
  async versionumeroChange() {
    await this.fetch();
  }

  async lisaaPaaAlue() {
    const tallennettu = await OsaamiskokonaisuusPaaAlueStore.create(this.osaamiskokonaisuusId);
    await this.perusteStore.updateNavigation();
    await this.$router.push({
      name: 'osaamiskokonaisuus_paa_alue',
      params: {
        osaamiskokonaisuusPaaAlueId: '' + tallennettu!.id,
      },
    });
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
