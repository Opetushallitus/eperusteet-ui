<template>
  <div>
    <template v-if="isEditing">
      <b-form-radio v-model="model.liittyyTyyppi" :value="EILIITY">
        {{ $t('ei-liity-toiseen-maaraykseen') }}
      </b-form-radio>
      <b-form-radio v-model="model.liittyyTyyppi" :value="MUUTTAA">
        {{ $t('muuttaa-toista-maaraysta') }}
      </b-form-radio>

      <div v-if="model.liittyyTyyppi === MUUTTAA" class="my-3 ml-4">
        <EpMaaraysLiittyyMaaraykseen v-model="model.muutettavatMaaraykset" :maarayksetNimella="maarayksetNimella" tyyppi="muuttaa"/>
      </div>

      <b-form-radio v-model="model.liittyyTyyppi" :value="KORVAA">
        {{ $t('korvaa-toisen-maarayksen') }}
      </b-form-radio>

      <div v-if="model.liittyyTyyppi === KORVAA" class="my-3 ml-4">
        <EpMaaraysLiittyyMaaraykseen v-model="model.korvattavatMaaraykset" :maarayksetNimella="maarayksetNimella" tyyppi="korvaa"/>
      </div>
    </template>
    <template v-else-if="model.muutettavatMaaraykset.length > 0 || model.korvattavatMaaraykset.length > 0">
      <ul>
        <li v-for="(muuttaa, index) in model.muutettavatMaaraykset" :key="'muuttaa' + index">
          <router-link :to="{ name: 'maaraysMuokkaus', params: { maaraysId: muuttaa.id } }">
            {{$kaanna(muuttaa.nimi)}}
          </router-link>
        </li>
        <li v-for="(korvaa, index) in model.korvattavatMaaraykset" :key="'korvaa' + index">
          <router-link :to="{ name: 'maaraysMuokkaus', params: { maaraysId: korvaa.id } }">
            {{$kaanna(korvaa.nimi)}}
          </router-link>
        </li>
      </ul>
    </template>
  </div>
</template>

<script lang="ts">
import { MaaraysDto, MaaraysDtoLiittyyTyyppiEnum, MaaraysKevytDto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpMaaraysLiittyyMaaraykseen from '@/components/maaraykset/EpMaaraysLiittyyMaaraykseen.vue';

@Component({
  components: {
    EpMaaraysLiittyyMaaraykseen,
  },
})
export default class EpMaaraysLiittyyMuuttaaValinta extends Vue {
  private EILIITY = MaaraysDtoLiittyyTyyppiEnum.EILIITY
  private MUUTTAA = MaaraysDtoLiittyyTyyppiEnum.MUUTTAA
  private KORVAA = MaaraysDtoLiittyyTyyppiEnum.KORVAA

  @Prop({ required: false })
  isEditing!: boolean;

  @Prop({ required: false, default: [] })
  maarayksetNimella!: MaaraysKevytDto[];

  @Prop({ required: true })
  value!: MaaraysDto;

  set model(val) {
    this.$emit('input', val);
  }

  get model() {
    return this.value;
  }
s
get isRequired() {
  return this.isEditing ? ' *' : '';
}
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
