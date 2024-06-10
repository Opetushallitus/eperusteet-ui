<template>
  <EpSpinner v-if="!asiasanat || !maarayksetNimella" />
  <div v-else>

    <EpInfoBanner class="mb-3">
      {{$t('lisaa-muutosmaarayksen-kieliversiot-samaan-muutosmaaraykseen')}}
    </EpInfoBanner>

    <b-tabs class="mb-3" v-model="tabindex">
      <b-tab v-for="kieli in kielet" :key='"kieli"+kieli' :title="$t('translatiivi-' + kieli)"/>
    </b-tabs>

    <b-form-group>
      <div slot="label" class="d-flex">
        <span>{{$t('lataa-uusi-muutosmaarays') + isRequired}}</span>
        <EpInfoPopover class="ml-2" unique-id="11">{{ $t('pdf-tiedoston-maksimikoko', { koko: fileMaxSize }) }}</EpInfoPopover>
      </div>
      <EpMaaraysLiitteet v-model="model.liitteet[kieli].liitteet" :isEditing="isEditing" :tyyppi="MAARAYSDOKUMENTTI" yksittainen/>
    </b-form-group>

    <b-form-group :label="$t('muutosmaarayksen-nimi') + isRequired" class="mt-4 w-40">
      <ep-input v-model="model.nimi" :isEditing="isEditing"/>
    </b-form-group>

    <b-form-group :label="$t('asiasana')" class="mt-4">
      <EpMaaraysAsiasanat v-model="model.asiasanat[kieli].asiasana" :asiasanat="kielenAsiasanat" :isEditing="isEditing"/>
    </b-form-group>

    <b-form-group :label="$t('kuvaus')" class="mt-4">
      <ep-content v-model="model.kuvaus" layout="simplified_w_links" :is-editable="isEditing"/>
    </b-form-group>

    <b-form-group class="mt-4">
      <div slot="label" class="d-flex">
        <span>{{$t('liitteet') + ' (pdf)'}}</span>
        <EpInfoPopover class="ml-2" unique-id="12">{{ $t('pdf-tiedoston-maksimikoko', { koko: fileMaxSize }) }}</EpInfoPopover>
      </div>
      <EpMaaraysLiitteet v-model="model.liitteet[kieli].liitteet" :isEditing="isEditing" :tyyppi="LIITE" nimisyote/>
    </b-form-group>

    <hr class="my-4"/>

    <h3>{{$t('muutosmaarayksen-kieliversioiden-yhteiset-tiedot')}}</h3>

    <b-form-group :label="$t('muutosmaarays-astuu-voimaan') + isRequired" class="mt-4 d-flex">
      <ep-datepicker v-model="model.voimassaoloAlkaa" :isEditing="isEditing" />
    </b-form-group>

    <b-form-group :label="$t('muutosmaarayksen-diaarinumero') + isRequired" class="mt-4 w-40">
      <ep-input v-model="model.diaarinumero" :isEditing="isEditing" type="string"/>
    </b-form-group>

    <b-form-group :label="$t('maarays-annettu') + isRequired" class="mt-4 d-flex">
      <ep-datepicker v-model="model.maarayspvm" :isEditing="isEditing" />
    </b-form-group>

    <b-form-group :label="$t('liittyyko-maarays-toiseen-maaraykseen') + isRequired" class="mt-4">
      <EpMaaraysLiittyyMuuttaaValinta
      v-model="model"
      :isEditing="isEditing"
      :maarayksetNimella="maarayksetNimella"
      :disabloidutValinnat="disabloidutMuuttaaValinnat"/>
    </b-form-group>

  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { MaaraysDto, MaaraysDtoLiittyyTyyppiEnum, MaaraysKevytDto, MaaraysLiiteDtoTyyppiEnum } from '@shared/api/eperusteet';
import EpMaaraysLiittyyMuuttaaValinta from '@/components/maaraykset/EpMaaraysLiittyyMuuttaaValinta.vue';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import EpMaaraysAsiasanat from '@/components/maaraykset/EpMaaraysAsiasanat.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpMaaraysLiitteet from '@/components/maaraykset/EpMaaraysLiitteet.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { Kieli } from '@shared/tyypit';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';

@Component({
  components: {
    EpInfoPopover,
    EpToggle,
    EpMaaraysLiittyyMuuttaaValinta,
    EpMaaraysAsiasanat,
    EpDatepicker,
    EpInput,
    EpMaaraysLiitteet,
    EpSpinner,
    EpContent,
  },
})
export default class EpMuutosmaarays extends Vue {
  private MAARAYSDOKUMENTTI = MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI;
  private LIITE = MaaraysLiiteDtoTyyppiEnum.LIITE;

  @Prop({ required: true })
  value!: MaaraysDto;

  @Prop({ required: false })
  isEditing!: boolean;

  @Prop({ required: true })
  asiasanat!: { [key: string]: string[]; };

  @Prop({ required: true })
  maarayksetNimella!: MaaraysKevytDto[];

  private fileMaxSize = 10;
  private tabindex = 0;

  set model(val) {
    this.$emit('input', val);
  }

  get model() {
    return this.value;
  }

  get isRequired() {
    return this.isEditing ? ' *' : '';
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get kielenAsiasanat() {
    if (!this.asiasanat || _.isEmpty(this.asiasanat[this.kieli])) {
      return [];
    }

    return this.asiasanat[this.kieli];
  }

  get disabloidutMuuttaaValinnat() {
    return [MaaraysDtoLiittyyTyyppiEnum.EILIITY];
  }

  get kielet() {
    return UiKielet;
  }

  @Watch('tabindex')
  kielivaihtui(index) {
    Kielet.setSisaltoKieli(Kieli[this.kielet[index]]);
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
