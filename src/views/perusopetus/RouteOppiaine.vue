<template>
  <EpEditointi :store="store">
    <template #header="{ data }">
      <h2 v-if="data.koodi">{{ $kaanna(data.koodi.nimi) }}</h2>
      <h2 v-else-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else class="font-italic" >
        <span v-if="!isOppimaara">{{ $t('nimeton-oppiaine') }}</span>
        <span v-if="isOppimaara">{{ $t('nimeton-oppimaara') }}</span>
      </h2>
      </template>

    <template #default="{ data, isEditing, supportData }">
      <b-row>
        <b-col cols="8" v-if="isEditing">
          <b-form-group :label="!isOppimaara ? $t('oppiaineen-nimi') : $t('oppimaaran-nimi')">
            <ep-koodisto-select :store="koodisto" v-model="data.koodi" :is-editing="isEditing" :naytaArvo="false">
              <template #default="{ open }">
                <b-input-group>
                  <b-form-input
                    :value="data.koodi ? $kaanna(data.koodi.nimi) : ''"
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
          <EpSisaltoTekstikappaleet v-model="storeData" :isEditing="isEditing" :sisaltoAvaimet="['tehtava']" />

          <b-form-group :label="$t('tavoitealueet-kaikilla-vuosiluokilla')">
            <EpTavoitealueetEditModal v-model="storeData" :isEditing="isEditing" :perusteId="perusteId" :oppiaineId="oppiaineId"/>
          </b-form-group>

          <hr/>

          <b-form-group class="mt-4 mb-4" :label="$t('vuosiluokat')" v-if="isEditing">
            <b-form-checkbox-group v-model="valitutVuosiluokkakokonaisuudet" stacked @change="vlkChange">
                <b-form-checkbox
                  v-for="(vlk, index) in valittavatVuosiluokkakokonaisuudet"
                  :value="vlk"
                  :key="'valittavaVlk' + index"
                  class="col-3 mb-1">
                  {{ vlk.nimi }}
                </b-form-checkbox>
            </b-form-checkbox-group>
          </b-form-group>

          <b-tabs v-if="valitutVuosiluokkakokonaisuudet.length > 0">
            <b-tab :title="valitutVuosiluokkakokonaisuudetById[vlk._vuosiluokkaKokonaisuus].nimi" v-for="(vlk, index) in data.vuosiluokkakokonaisuudet" :key="'vlk' + index">
              <EpOppiaineenVuosiluokkakokonaisuus
                v-model="data.vuosiluokkakokonaisuudet[index]"
                :isEditing="isEditing"
                :vuosiluokat="valitutVuosiluokkakokonaisuudetById[vlk._vuosiluokkaKokonaisuus].vuosiluokat"
                :supportData="vlkSupportData"
                :perusteId="perusteId"
                :oppiaineId="oppiaineId"/>
            </b-tab>

            <hr/>
          </b-tabs>

          <template v-if="!isOppimaara">
            <b-form-group :label="$t('oppimaarat')" v-if="!isEditing || (data.oppimaarat && data.oppimaarat.length > 0)">
              <draggable
                v-bind="oppiaineetDragOptions"
                tag="div"
                v-model="data.oppimaarat">
                  <div class="taulukko-rivi-varitys p-3 d-flex" v-for="oppimaara in data.oppimaarat" :key="'oppimaara'+oppimaara.id">
                    <div class="order-handle mr-2" v-if="isEditing">
                      <fas icon="grip-vertical" v-if="isEditing"></fas>
                    </div>
                    <div>
                      <router-link :to="{ name: 'perusopetusoppiaine', params: { oppiaineId: oppimaara.id } }">{{ $kaanna(oppimaara.nimi) || $t('nimeton-oppimaara') }}</router-link>
                    </div>
                  </div>
              </draggable>
            </b-form-group>

            <ep-button variant="outline-primary" icon="plussa" @click="lisaaOppimaara" v-if="!isEditing" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
              {{ $t('lisaa-oppimaara') }}
            </ep-button>
          </template>

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
import { PerusopetusOppiaineStore } from '@/stores/PerusopetusOppiaineStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import draggable from 'vuedraggable';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpSisaltoTekstikappaleet from '@/components/EpSisaltoTekstikappaleet.vue';
import EpOppiaineenVuosiluokkakokonaisuus from '@/views/perusopetus/EpOppiaineenVuosiluokkakokonaisuus.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpTavoitealueetEditModal from '@/views/perusopetus/EpTavoitealueetEditModal.vue';

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
    EpOppiaineenVuosiluokkakokonaisuus,
    EpTavoitealueetEditModal,
  },
})
export default class RouteOppiaine extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  oppiaineId: any;

  @Prop({ required: false })
  uusi!: 'uusi' | null;

  store: EditointiStore | null = null;

  @Watch('oppiaineId', { immediate: true })
  async oppiaineChange() {
    const store = new PerusopetusOppiaineStore(this.perusteId!, this.oppiaineId, this.perusteStore, this.uusi === 'uusi', this);
    this.store = new EditointiStore(store);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
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

  get isOppimaara() {
    return !!this.storeData?._oppiaine;
  }

  get storeData() {
    return this.store?.data.value;
  }

  set storeData(data) {
    this.store?.setData(data);
  }

  async lisaaOppimaara() {
    await PerusopetusOppiaineStore.setOppiaineKoosteinen(this.perusteId, this.oppiaineId);
    const newOppiaine = await PerusopetusOppiaineStore.create(this.perusteId, this.oppiaineId);
    await this.perusteStore.updateNavigation();
    await EditointiStore.cancelAll();
    this.$router.push({ name: 'perusopetusoppiaine', params: { oppiaineId: _.toString(newOppiaine.id), uusi: 'uusi' } });
  }

  get defaultDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
    };
  }

  get isEditing() {
    return this.store?.isEditing.value;
  }

  get valittavatVuosiluokkakokonaisuudet() {
    return _.sortBy(_.map(this.store?.supportData.value.perusteenVuosiluokkakokonaisuudet, valittavaVlk => {
      return {
        id: _.toString(valittavaVlk.id),
        vuosiluokat: _.min(this.getVuosiluokkaNumerot(valittavaVlk.vuosiluokat)) + '-' + _.max(this.getVuosiluokkaNumerot(valittavaVlk.vuosiluokat)),
        nimi: this.$t('vuosiluokat') + ' ' + _.min(this.getVuosiluokkaNumerot(valittavaVlk.vuosiluokat)) + '-' + _.max(this.getVuosiluokkaNumerot(valittavaVlk.vuosiluokat)),
      };
    }), 'nimi');
  }

  get valittavatVuosiluokkakokonaisuudetById() {
    return _.keyBy(this.valittavatVuosiluokkakokonaisuudet, 'id');
  }

  get vuosiluokkakokonaisuudet() {
    return this.store?.data.value.vuosiluokkakokonaisuudet;
  }

  get valitutVuosiluokkakokonaisuudet() {
    return _.filter(this.valittavatVuosiluokkakokonaisuudet, valittavaVlk => !!_.find(this.vuosiluokkakokonaisuudet, vlk => vlk._vuosiluokkaKokonaisuus === _.toString(valittavaVlk.id)));
  }

  get valitutVuosiluokkakokonaisuudetById() {
    return _.keyBy(this.valitutVuosiluokkakokonaisuudet, 'id');
  }

  tempVuosiluokkaChange: any[] = [];

  async vlkChange() {
    if (_.size(this.vuosiluokkakokonaisuudet) < _.size(this.tempVuosiluokkaChange)) {
      const varmistaPoisto = await this.$bvModal.msgBoxConfirm(
          this.$t('vuosiluokkakokonaisuuden-poisto-varmistus-teksti') as any, {
            title: this.$t('vahvista-poisto') as any,
            okTitle: this.$t('poista') as any,
            cancelTitle: this.$t('peruuta') as any,
            size: 'lg',
          });

      if (!varmistaPoisto) {
        this.store?.setData({
          ...this.storeData,
          vuosiluokkakokonaisuudet: this.tempVuosiluokkaChange,
        });
      }

      _.forEach(this.tempVuosiluokkaChange, async vlk => {
        if (!_.includes(this.vuosiluokkakokonaisuudet, vlk)) {
          await PerusopetusOppiaineStore.deleteOppiaineenVuosiluokkakokonaisuus(this.perusteId, this.oppiaineId, vlk);
        }
      });
    }

    _.forEach(this.vuosiluokkakokonaisuudet, async vlk => {
      if (!_.includes(this.tempVuosiluokkaChange, vlk)) {
        const tallennettu = await PerusopetusOppiaineStore.createOppiaineenVuosiluokkakokonaisuus(this.perusteId, this.oppiaineId, vlk);
        this.store?.setData({
          ...this.storeData,
          vuosiluokkakokonaisuudet: _.map(this.vuosiluokkakokonaisuudet, storeVlk => {
            if (_.get(storeVlk, '_vuosiluokkaKokonaisuus') === _.get(tallennettu, '_vuosiluokkaKokonaisuus')) {
              return tallennettu;
            }
            return storeVlk;
          }),
        });
      }
    });
  }

  set valitutVuosiluokkakokonaisuudet(valitutVlk) {
    this.tempVuosiluokkaChange = this.vuosiluokkakokonaisuudet;

    _.forEach(valitutVlk, valittuVlk => {
      if (!_.find(this.vuosiluokkakokonaisuudet, vlk => vlk._vuosiluokkaKokonaisuus === valittuVlk.id)) {
        this.store?.setData({
          ...this.storeData,
          vuosiluokkakokonaisuudet: _.sortBy([
            ...this.vuosiluokkakokonaisuudet,
            {
              _vuosiluokkaKokonaisuus: valittuVlk.id,
              vapaatTekstit: [],
              sisaltoalueinfo: {},
              tavoitteet: [],
              sisaltoalueet: [],
            },
          ], vlk => this.valittavatVuosiluokkakokonaisuudetById[vlk._vuosiluokkaKokonaisuus].nimi),
        });
      }
    });

    _.forEach(this.vuosiluokkakokonaisuudet, async poistettavaVlk => {
      if (!_.find(valitutVlk, valittuVlk => valittuVlk.id === poistettavaVlk._vuosiluokkaKokonaisuus)) {
        this.store?.setData({
          ...this.storeData,
          vuosiluokkakokonaisuudet: _.filter(this.vuosiluokkakokonaisuudet, vlk => vlk._vuosiluokkaKokonaisuus !== poistettavaVlk._vuosiluokkaKokonaisuus),
        });
      }
    });
  }

  getVuosiluokkaNumerot(vuosiluokat) {
    return _.chain(vuosiluokat)
      .map(vlk => _.split(vlk, '_')[1])
      .map(_.toNumber)
      .sortBy()
      .value();
  }

  get vlkSupportData() {
    return {
      ...this.store!.supportData.value,
      kohdealueet: this.store!.data.value.kohdealueet,
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
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

</style>
