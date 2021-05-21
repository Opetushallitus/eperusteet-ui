<template>
  <EpEditointi v-if="store" :store="store">
    <template v-slot:header="{ data }">
      <h2 class="m-0" v-if="data.nimiKoodi" >{{ $kaanna(data.nimiKoodi.nimi) }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing, validation }">

      <b-row v-if="isEditing" class="mb-4">
        <b-col lg="8">
          <b-form-group :label="$t('otsikko') + (isEditing ? ' *' : '')" required>
            <ep-koodisto-select :store="laajaalainenOsaaminenKoodisto" v-model="data.nimiKoodi" :is-editing="isEditing" :naytaArvo="false">
              <template #default="{ open }">
                <b-input-group>
                  <b-form-input
                    :value="data.nimiKoodi ? $kaanna(data.nimiKoodi.nimi) : ''"
                    disabled></b-form-input>
                  <b-input-group-append>
                    <b-button @click="open" icon="plus" variant="primary">
                      {{ $t('hae-koodistosta') }}
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </template>
            </ep-koodisto-select>
          </b-form-group>
        </b-col>
      </b-row>

      <ep-toggle v-if="isEditing" class="my-4" v-model="data.liite">{{$t('nayta-laaja-alainen-osaaminen-liitteena')}}</ep-toggle>

      <b-row>
        <b-col lg="8">
          <b-form-group required>
            <ep-content v-model="data.teksti"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
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
import { LaajaalainenOsaaminenStore } from '@/stores/LaajaalainenOsaaminenStore';
import EpToggle from '@shared/components/forms/EpToggle.vue';

@Component({
  components: {
    EpEditointi,
    EpSpinner,
    EpContent,
    EpKoodistoSelect,
    EpToggle,
  },
})
export default class RouteLaajaalainenOsaaminen extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  laajaalainenosaaminenId!: number;

  private store: EditointiStore | null = null;

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  @Watch('laajaalainenosaaminenId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    await this.perusteStore.blockUntilInitialized();
    const tkstore = new LaajaalainenOsaaminenStore(this.perusteId!, Number(id));
    this.store = new EditointiStore(tkstore);
  }

  private readonly laajaalainenOsaaminenKoodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      const { data } = (await Koodisto.kaikkiSivutettuna('tutkintokoulutukseenvalmentavakoulutuslaajaalainenosaaminen', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      }));
      return data as any;
    },
  });

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
    padding-right: 0px;
  }

  ::v-deep .input-wrapper {
    flex: 1 1 0%;

    input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
</style>
