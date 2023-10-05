<template>
  <div>
    <ep-tiedosto-lataus ref="liiteLataus" :fileTypes="['application/pdf']" @input="lisaaLiite" :as-binary="true" :fileMaxSize="LIITE_MAX_KOKO" v-if="isEditing && (liitteet.length === 0 || !yksittainen)"/>

    <div class="row mt-4 ml-1" v-if="liitteet.length > 0 && !yksittainen">
      <div class="col font-weight-bold border-bottom ml-0 pl-0 pb-2">{{$t('nimi')}}</div>
      <div class="col font-weight-bold border-bottom ml-0 pl-0 pb-2">{{$t('tiedosto')}}</div>
    </div>
    <div class="row mt-2 align-items-center" v-for="(liite, index) in liitteet" :key="'liite' + index">
      <div class="col" v-if="nimisyote">
        <ep-input v-model="liite.nimi" :is-editing="isEditing"/>
      </div>
      <div class="col d-flex">
        <a v-if="liite.url" :href="liite.url" target="_blank" rel="noopener noreferrer">{{liite.tiedostonimi}}</a>
        <span v-else>{{liite.tiedostonimi}}</span>
        <div class="default-icon clickable ml-2" @click="poistaLiite(liite)" v-if="isEditing">
          <EpMaterialIcon>delete</EpMaterialIcon>
        </div>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpTiedostoLataus from '@shared/components/EpTiedostoLataus/EpTiedostoLataus.vue';
import EpMaterialIcon from '@shared/components//EpMaterialIcon/EpMaterialIcon.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { MaaraysLiiteDtoTyyppiEnum } from '@shared/api/eperusteet';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpTiedostoLataus,
    EpMaterialIcon,
    EpInput,
  },
})
export default class EpMaaraysLiitteet extends Vue {
  @Prop({ required: true })
  value!: any[];

  @Prop({ required: false })
  isEditing!: boolean;

  @Prop({ required: true })
  tyyppi!: MaaraysLiiteDtoTyyppiEnum;

  @Prop({ default: false, type: Boolean })
  private yksittainen!: Boolean;

  @Prop({ default: false, type: Boolean })
  private nimisyote!: Boolean;

  private LIITE_MAX_KOKO = 99 * 1024 * 1024;

  set model(val) {
    this.$emit('input', val);
  }

  get model() {
    return this.value;
  }

  get liitteet() {
    return _.filter(this.model, liite => liite.tyyppi === this.tyyppi);
  }

  poistaLiite(liite) {
    this.model = _.without(this.model, liite);
  }

  lisaaLiite(liite) {
    this.model = [
      ...this.model,
      {
        tiedostonimi: liite?.file?.name,
        tyyppi: this.tyyppi,
        fileB64: window.btoa(liite.binary),
        nimi: { [Kielet.getSisaltoKieli.value]: this.nimisyote ? '' : liite?.file?.name },
      },
    ];

    (this.$refs['liiteLataus'] as any).resetFile();
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
