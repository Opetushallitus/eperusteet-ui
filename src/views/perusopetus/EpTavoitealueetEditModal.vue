<template>
  <div>
    <ep-button v-if="isEditing" micon="edit" @click="avaa" variant="link" class="muokkaa mb-3 ml-1" inherit-style>
      {{$t('muokkaa-tavoitealueita')}}
    </ep-button>

    <EpSortableTextList v-model="model.kohdealueet" :isEditing="false" group="tavoitealueet" :sortable="false">
      <template v-slot:input="{model}">
        <EpInput v-model="model.nimi" :is-editing="false">
        </EpInput>
      </template>
      <template v-slot:li="{model}">
        {{$kaanna(model.nimi)}}
      </template>
    </EpSortableTextList>

    <b-modal
      v-if="isEditing"
      id="EpSisaltoalueetEditModal"
      :title="$t('tavoitealueet-kaikilla-vuosiluokilla')"
      size="xl">

      <template slot="modal-header">
        <div class="d-flex justify-content-between w-100">
          <div>{{ $t('tavoitealueet-kaikilla-vuosiluokilla')}}</div>
          <ep-kielivalinta />
        </div>
      </template>

      <EpSortableTextList v-model="model.kohdealueet" :isEditing="true" group="tavoitealueet" :sortable="false">
        <template v-slot:input="{model}">
          <EpInput v-model="model.nimi" :is-editing="true">
          </EpInput>
        </template>
        <template v-slot:li="{model}">
          {{$kaanna(model.nimi)}}
        </template>
        <template v-slot:default>
          {{ $t('lisaa-tavoitealue') }}
        </template>
      </EpSortableTextList>

      <div slot="modal-footer">
        <ep-button @click="peruuta" variant="link">{{ $t('peruuta')}}</ep-button>
        <ep-button :showSpinner="tallennetaan" @click="tallenna">{{ $t('tallenna')}}</ep-button>
      </div>

    </b-modal>

  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpSortableTextList from '@shared/components/EpSortableTextList/EpSortableTextList.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { PerusopetusOppiaineStore } from '@/stores/PerusopetusOppiaineStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';

@Component({
  components: {
    EpSortableTextList,
    EpInput,
    EpButton,
    EpKielivalinta,
  },
})
export default class EpTavoitealueetEditModal extends Vue {
  @Prop({ required: true })
  value!: any;

  @Prop({ required: false, default: false })
  isEditing!: boolean;

  @Prop({ required: true })
  oppiaineId: any;

  @Prop({ required: true })
  perusteId: any;

  tempModel: any | null = null;
  tallennetaan: boolean = false;

  get model() {
    return this.value;
  }

  set model(val) {
    this.$emit('input', val);
  }

  avaa() {
    this.tempModel = _.cloneDeep(this.model);
    this.$bvModal.show('EpSisaltoalueetEditModal');
  }

  sulje() {
    this.tallennetaan = false;
    this.$bvModal.hide('EpSisaltoalueetEditModal');
  }

  async tallenna() {
    this.tallennetaan = true;
    try {
      this.model.kohdealueet = await PerusopetusOppiaineStore.saveTavoitealueet(this.perusteId, this.oppiaineId, this.model.kohdealueet);
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
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

  ::v-deep ul {
    padding-inline-start: 25px;
  }

  .muokkaa {
    ::v-deep .btn {
      padding-left: 0px;
    }
  }

</style>
