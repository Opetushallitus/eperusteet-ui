<template>
  <div>
    <ep-button v-if="isEditing" icon="edit" @click="avaa" variant="link" class="muokkaa mb-3">
      {{$t('muokkaa-sisaltoalueita')}}
    </ep-button>

    <ep-content layout="normal" v-if="model.sisaltoalueinfo && model.sisaltoalueinfo.teksti" v-model="model.sisaltoalueinfo.teksti" :is-editable="false"> </ep-content>
    <div v-for="(sisaltoalue, index) in model.sisaltoalueet" :key="'sisaltoalue' + index" class="mt-4">
      <h4>{{ $kaanna(sisaltoalue.nimi)}}</h4>
      <ep-content layout="normal" v-if="sisaltoalue.kuvaus" v-model="sisaltoalue.kuvaus" :is-editable="false"> </ep-content>
    </div>

    <b-modal
      ref="EpSisaltoalueetEditModal"
      size="xl">

      <template #modal-header>
        <div class="d-flex justify-content-between w-100">
          <div>{{ title }}</div>
          <ep-kielivalinta />
        </div>
      </template>

      <h4>{{$t('sisaltoalueen-otsikko')}}</h4>
      <ep-input v-model="model.sisaltoalueinfo.otsikko" :is-editing="true"></ep-input>

      <h4 class="mt-4">{{$t('sisaltoalueen-kuvaus')}}</h4>
      <ep-content layout="normal" v-model="model.sisaltoalueinfo.teksti" :is-editable="true"> </ep-content>

      <draggable
        v-bind="sisaltoalueetDragOptions"
        tag="div"
        v-model="model.sisaltoalueet">

        <div v-for="(sisaltoalue, index) in model.sisaltoalueet" :key="'sisaltoalue' + index" class="mt-4">
          <div class="d-flex" >
            <div class="order-handle mr-3">
              <EpMaterialIcon>drag_indicator</EpMaterialIcon>
            </div>
            <h4>{{ $t('sisaltoalueen-nimi') }}</h4>
          </div>
          <div class="ml-4">
            <ep-input v-model="sisaltoalue.nimi" :is-editing="true"></ep-input>

            <h4 class="mt-4">{{ $t('sisaltoalueen-kuvaus') }}</h4>
            <ep-content layout="normal" v-model="sisaltoalue.kuvaus" :is-editable="true"> </ep-content>
          </div>

          <div class="d-flex justify-content-between mt-1 ml-3">
            <ep-button variant="outline-primary" icon="add" v-if="model.sisaltoalueet && index+1 === model.sisaltoalueet.length" @click="lisaaSisaltoalue()">
              {{ $t('lisaa-sisaltoalue') }}
            </ep-button>
            <div v-else/>

            <ep-button variant="link" icon="delete" @click="poistaSisaltoalue(sisaltoalue)">
              {{ $t('poista-sisaltoalue') }}
            </ep-button>
          </div>
        </div>
      </draggable>

      <ep-button variant="outline-primary" icon="add" v-if="model.sisaltoalueet && model.sisaltoalueet.length === 0" @click="lisaaSisaltoalue()" class="mt-3">
        {{ $t('lisaa-sisaltoalue') }}
      </ep-button>

      <template #modal-footer>
        <div>
          <ep-button @click="peruuta" variant="link">{{ $t('peruuta')}}</ep-button>
          <ep-button :showSpinner="tallennetaan" @click="tallenna">{{ $t('tallenna')}}</ep-button>
        </div>
      </template>

    </b-modal>
  </div>
</template>

<script lang="ts">
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import draggable from 'vuedraggable';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { Kielet } from '@shared/stores/kieli';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { PerusopetusOppiaineStore } from '@/stores/PerusopetusOppiaineStore';
import { OppiaineenVuosiluokkaKokonaisuusDto } from '@shared/api/eperusteet';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    draggable,
    EpInput,
    EpButton,
    EpContent,
    EpKielivalinta,
    EpMaterialIcon,
  },
})
export default class EpSisaltoalueetEditModal extends Vue {
  @Prop({ required: true })
  value!: OppiaineenVuosiluokkaKokonaisuusDto;

  @Prop()
  vuosiluokat!: string;

  @Prop({ required: false, default: false })
  isEditing!: boolean;

  @Prop({ required: true })
  oppiaineId: any;

  @Prop({ required: true })
  perusteId: any;

  tempModel: OppiaineenVuosiluokkaKokonaisuusDto | null = null;
  tallennetaan: boolean = false;

  get model() {
    return this.value;
  }

  set model(val) {
    this.$emit('input', val);
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get title() {
    if (this.model.sisaltoalueinfo?.otsikko && this.model.sisaltoalueinfo?.otsikko[this.kieli]) {
      return this.$kaanna(this.model.sisaltoalueinfo.otsikko);
    }

    return this.$t('sisaltoalueet-vuosiluokilla-' + this.vuosiluokat);
  }

  get sisaltoalueetDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      group: {
        name: 'sisaltoalueet',
      },
    };
  }

  avaa() {
    this.tempModel = _.cloneDeep(this.model);
    (this.$refs['EpSisaltoalueetEditModal'] as any).show();
  }

  sulje() {
    this.tallennetaan = false;
    (this.$refs['EpSisaltoalueetEditModal'] as any).hide();
  }

  async tallenna() {
    this.tallennetaan = true;
    try {
      this.model = await PerusopetusOppiaineStore.updateOppiaineenVuosiluokkakokonaisuus(this.perusteId, this.oppiaineId, this.model);
      this.sulje();
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
    finally {
      this.tallennetaan = false;
    }
  }

  peruuta() {
    this.model = this.tempModel!;
    this.sulje();
  }

  lisaaSisaltoalue() {
    this.model.sisaltoalueet = [
      ...this.model.sisaltoalueet!,
      {},
    ];
  }

  poistaSisaltoalue(poistettavaSisaltoalue) {
    this.model.sisaltoalueet = _.reject(this.model.sisaltoalueet, poistettavaSisaltoalue);
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.muokkaa {
  ::v-deep .btn {
    padding-left: 0px;
  }
}

</style>
