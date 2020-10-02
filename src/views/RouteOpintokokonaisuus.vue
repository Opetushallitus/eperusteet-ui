<template>
  <EpEditointi v-if="store" :store="store">
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
                    <b-button @click="open" icon="plus" variant="primary">
                      {{ $t('hae-koodistosta') }}
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </template>
            </ep-koodisto-select>
          </b-form-group>
        </b-col>

        <b-col md="2">
          <b-form-group :label="$t('minimilaajuus')  + (isEditing ? ' *' : '')" required>
            <ep-laajuus-input v-model="data.laajuus" :is-editing="isEditing" />
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

        <draggable
          v-bind="tavoitteetOptions"
          tag="div"
          v-model="data.opetuksenTavoitteet">

          <b-row v-for="(tavoite, index) in data.opetuksenTavoitteet" :key="'tavoite'+index" class="pb-2">
            <b-col cols="10" lg="8">
              <ep-input v-model="tavoite.nimi" :is-editing="isEditing" :disabled="tavoite.uri !== undefined">
                <div class="order-handle m-2" slot="left">
                  <fas icon="grip-vertical"></fas>
                </div>
              </ep-input>
            </b-col>
            <b-col cols="1" v-if="isEditing">
              <fas icon="roskalaatikko" class="default-icon clickable mt-2" @click="poista(tavoite, 'opetuksenTavoitteet')"/>
            </b-col>
          </b-row>
        </draggable>

        <ep-button variant="outline" icon="plus" @click="lisaa('opetuksenTavoitteet')" v-if="isEditing">
          {{ $t('lisaa-tavoite') }}
        </ep-button>
      </b-form-group>

      <hr/>

      <h3>{{$t('arviointi')}}</h3>

      <b-form-group :label="$t('opiskelijan-osaamisen-arvioinnin-kohteet')  + (isEditing ? ' *' : '')" required>

        <draggable
          v-bind="arvioinnitOptions"
          tag="div"
          v-model="data.arvioinnit">

          <b-row v-for="(arviointi, index) in data.arvioinnit" :key="'arviointi'+index" class="pb-2">
            <b-col cols="10" lg="8">
              <ep-input v-model="arviointi[sisaltokieli]" :is-editing="isEditing" type="string" class="flex-grow-1">
                <div class="order-handle m-2" slot="left">
                  <fas icon="grip-vertical"></fas>
                </div>
              </ep-input>
            </b-col>
            <b-col cols="1" v-if="isEditing">
              <fas icon="roskalaatikko" class="default-icon clickable mt-2" @click="poista(arviointi, 'arvioinnit')"/>
            </b-col>
          </b-row>

        </draggable>

        <ep-button variant="outline" icon="plus" @click="lisaa('arvioinnit')" v-if="isEditing">
          {{ $t('lisaa-arvioinnin-kohde') }}
        </ep-button>
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

@Component({
  components: {
    EpEditointi,
    EpSpinner,
    EpInput,
    EpContent,
    EpLaajuusInput,
    EpKoodistoSelect,
    EpButton,
    draggable,
  },
})
export default class RouteOpintokokonaisuus extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  opintokokonaisuusId!: number;

  private store: EditointiStore | null = null;

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  @Watch('opintokokonaisuusId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    await this.perusteStore.blockUntilInitialized();
    const tkstore = new OpintokokonaisuusStore(this.perusteId!, Number(id));
    this.store = new EditointiStore(tkstore);
  }

  private readonly koodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('opintokokonaisuusnimet', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  lisaa(array) {
    this.store?.setData({
      ...this.store?.data.value,
      [array]: [
        ..._.get(this.store?.data.value, array),
        {},
      ],
    });
  }

  poista(poistettavaRivi, array) {
    this.store?.setData({
      ...this.store?.data.value,
      [array]: _.filter(_.get(this.store?.data.value, array), rivi => rivi !== poistettavaRivi),
    });
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
