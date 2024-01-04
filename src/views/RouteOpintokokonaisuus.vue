<template>
  <EpEditointi v-if="store" :store="store" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 class="m-0" v-if="data.nimiKoodi" >{{ $kaanna(data.nimiKoodi.nimi) }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing, validation }">

      <b-row>
        <b-col md="8">
          <b-form-group :label="$t('opintokokonaisuuden-nimi') + (isEditing ? ' *' : '')" required>
            <ep-koodisto-select :store="koodisto" v-model="data.nimiKoodi" :is-editing="isEditing" :naytaArvo="false">
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

        <b-col md="2">
          <b-form-group :label="$t('minimilaajuus')" required>
            <ep-laajuus-input v-model="data.minimilaajuus" :is-editing="isEditing">
              {{$t('opintopiste')}}
            </ep-laajuus-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col md="8">
          <b-form-group :label="$t('kuvaus')  + (isEditing ? ' *' : '')" required>
            <ep-content v-model="data.kuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                        :validation="validation.kuvaus"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-col>
      </b-row>

      <hr/>

      <h3>{{$t('opetuksen-tavoitteet')}}</h3>

      <b-row>
        <b-col md="8">
          <b-form-group :label="$t('tavoitteiden-otsikko')  + (isEditing ? ' *' : '')" required>
            <ep-input v-model="data.opetuksenTavoiteOtsikko" :is-editing="isEditing" :validation="validation.opetuksenTavoiteOtsikko"/>
          </b-form-group>
        </b-col>
      </b-row>

      <b-form-group :label="$t('tavoitteet')  + (isEditing ? ' *' : '')" required>

        <div v-if="isEditing">
          <draggable
            v-bind="tavoitteetOptions"
            tag="div"
            v-model="data.opetuksenTavoitteet">

            <b-row v-for="(tavoite, index) in data.opetuksenTavoitteet" :key="'tavoite'+index" class="pb-2">
              <b-col cols="10" lg="8">
                <ep-input v-model="tavoite.nimi" :is-editing="isEditing" :disabled="!tavoite.uri.startsWith('temporary')">
                  <div class="order-handle m-2" slot="left">
                    <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                  </div>
                </ep-input>
              </b-col>
              <b-col cols="1" v-if="isEditing">
                <div class="default-icon clickable mt-2" @click="poista(tavoite, 'opetuksenTavoitteet')">
                  <EpMaterialIcon icon-shape="outlined">delete</EpMaterialIcon>
                </div>
              </b-col>
            </b-row>
          </draggable>

          <ep-button v-if="isEditing" variant="outline" icon="add" @click="lisaa('opetuksenTavoitteet', 'opintokokonaisuustavoitteet')">
            {{ $t('lisaa-tavoite') }}
          </ep-button>
        </div>

        <div v-else>
          <ul>
            <li v-for="(tavoite, index) in data.opetuksenTavoitteet" :key="'tavoite'+index">
              {{$kaanna(tavoite.nimi)}}
            </li>
          </ul>
        </div>
      </b-form-group>

      <hr/>

      <h3>{{$t('arviointi')}}</h3>

      <b-form-group :label="$t('opiskelijan-osaamisen-arvioinnin-kohteet')  + (isEditing ? ' *' : '')" required>

        <div v-if="isEditing">
          <draggable
            v-bind="arvioinnitOptions"
            tag="div"
            v-model="data.arvioinnit">

            <b-row v-for="(arviointi, index) in data.arvioinnit" :key="'arviointi'+index" class="pb-2">
              <b-col cols="10" lg="8">
                <ep-input v-model="arviointi[sisaltokieli]" :is-editing="isEditing" type="string" class="flex-grow-1">
                  <div class="order-handle m-2" slot="left">
                    <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                  </div>
                </ep-input>
              </b-col>
              <b-col cols="1" v-if="isEditing">
                <div class="default-icon clickable mt-2" @click="poista(arviointi, 'arvioinnit')">
                  <EpMaterialIcon icon-shape="outlined">delete</EpMaterialIcon>
                </div>
              </b-col>
            </b-row>
          </draggable>

          <ep-button v-if="isEditing" variant="outline" icon="add" @click="lisaa('arvioinnit')">
            {{ $t('lisaa-arvioinnin-kohde') }}
          </ep-button>
        </div>

        <div v-else>
          <ul>
            <li v-for="(arviointi, index) in data.arvioinnit" :key="'arviointi'+index">
              {{$kaanna(arviointi)}}
            </li>
          </ul>
        </div>
      </b-form-group>

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
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import { Koodisto } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import draggable from 'vuedraggable';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { generateTemporaryKoodiUri } from '@shared/utils/koodi';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpEditointi,
    EpSpinner,
    EpInput,
    EpContent,
    EpLaajuusInput,
    EpKoodistoSelect,
    EpButton,
    EpMaterialIcon,
    draggable,
  },
})
export default class RouteOpintokokonaisuus extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  private store: EditointiStore | null = null;

  @Watch('opintokokonaisuusId', { immediate: true })
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
    const tkstore = new OpintokokonaisuusStore(this.perusteId!, Number(this.opintokokonaisuusId), this.versionumero);
    this.store = new EditointiStore(tkstore);
  }

  private readonly koodisto = new KoodistoSelectStore({
    koodisto: 'opintokokonaisuusnimet',
    async query(query: string, sivu = 0, koodisto: string) {
      return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  lisaa(array, koodisto?) {
    this.store?.setData({
      ...this.store?.data.value,
      [array]: [
        ..._.get(this.store?.data.value, array),
        {
          ...(koodisto && { uri: generateTemporaryKoodiUri(koodisto) }),
        },
      ],
    });
  }

  poista(poistettavaRivi, array) {
    this.store?.setData({
      ...this.store?.data.value,
      [array]: _.filter(_.get(this.store?.data.value, array), rivi => rivi !== poistettavaRivi),
    });
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  get opintokokonaisuusId() {
    return this.$route.params.opintokokonaisuusId;
  }

  get sisaltokieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get defaultDragOptions() {
    return {
      animation: 300,
      emptyInsertThreshold: 10,
      handle: '.order-handle',
      disabled: !this.store!.isEditing,
      ghostClass: 'dragged',
    };
  }
  get arvioinnitOptions() {
    return {
      ...this.defaultDragOptions,
      group: {
        name: 'arvioinnit',
      },
    };
  }

  get tavoitteetOptions() {
    return {
      ...this.defaultDragOptions,
      group: {
        name: 'tavoitteet',
      },
    };
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.perusteId!));
  }
}
</script>
