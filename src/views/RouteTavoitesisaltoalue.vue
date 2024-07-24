<template>
  <EpEditointi v-if="store" :store="store" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 class="m-0" v-if="data.nimiKoodi" >{{ $kaanna(data.nimiKoodi.nimi) }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing }">

      <b-row v-if="isEditing" class="mb-4">
        <b-col lg="8">
          <b-form-group :label="$t('otsikko') + (isEditing ? ' *' : '')" required>
            <ep-koodisto-select :store="tavoitesisaltoalueotsikkoKoodisto" v-model="data.nimiKoodi" :is-editing="isEditing" :naytaArvo="false">
              <template #default="{ open }">
                <b-input-group>
                  <b-form-input
                    :value="data.nimiKoodi ? $kaanna(data.nimiKoodi.nimi) : ''"
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

      <b-row>
        <b-col lg="8">
          <b-form-group required>
            <div v-if="isEditing" slot="label">{{$t('kappaleen-teksti')}}</div>
            <ep-content v-model="data.teksti"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>

          <hr/>
        </b-col>
      </b-row>

      <h3 class="mb-4">{{$t('tavoitteet-ja-keskeiset-sisaltoalueet')}}</h3>
      <b-row>
        <b-col lg="8">
          <EpTavoitesisaltoalueTavoitealueet v-model="data.tavoitealueet" :isEditing="isEditing"/>
        </b-col>
      </b-row>
    </template>
  </EpEditointi>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { Koodisto } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import * as _ from 'lodash';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { TavoitesisaltoalueStore } from '@/stores/TavoitesisaltoalueStore';
import EpTavoitesisaltoalueTavoitealueet from '@shared/components/EpTavoitesisaltoalue/EpTavoitesisaltoalueTavoitealueet.vue';

@Component({
  components: {
    EpEditointi,
    EpSpinner,
    EpContent,
    EpKoodistoSelect,
    EpTavoitesisaltoalueTavoitealueet,
  },
})
export default class RouteTavoitesisaltoalue extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  private store: EditointiStore | null = null;

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  @Watch('tavoitesisaltoalueId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }
    await this.fetch();
  }

  @Watch('versionumero', { immediate: true })
  async versionumeroChange() {
    await this.fetch();
  }

  public async fetch() {
    await this.perusteStore.blockUntilInitialized();
    const tkstore = new TavoitesisaltoalueStore(this.perusteId!, Number(this.tavoitesisaltoalueId), this.versionumero);
    this.store = new EditointiStore(tkstore);
  }

  private readonly tavoitesisaltoalueotsikkoKoodisto = new KoodistoSelectStore({
    koodisto: 'tavoitesisaltoalueenotsikko',
    async query(query: string, sivu = 0, koodisto: string) {
      const { data } = (await Koodisto.kaikkiSivutettuna(koodisto, query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      }));
      return data as any;
    },
  });

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  get tavoitesisaltoalueId() {
    return this.$route.params.tavoitesisaltoalueId;
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.perusteId!));
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  ::v-deep fieldset {
    padding-right: 0;
  }

  ::v-deep .input-wrapper {
    flex: 1 1 0;

    input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
</style>
