<template>
  <b-modal class="backdrop"
           ref="muutosmaaraysModal"
           :no-close-on-backdrop="true"
           :no-enforce-focus="true"
           :lazy="true"
           size="xl"
           :hide-footer="true">
    <template slot="modal-header">
      <div class="d-flex justify-content-between w-100">
        <div class="mt-1">{{ otsikko }}</div>
        <EpKielivalinta/>
      </div>
    </template>

    <EpMuutosmaarays class="mb-4" v-model="muutosmaarays" :isEditing="true" :asiasanat="asiasanat"/>

    <div class="d-flex ">
      <div class="mr-auto">
        <EpButton
          v-if="muutosmaarays && muutosmaarays.id"
          @click="poista"
          variant="link"
          icon="delete"
          :show-spinner="poistetaan">
          {{ $t('poista') }}
        </EpButton>
      </div>
      <EpButton
        @click="sulje"
        variant="link">
        {{ $t('peruuta') }}
      </EpButton>
      <EpButton
        @click="tallenna"
        :show-spinner="tallennetaan"
        :disabled="!valid">
        {{ $t('tallenna-muutosmaarays') }}
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
import EpMuutosmaarays from '@/components/EpJulkaisu/EpMuutosmaarays.vue';
import { MaarayksetEditStore, requireOneLiite } from '@/stores/MaarayksetEditStore';
import { MaaraysDtoLiittyyTyyppiEnum, MaaraysDtoTilaEnum, MaaraysDtoTyyppiEnum } from '@shared/generated/eperusteet';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { Validations } from 'vuelidate-property-decorators';
import { requiredOneLang } from '@shared/validators/required';
import { required } from 'vuelidate/lib/validators';
import { Maaraykset } from '@shared/api/eperusteet';

@Component({
  components: {
    EpJulkaisuForm,
    EpButton,
    EpMuutosmaarays,
    EpKielivalinta,
  },
})
export default class EpMuutosmaaraysModal extends Vue {
  @Prop({ required: true })
  private perusteStore!: PerusteStore;

  private muutosmaarays: any | null = null;
  private tallennetaan: boolean = false;
  private poistetaan: boolean = false;
  private asiasanat: { [key: string]: string[]; } | null = null;

  async tallenna() {
    this.tallennetaan = true;
    try {
      await this.perusteStore.tallennaMuutosmaarays(this.muutosmaarays);
      this.tallennetaan = false;
      this.$success(this.$t('muutosmaarays-tallennettu') as string);
      this.sulje();
    }
    catch (err) {
      this.tallennetaan = false;
      this.$fail(this.$t('muutosmaarayksen-tallennus-epaonnistui') as string);
    }
  }

  sulje() {
    (this.$refs['muutosmaaraysModal'] as any).hide();
  }

  get otsikko() {
    if (this.muutosmaarays?.id) {
      return this.$t('muokkaa-muutosmaaraysta');
    }

    return this.$t('lisaa-muutosmaarays');
  }

  async muokkaa(muutosmaarays?) {
    if (muutosmaarays) {
      this.muutosmaarays = _.cloneDeep(muutosmaarays);
    }
    else {
      this.muutosmaarays = MaarayksetEditStore.createEmptyMaarays({
        tyyppi: MaaraysDtoTyyppiEnum.PERUSTE,
        koulutustyypit: [this.perusteStore.peruste.value?.koulutustyyppi as any],
        tila: MaaraysDtoTilaEnum.LUONNOS,
        peruste: {
          id: this.perusteStore.peruste.value?.id,
        },
        liittyyTyyppi: MaaraysDtoLiittyyTyyppiEnum.MUUTTAA,
      }) as any;
    }
    (this.$refs['muutosmaaraysModal'] as any).show();
    this.asiasanat = (await Maaraykset.getAsiasanat()).data;
  }

  async poista() {
    const poista = await this.$bvModal.msgBoxConfirm(this.$t('poista-muutosmaarays-varmistus') as any, {
      title: this.$t('poista-muutosmaarays') as any,
      okVariant: 'primary',
      okTitle: this.$t('poista') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
    });

    if (poista) {
      this.poistetaan = true;
      this.perusteStore.poistaMuutosmaarays(this.muutosmaarays);
      this.poistetaan = false;
      this.sulje();
      this.$success(this.$t('muutosmaarays-poistettu') as string);
    }
  }

  get valid() {
    return !this.$v.$invalid;
  }

  @Validations()
    validations = {
      muutosmaarays: {
        nimi: requiredOneLang(),
        diaarinumero: { required },
        voimassaoloAlkaa: { required },
        maarayspvm: { required },
        liitteet: requireOneLiite(),
      },
    }
};
</script>

<style lang="scss" scoped>

</style>
