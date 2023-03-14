<template>
  <b-modal class="backdrop"
           id="julkaisuModal"
           ref="julkaisuModal"
           @ok="tallenna"
           :no-close-on-backdrop="true"
           :no-enforce-focus="true"
           :lazy="true"
           size="xl">
    <template slot="modal-header">
      <div class="row w-100">
        <div class="col">
          <span class="mr-2">{{ $t('muokkaa')}}</span>
        </div>
      </div>
    </template>
    <EpJulkaisuForm :store="store"
                    :julkaisu="muokattavaJulkaisu">
    </EpJulkaisuForm>
    <template slot="modal-cancel">{{ $t('peruuta') }}</template>
    <template slot="modal-ok">{{ $t('tallenna')}}</template>
  </b-modal>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpJulkaisuForm from '@/components/EpJulkaisu/EpJulkaisuForm.vue';
import { PerusteStore } from '@/stores/PerusteStore';

@Component({
  components: {
    EpJulkaisuForm,
  },
})
export default class EpJulkaisuModal extends Vue {
  @Prop({ required: true })
  private store!: PerusteStore;

  private muokattavaJulkaisu: any | null = null;

  async tallenna() {
    try {
      await this.store.updateJulkaisu({
        revision: this.muokattavaJulkaisu.revision,
        tiedote: this.muokattavaJulkaisu.tiedote || {},
        julkinenTiedote: this.muokattavaJulkaisu.julkinenTiedote || {},
        julkinen: this.muokattavaJulkaisu.julkinen,
        muutosmaaraysVoimaan: this.muokattavaJulkaisu.muutosmaaraysVoimaan,
        liitteet: this.muokattavaJulkaisu.liitteet,
      });
      this.$success(this.$t('julkaisun-paivitys-onnistui') as string);
    }
    catch (err) {
      this.$fail(this.$t('julkaisun-paivitys-epaonnistui') as string);
    }
  }

  muokkaa(julkaisu) {
    this.muokattavaJulkaisu = _.cloneDeep(julkaisu);
    (this.$refs['julkaisuModal'] as any).show();
  }
};
</script>

<style lang="scss" scoped>

</style>
