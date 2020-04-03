<template>
  <div v-if="store">
    <EpEditointi :store="store">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">
        <div class="mt-1">
          <ep-input v-model="data.nimi" v-if="isEditing" :is-editing="true" :validation="validation.nimi"></ep-input>
        </div>
        <div :class="{ 'mt-4': isEditing }">
          <ep-content v-model="data.teksti" layout="normal" :is-editable="isEditing"></ep-content>
        </div>

        <div v-if="koodistoryhmat">
          <h3>{{$t('koodistot')}}</h3>

          <p v-if="!data.koodit && !isEditing">{{$t('tekstikappaletta-ei-ole-liitetty-koodistoihin')}}</p>

          <div v-if="isEditing">

            <div v-for="(koodistoryhma, index) in koodistoryhmat" :key="'koodistoryhma'+index">

              <h4>{{$t(koodistoryhma.ryhma)}}</h4>

              <div v-for="(koodisto, index) in koodistoryhma.koodistot" :key="'koodisto'+index">
                <h4>{{$t(koodisto)}}</h4>

                <div v-for="(koodi, index) in koodistonKoodit(koodisto)" :key="koodisto+'koodi'+index">
                  {{$kaanna(koodi.nimi)}}
                </div>

                <ep-koodisto-select :store="storet[koodisto]" @add="lisaaKoodi">
                  <template #default="{ open }">
                    <ep-button @click="open" icon="plus" variant="outline">
                      {{ $t('lisaa-'+koodisto) }}
                    </ep-button>
                  </template>
                </ep-koodisto-select>

              </div>
            </div>

          </div>
        </div>
      </template>
    </EpEditointi>
  </div>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { Koodisto } from '../../eperusteet-frontend-utils/vue/src/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import * as _ from 'lodash';

interface koodistoryhma {
  ryhma: string;
  koodistot: string[];
}

@Component({
  components: {
    EpContent,
    EpEditointi,
    EpInput,
    EpSpinner,
    EpKoodistoSelect,
    EpButton,
  },
})
export default class RouteTekstikappale extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: false })
  private koodistoryhmat!: koodistoryhma[];

  private store: EditointiStore | null = null;

  private tutkintonimikkeet = [] as any[];

  private koodit = [] as any[];
  private storet = {};

  mounted() {
    this.storet = _.chain(this.koodistoryhmat)
      .flatMap('koodistot')
      .reduceRight((result, value, key) => {
        return {
          ...result,
          [value]: this.koodistoStore(value),
        };
      }, {})
      .value();
  }

  get projektiId() {
    return this.$route.params.projektiId;
  }

  get tekstikappaleId() {
    return this.$route.params.tekstiKappaleId;
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  @Watch('tekstikappaleId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    await this.perusteStore.blockUntilInitialized();
    const tkstore = new TekstikappaleStore(this.perusteId!, Number(id));
    this.store = new EditointiStore(tkstore);
  }

  private koodistoStore(koodistoNimi) {
    return new KoodistoSelectStore({
      async query(query: string, sivu = 0) {
        return (await Koodisto.kaikkiSivutettuna(koodistoNimi, query, {
          params: {
            sivu,
            sivukoko: 10,
          },
        })).data as any;
      },
    });
  }

  koodistonKoodit(koodisto) {
    return _.chain(this.koodit)
      .filter(koodi => koodi.koodisto === koodisto)
      .map('koodi')
      .value();
  }

  lisaaKoodi(koodi) {
    this.koodit = [
      ...this.koodit,
      {
        koodi,
        koodisto: koodi.koodisto.koodistoUri,
      },
    ];
  }
}
</script>

<style lang="scss" scoped>
</style>
