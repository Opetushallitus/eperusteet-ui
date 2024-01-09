<template>
  <EpSpinner v-if="!asiasanat || !maarayksetNimella" />
  <div v-else>
    <b-form-group :label="$t('lataa-uusi-muutosmaarays') + isRequired" class="w-40">
        <EpMaaraysLiitteet v-model="model.liitteet[kieli].liitteet" :isEditing="isEditing" :tyyppi="MAARAYSDOKUMENTTI" yksittainen/>
      </b-form-group>

      <b-form-group :label="$t('muutosmaarays-astuu-voimaan') + isRequired" class="mt-4 d-flex">
        <ep-datepicker v-model="model.voimassaoloAlkaa" :isEditing="isEditing" />
      </b-form-group>

      <b-form-group :label="$t('muutosmaarayksen-nimi') + isRequired" class="mt-4 w-40">
        <ep-input v-model="model.nimi" :isEditing="isEditing"/>
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

      <b-form-group :label="$t('asiasana')" class="mt-4">
        <EpMaaraysAsiasanat v-model="model.asiasanat[kieli].asiasana" :asiasanat="kielenAsiasanat" :isEditing="isEditing"/>
      </b-form-group>

      <b-form-group :label="$t('kuvaus')" class="mt-4">
        <ep-content v-model="model.kuvaus" layout="simplified_w_links" :is-editable="isEditing"/>
      </b-form-group>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, ProvideReactive, Vue } from 'vue-property-decorator';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { Maaraykset, MaaraysDto, MaaraysDtoLiittyyTyyppiEnum, MaaraysKevytDto, MaaraysLiiteDtoTyyppiEnum } from '@shared/api/eperusteet';
import EpMaaraysLiittyyMuuttaaValinta from '@/components/maaraykset/EpMaaraysLiittyyMuuttaaValinta.vue';
import { Kielet } from '@shared/stores/kieli';
import EpMaaraysAsiasanat from '@/components/maaraykset/EpMaaraysAsiasanat.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpMaaraysLiitteet from '@/components/maaraykset/EpMaaraysLiitteet.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';

@Component({
  components: {
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

  @Prop({ required: true })
  value!: MaaraysDto;

  @Prop({ required: false })
  isEditing!: boolean;

  @Prop({ required: true })
  asiasanat!: { [key: string]: string[]; };

  @Prop({ required: true })
  maarayksetNimella!: MaaraysKevytDto[];

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
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
