<template>
  <ep-collapse class="collapsable" :collapsable="isEditing" :border-bottom="borderBottom">
    <template #header>
      <h3 v-if="isEditing" class="mt-4">{{ $t('tekstikappaleet') }}</h3>
    </template>

    <ep-collapse class="collapsable" v-for="(avain, index) in sisaltoTekstiAvaimet" :key="avain" :collapsable="!isEditing" :border-bottom="isEditing">
      <template #header>
        <h4 v-if="!isEditing">
          <span v-if="model[avain][sisaltoTekstiOtsikkoField]">{{ $kaanna(model[avain][sisaltoTekstiOtsikkoField])}}</span>
          <span v-else>{{ $t(avain)}}</span>
        </h4>
      </template>
      <h4 v-if="isEditing" class="mt-4">{{$t('tekstikappaleen-otsikko')}}</h4>
      <ep-input v-if="isEditing" v-model="model[avain][sisaltoTekstiOtsikkoField]" :is-editing="isEditing" :placeholder="$t(avain)"></ep-input>

      <h4 v-if="isEditing" class="mt-4">{{$t('tekstikappaleen-sisalto')}}</h4>
      <ep-content layout="normal" v-model="model[avain].teksti" :is-editable="isEditing"> </ep-content>

      <div class="d-flex justify-content-between mt-1" v-if="isEditing">
        <ep-button variant="outline-primary" icon="plussa" v-if="index+1 === sisaltoTekstiAvaimet.length && vapaatTekstit.length === 0" @click="lisaaTekstikappale()">
          {{ $t('lisaa-tekstikappale') }}
        </ep-button>
        <div v-else/>

        <ep-button variant="link" icon="roskalaatikko" @click="poistaSisaltoteksti(avain)">
          {{ $t('poista-tekstikappale') }}
        </ep-button>
      </div>
    </ep-collapse>

    <ep-collapse class="collapsable" v-for="(teksti, index) in model.vapaatTekstit" :key="'teksti' +index" :collapsable="!isEditing" :border-bottom="isEditing">
      <template #header>
        <h4 v-if="!isEditing">{{ $kaanna(teksti.nimi)}}</h4>
      </template>
      <h4 v-if="isEditing" class="mt-4">{{$t('tekstikappaleen-otsikko')}}</h4>
      <ep-input v-if="isEditing" v-model="teksti.nimi" :is-editing="isEditing"></ep-input>

      <h4 v-if="isEditing" class="mt-4">{{$t('tekstikappaleen-sisalto')}}</h4>
      <ep-content layout="normal" v-model="teksti.teksti" :is-editable="isEditing"> </ep-content>

      <div class="d-flex justify-content-between mt-1" v-if="isEditing">
        <ep-button variant="outline-primary" icon="plussa" v-if="index+1 === vapaatTekstit.length" @click="lisaaTekstikappale()">
          {{ $t('lisaa-tekstikappale') }}
        </ep-button>
        <div v-else/>

        <ep-button variant="link" icon="roskalaatikko" @click="poistaTeksti(teksti)">
          {{ $t('poista-tekstikappale') }}
        </ep-button>
      </div>
    </ep-collapse>

    <ep-button variant="outline-primary" icon="plussa" v-if="isEditing && sisaltoTekstiAvaimet.length === 0 && vapaatTekstit.length === 0" @click="lisaaTekstikappale()">
      {{ $t('lisaa-tekstikappale') }}
    </ep-button>

  </ep-collapse>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';

@Component({
  components: {
    EpCollapse,
    EpInput,
    EpButton,
    EpContent,
  },
})
export default class EpSisaltoTekstikappaleet extends Vue {
  @Prop({ required: true })
  value!: any;

  @Prop({ required: false, default: 'otsikko' })
  sisaltoTekstiOtsikkoField!: any;

  @Prop({ required: true })
  isEditing!: boolean;

  @Prop({ required: true })
  sisaltoAvaimet!: string[];

  get model() {
    return this.value;
  }

  set model(val) {
    this.$emit('input', val);
  }

  get sisaltoTekstiAvaimet() {
    return _.filter(this.sisaltoAvaimet, avain => !!_.get(this.model, avain));
  }

  poistaSisaltoteksti(avain) {
    this.model = {
      ...this.model,
      [avain]: null,
    };
  }

  poistaTeksti(poistettavaTeksti) {
    this.model = {
      ...this.model,
      vapaatTekstit: _.filter(this.model.vapaatTekstit, teksti => teksti !== poistettavaTeksti),
    };
  }

  lisaaTekstikappale() {
    this.model = {
      ...this.model,
      vapaatTekstit: [
        ...this.model.vapaatTekstit,
        {},
      ],
    };
  }

  get vapaatTekstit() {
    return this.model.vapaatTekstit || [];
  }

  get borderBottom() {
    return (!this.isEditing && (this.sisaltoTekstiAvaimet.length > 0 || this.model.vapaatTekstit?.length > 0)) || (this.isEditing && (this.sisaltoTekstiAvaimet.length === 0 && this.model.vapaatTekstit?.length === 0));
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
  .collapsable ::v-deep .ep-collapse {
    padding: 0 !important;
  }

</style>