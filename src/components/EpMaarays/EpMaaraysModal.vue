<template>
  <div>
    <EpButton
      micon="add"
      variant="outline"
      v-b-modal.maarasModal
      @click="lisaaMaarays"
      v-oikeustarkastelu="{oikeus:'hallinta'}">
      {{ $t('lisaa-maarays') }}
    </EpButton>

    <b-modal ref="maaraysModal" size="lg">

      <template v-slot:modal-header>
        <div class="row w-100">
          <div class="col">
            <h2>{{ muokattavaMaarays.id ? $t('maarays') : $t('lisaa-maarays') }}</h2>
          </div>
          <div class="col text-right">
            <EpKielivalinta />
          </div>
        </div>
      </template>

      <div class="mb-5 ">
        <b-form-group :label="$t('maarayksen-nimi') + (editing ? ' *' : '')">
          <EpField v-model="muokattavaMaarays.nimi" :is-editing="editing" :validation="$v.muokattavaMaarays.nimi" :showValidValidation="false"/>
        </b-form-group>
        <b-form-group :label="$t('linkki-pdf-aan') + (editing ? ' *' : '')">
          <EpField v-model="muokattavaMaarays.url" :is-editing="editing" :validation="$v.muokattavaMaarays.url" :showValidValidation="false"/>
        </b-form-group>
      </div>

      <template v-slot:modal-footer>

        <div class="footer w-100 footer pt-2">
          <div v-if="editing" class="d-flex justify-content-end">
            <EpButton @click="sulje" variant="link">{{ $t('peruuta') }}</EpButton>
            <EpButton @click="tallenna" class="ml-3" :disabled="$v.$invalid">{{ muokattavaMaarays.id ? $t('tallenna') : $t('julkaise-maarays') }}</EpButton>
          </div>

          <div v-else class="d-flex justify-content-between">
            <div>
              <EpButton variant="link" micon="edit" @click="editing = true" v-oikeustarkastelu="{oikeus:'hallinta'}" inherit-style>
                {{ $t('muokkaa') }}
              </EpButton>
              <EpButton variant="link" micon="delete" @click="poista" v-oikeustarkastelu="{oikeus:'hallinta'}" inherit-style>
                {{ $t('poista') }}
              </EpButton>
            </div>
            <EpButton @click="sulje">{{ $t('sulje') }}</EpButton>
          </div>
        </div>

      </template>

    </b-modal>

  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { MaaraysDto } from '@shared/api/eperusteet';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import { success, fail } from '@shared/utils/notifications';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { Validations } from 'vuelidate-property-decorators';
import { requiredLokalisoituTeksti } from '@shared/validators/required';
import { MaarayksetStore } from '@/stores/MaarayksetStore';
import EpMaterialIcon from '@shared/components//EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpButton,
    EpFormContent,
    EpField,
    EpKielivalinta,
    EpMaterialIcon,
  },
})
export default class EpMaaraysModal extends Vue {
  @Prop({ required: true })
  private maarayksetStore!: MaarayksetStore

  private editing: boolean = false;
  private muokattavaMaarays: MaaraysDto | {} = {};

  lisaaMaarays() {
    this.editing = true;
    this.muokattavaMaarays = {};
    (this.$v as any).$reset();
    (this.$refs['maaraysModal'] as any).show();
  }

  sulje() {
    (this.$refs['maaraysModal'] as any).hide();
    this.editing = false;
  }

  muokkaa(maarays: MaaraysDto) {
    (this.$refs['maaraysModal'] as any).show();
    this.muokattavaMaarays = _.cloneDeep(maarays);
  }

  async poista() {
    try {
      const poista = await this.$bvModal.msgBoxConfirm(' ', {
        title: this.$t('poista-maarays-kysymys'),
        okVariant: 'primary',
        okTitle: this.$t('poista') as any,
        cancelVariant: 'link',
        cancelTitle: this.$t('peruuta') as any,
        centered: true,
        ...{} as any,
      });

      if (poista) {
        await this.maarayksetStore.poista(this.muokattavaMaarays);
        this.sulje();
        success(this.$t('poistettu') as any);
      }
    }
    catch (e) {
      fail(this.$t('virhe-palvelu-virhe') as any);
    }
  }

  async tallenna() {
    try {
      await this.maarayksetStore.tallenna(this.muokattavaMaarays);
      this.sulje();
      success(this.$t('tallennettu') as any);
    }
    catch (e) {
      fail(this.$t('virhe-palvelu-virhe') as any);
    }
  }

  @Validations()
    validations = {
      muokattavaMaarays: {
        nimi: {
          ...requiredLokalisoituTeksti(),
        },
        url: {
          ...requiredLokalisoituTeksti(),
        },
      },
    }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.footer {
  border-top: 1px solid $gray-lighten-8;
}

</style>
