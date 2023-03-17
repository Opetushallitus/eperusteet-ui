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
      <div class="row w-100">
        <div class="col">
          <span class="mr-2">{{ $t('muokkaa')}}</span>
        </div>
      </div>
    </template>
    <EpJulkaisuForm :store="store"
                    :julkaisu="muokattavaJulkaisu"
                    @setInvalid="hasRequiredData">
    </EpJulkaisuForm>
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

@Component({
  components: {
    EpJulkaisuForm,
    EpButton,
  },
})
export default class EpJulkaisuModal extends Vue {
  @Prop({ required: true })
  private store!: PerusteStore;

  private muokattavaJulkaisu: any | null = null;
  private invalid: boolean = false;
  private tallennetaan: boolean = false;

  async tallenna() {
    this.tallennetaan = true;
    try {
      await this.store.updateJulkaisu({
        revision: this.muokattavaJulkaisu.revision,
        tiedote: this.muokattavaJulkaisu.tiedote || {},
        julkinenTiedote: this.muokattavaJulkaisu.julkinenTiedote || {},
        julkinen: this.muokattavaJulkaisu.julkinen,
        muutosmaaraysVoimaan: this.muokattavaJulkaisu.muutosmaaraysVoimaan,
        liitteet: this.muokattavaJulkaisu.liitteet,
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

  muokkaa(julkaisu) {
    this.muokattavaJulkaisu = _.cloneDeep(julkaisu);
    (this.$refs['julkaisuModal'] as any).show();
  }

  hasRequiredData(value) {
    this.invalid = value;
  }
};
</script>

<style lang="scss" scoped>

</style>
