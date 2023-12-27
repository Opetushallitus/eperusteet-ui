<template>
  <b-modal class="backdrop"
           id="julkaisuModal"
           ref="julkaisuModal"
           :no-close-on-backdrop="true"
           :no-enforce-focus="true"
           :lazy="true"
           size="xl"
           :hide-footer="true">
    <template slot="modal-header">
      <div class="d-flex justify-content-between w-100">
        <div class="mt-1">{{ $t('muokkaa')}}</div>
        <EpKielivalinta/>
      </div>
    </template>

    <EpJulkaisuMuutosmaarays
      v-if="isNormaali"
      v-model="muokattavaJulkaisu"
      :muutosmaaraykset="muutosmaaraykset"/>

    <EpJulkaisuForm
      class="mt-4"
      :isLatest="isLatest"
      :store="perusteStore"
      :julkaisu="muokattavaJulkaisu"
      @setInvalid="hasRequiredData" />

    <div class="float-right">
      <EpButton @click="sulje"
                variant="link">
        {{ $t('peruuta') }}
      </EpButton>
      <EpButton @click="tallenna"
                :show-spinner="tallennetaan"
                :disabled="invalid">
        {{ $t('tallenna') }}
      </EpButton>
    </div>
  </b-modal>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpJulkaisuForm from '@/components/EpJulkaisu/EpJulkaisuForm.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpJulkaisuMuutosmaarays from '@/components/EpJulkaisu/EpJulkaisuMuutosmaarays.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';

@Component({
  components: {
    EpJulkaisuForm,
    EpButton,
    EpJulkaisuMuutosmaarays,
    EpKielivalinta,
  },
})
export default class EpJulkaisuModal extends Vue {
  @Prop({ required: true })
  private perusteStore!: PerusteStore;

  private muokattavaJulkaisu: any | null = null;
  private invalid: boolean = false;
  private tallennetaan: boolean = false;
  private isLatest: boolean = false;

  async tallenna() {
    this.tallennetaan = true;
    try {
      await this.perusteStore.updateJulkaisu({
        revision: this.muokattavaJulkaisu.revision,
        tiedote: this.muokattavaJulkaisu.tiedote || {},
        julkinenTiedote: this.muokattavaJulkaisu.julkinenTiedote || {},
        julkinen: this.muokattavaJulkaisu.julkinen,
        muutosmaaraysVoimaan: this.muokattavaJulkaisu.muutosmaaraysVoimaan,
        liitteet: this.muokattavaJulkaisu.liitteet,
        muutosmaarays: this.muokattavaJulkaisu.muutosmaarays,
      });
      this.tallennetaan = false;
      this.$success(this.$t('julkaisun-paivitys-onnistui') as string);
      this.sulje();
    }
    catch (err) {
      this.tallennetaan = false;
      this.$fail(this.$t('julkaisun-paivitys-epaonnistui') as string);
    }
  }

  sulje() {
    (this.$refs['julkaisuModal'] as any).hide();
  }

  muokkaa(julkaisu, isLatest) {
    this.isLatest = isLatest;
    this.muokattavaJulkaisu = {
      ..._.cloneDeep(julkaisu),
      liittyyMuutosmaarays: !!julkaisu.muutosmaarays,
    };
    (this.$refs['julkaisuModal'] as any).show();
  }

  hasRequiredData(value) {
    this.invalid = value;
  }

  get muutosmaaraykset() {
    return this.perusteStore.muutosmaaraykset.value;
  }

  get isNormaali() {
    return this.perusteStore.isNormaali.value;
  }
};
</script>

<style lang="scss" scoped>

</style>
