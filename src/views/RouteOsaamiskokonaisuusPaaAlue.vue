<template>
  <EpEditointi :store="editointiStore" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 v-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else>{{ $t('nimeton-osaamiskokonaisuus_paa_alue') }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing, validation }">

      <b-row v-if="isEditing" class="mb-4">
        <b-col lg="8">
          <b-form-group :label="$t('paa-alueen-nimi') + ' *'" required>
            <ep-input v-model="data.nimi" :is-editing="isEditing">
            </ep-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col md="8">
          <b-form-group>
            <div slot="label" v-if="isEditing">
              {{$t('paa-alueen-kuvaus')}}
            </div>
            <ep-content v-model="data.kuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-col>
      </b-row>

      <hr/>

      <template v-if="isEditing">
        <h3 class="mt-4">{{$t('osa-alueet')}}</h3>
        <draggable
          v-bind="defaultDragOptions"
          tag="div"
          v-model="data.osaAlueet">

          <b-row v-for="(osaAlue, index) in data.osaAlueet" :key="'tavoite'+index" class="pb-2">
            <b-col md="8">
              <div class="d-flex">
                <div class="order-handle mr-3">
                  <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                </div>
                <EpOsaAlue v-model="data.osaAlueet[index]" :isEditing="isEditing" class="w-100">
                  <div slot="poisto">
                    <b-button variant="link" @click.stop="poistaOsaAlue(osaAlue)">
                      <EpMaterialIcon>delete</EpMaterialIcon>
                      {{ $t('poista-osa-alue') }}
                  </b-button>
                  </div>
                </EpOsaAlue>
              </div>
            </b-col>
          </b-row>
        </draggable>

        <ep-button @click="lisaaOsaalue()" variant="outline" icon="add" class="mt-2">
          {{ $t('lisaa-osa-alue') }}
        </ep-button>
      </template>

      <template v-else>
        <div v-for="(osaAlue, index) in data.osaAlueet" :key="'osa-alue' + index" class="mt-4">
          <EpOsaAlue v-model="data.osaAlueet[index]" :isEditing="isEditing"/>
          <hr v-if="index !== data.osaAlueet.length -1" />
        </div>

      </template>

    </template>
  </EpEditointi>
</template>

<script lang="ts">
import { KuvaStore } from '@/stores/KuvaStore';
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
import EpOsaAlue from '@shared/components/EpOsaamiskokonaisuus/EpOsaAlue.vue';
import { OsaamiskokonaisuusPaaAlueStore } from '@/stores/OsaamiskokonaisuusPaaAlueStore';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import draggable from 'vuedraggable';

@Component({
  components: {
    EpEditointi,
    EpInput,
    EpContent,
    EpButton,
    EpOsaAlue,
    EpMaterialIcon,
    draggable,
  },
})
export default class RouteOsaamiskokonaisuusPaaAlue extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  editointiStore: EditointiStore | null = null;

  @Prop({ required: true })
  osaamiskokonaisuusPaaAlueId!: number;

  @Watch('osaamiskokonaisuusPaaAlueId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    await this.fetch();
  }

  async fetch() {
    await this.perusteStore.blockUntilInitialized();
    const store = new OsaamiskokonaisuusPaaAlueStore(this.perusteId!, Number(this.osaamiskokonaisuusPaaAlueId), this.versionumero);
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

  async lisaaOsaalue() {
    this.editointiStore?.setData({
      ...this.editointiStore.data.value,
      osaAlueet: [
        ...this.editointiStore.data.value.osaAlueet,
        {
          tasokuvaukset: [
            {
              taso: 'VARHAISKASVATUS',
              osaamiset: [],
            },
            {
              taso: 'ESIOPETUS',
              edelleenKehittyvatOsaamiset: [],
              osaamiset: [],
            },
            {
              taso: 'VUOSILUOKKA_12',
              edelleenKehittyvatOsaamiset: [],
              osaamiset: [],
              edistynytOsaaminenKuvaukset: [],
            },
            {
              taso: 'VUOSILUOKKA_3456',
              edelleenKehittyvatOsaamiset: [],
              osaamiset: [],
              edistynytOsaaminenKuvaukset: [],
            },
            {
              taso: 'VUOSILUOKKA_789',
              edelleenKehittyvatOsaamiset: [],
              osaamiset: [],
              edistynytOsaaminenKuvaukset: [],
            },
          ],
        },
      ],
    });
  }

  async poistaOsaAlue(poistettavaOsaAlue) {
    this.editointiStore?.setData({
      ...this.editointiStore.data.value,
      osaAlueet: _.filter(this.editointiStore.data.value.osaAlueet, osaAlue => osaAlue !== poistettavaOsaAlue),
    });
  }

  get defaultDragOptions() {
    return {
      animation: 300,
      emptyInsertThreshold: 10,
      handle: '.order-handle',
      disabled: !this.editointiStore!.isEditing,
      ghostClass: 'dragged',
    };
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
