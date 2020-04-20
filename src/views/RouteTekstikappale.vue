<template>
  <div v-if="store">
    <EpEditointi :store="store">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">
        <div class="mt-1" v-if="isEditing">

          <div v-if="osaamisalat.length > 0" class="mb-4">
            <h3>{{$t('osaamisalat')}}</h3>
            <ep-select :items="osaamisalat" v-model="data.osaamisala" :is-editing="true">
              <template #default="{ item }">
                {{$kaanna(item.nimi)}}
              </template>
            </ep-select>
          </div>

          <h3>{{$t('otsikko')}}</h3>
          <ep-input v-model="data.nimi" :is-editing="true" :validation="validation.nimi" :disabled="data.osaamisala"></ep-input>
          <!-- <ep-input v-else v-model="data.osaamisala.nimi" :is-editing="true" :disabled="true"></ep-input> -->

          <ep-toggle class="mt-4" v-model="data.liite">{{$t('nayta-tekstikappale-liitteena')}}</ep-toggle>
        </div>
        <div :class="{ 'mt-4': isEditing }">
          <ep-content v-model="data.teksti" layout="normal" :is-editable="isEditing"></ep-content>
        </div>

        <div v-if="koodistoryhmat" class="koodistoryhmat">
          <h3>{{$t('koodistot')}}</h3>

          <div v-if="!isEditing">
            <p v-if="(!data.koodit || data.koodit.length === 0)">{{$t('tekstikappaletta-ei-ole-liitetty-koodistoihin')}}</p>
            <p v-else>{{$t('tekstikappale-on-liitetty-koodistoihin')}}</p>
          </div>
          <div v-else>
            <p>{{$t('tekstikappale-koodisto-ohje')}} <br/>
              <router-link :to="{ name: 'perusteenTiedot' }" exact>
                {{ $t('tekstikappale-koodisto-ohje-linkki') }}
              </router-link>
            </p>
          </div>

          <div v-if="(data.koodit && data.koodit.length > 0) || isEditing">
            <div v-for="(koodistoryhma, index) in koodistot" :key="'koodistoryhma'+index" class="koodistoryhma">

              <h4>{{$t(koodistoryhma.ryhma)}}</h4>

              <div class="koodistot">
                <div v-for="(koodisto, index) in koodistoryhma.koodistot" :key="'koodisto'+index">

                  <div v-if="koodisto.koodit.length > 0 || isEditing" class="koodisto">
                    <h4>{{$t(koodisto.koodisto)}}</h4>

                    <b-table
                      sortable
                      striped
                      :fields="fields"
                      :items="koodisto.koodit"
                      v-if="koodisto.koodit.length > 0">

                      <template v-slot:cell(delete)="data">
                        <fas icon="roskalaatikko" class="roskalaatikko" @click="poistaKoodi(data.item)"/>
                      </template>

                    </b-table>

                    <ep-koodisto-select :store="storet[koodisto.koodisto]" @add="lisaaKoodit" v-if="isEditing" :multiple="true">
                      <template v-slot:koodisto>({{koodisto.koodisto}})</template>
                      <template #default="{ open }">
                        <ep-button @click="open" icon="plus" variant="outline">
                          {{ $t('lisaa-'+koodisto.koodisto) }}
                        </ep-button>
                      </template>
                    </ep-koodisto-select>
                  </div>
                </div>
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
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { Koodisto } from '../../eperusteet-frontend-utils/vue/src/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import * as _ from 'lodash';
import { KoodiDto } from '../../eperusteet-frontend-utils/vue/src/generated/eperusteet';

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
    EpToggle,
    EpSelect,
  },
})
export default class RouteTekstikappale extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: false })
  private koodistoryhmat!: koodistoryhma[];

  private store: EditointiStore | null = null;
  private storet = {};
  private oldNimi: Object | null = null;

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

  get osaamisalat() {
    return this.perusteStore.peruste.value?.osaamisalat;
  }

  get koodistot() {
    return _.chain(this.koodistoryhmat)
      .map(koodistoRyhma => {
        return {
          ryhma: koodistoRyhma.ryhma,
          koodistot: _.map(koodistoRyhma.koodistot, koodisto => {
            return {
              koodisto,
              koodit: this.koodistonKoodit(koodisto),
            };
          }),
        };
      })
      .value();
  }

  @Watch('store.data.value.osaamisala', { immediate: true })
  async onOsaamisalaChange(val, oldVal) {
    if (!oldVal) {
      this.oldNimi = this.store?.data.value.nimi;
    }
    if (!val) {
      val = { nimi: this.oldNimi };
    }
    if (!_.isEqual(val, oldVal)) {
      this.store?.setData({
        ...this.store?.data.value,
        nimi: val.nimi,
      });
    }
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
      async query(query: string, sivu = 0, onlyValidKoodis = true) {
        return (await Koodisto.kaikkiSivutettuna(koodistoNimi, query, {
          params: {
            sivu,
            sivukoko: 10,
            onlyValidKoodis: onlyValidKoodis,
          },
        })).data as any;
      },
    });
  }

  koodistonKoodit(koodisto) {
    return _.chain(this.store?.data.value.koodit)
      .filter(koodi => koodi.koodisto === koodisto)
      .value();
  }

  lisaaKoodit(koodit: any[]) {
    const kooditKoodistolla = _.chain(koodit)
      .filter(koodi => !_.includes(_.map(this.store?.data.value.koodit, 'uri'), koodi.uri))
      .map(koodi => {
        return {
          ...koodi,
          koodisto: koodi.koodisto.koodistoUri,
        };
      })
      .value();

    this.store?.setData({
      ...this.store?.data.value,
      koodit: [
        ...this.store?.data.value.koodit,
        ...kooditKoodistolla,
      ],
    });
  }

  poistaKoodi(koodi) {
    this.store?.setData({
      ...this.store?.data.value,
      koodit: _.filter(this.store?.data.value.koodit, dataKoodi => dataKoodi.uri !== koodi.uri),
    });
  }

  get fields() {
    let fields = [{
      key: 'nimi',
      label: this.$t('nimi'),
      sortable: true,
      formatter: (value, key, item) => {
        return this.$kaanna(item.nimi);
      },
    }, {
      key: 'arvo',
      sortable: true,
      label: this.$t('koodi'),
      thStyle: 'width: 10%',
    }];

    if (this.store?.isEditing.value) {
      return [
        ...fields,
        {
          key: 'delete',
          label: '',
          sortable: false,
          thClass: 'border-0',
          thStyle: 'width: 1%',
        },
      ];
    }

    return fields;
  }
}
</script>

<style lang="scss" scoped>
  @import "@shared/styles/_variables.scss";

  .koodistoryhmat {
    margin-top: 50px;

    .koodistoryhma {
      margin-top: 30px;

      .koodistot {
        padding: 20px;
        border: 1px solid $gray-lighten-4;

        .koodisto {
          margin-bottom: 30px;

          .roskalaatikko {
            color: $paletti-blue;
            cursor: pointer;
            margin: 0px 10px;
          }

        }
      }

    }

  }

</style>
